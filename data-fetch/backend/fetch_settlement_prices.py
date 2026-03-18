"""
Lightweight fetch: get the last trade price before each funding rate settlement
time (00:00, 08:00, 16:00 UTC) for a given date and symbol.

Only 3 API requests per day — much faster than fetching all trades.

Saves result as parquet in data/ folder with prefix 'settlement_prices_'.

Usage:
    python fetch_settlement_prices.py --date 2025-01-15 --symbol BTC_USDT [--settle usdt]
"""

import argparse
import os
import time as _time
from datetime import datetime, timezone, timedelta

import pandas as pd
import requests

API_BASE = "https://api.gateio.ws/api/v4"
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

SETTLEMENT_HOURS = [0, 8, 16]


def _request_trades(symbol: str, settle: str, params: dict) -> list[dict] | None:
    """Single request with retry logic. Returns list of trades or None on total failure."""
    url = f"{API_BASE}/futures/{settle}/trades"
    for attempt in range(6):
        try:
            resp = requests.get(url, params=params, timeout=30)
            if resp.status_code == 429:
                wait = min(2 ** (attempt + 2), 120)
                print(f"  [429] Rate limited, waiting {wait}s", flush=True)
                _time.sleep(wait)
                continue
            resp.raise_for_status()
            return resp.json()
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
            wait = min(2 ** (attempt + 3), 120)
            print(f"  [retry] {type(e).__name__}, waiting {wait}s (attempt {attempt + 1}/6)", flush=True)
            _time.sleep(wait)
    return None


# Expanding windows: try 1s, 10s, 1min, 5min, 30min, 2h, 8h
SEARCH_WINDOWS = [1, 10, 60, 300, 1800, 7200, 28800]


def fetch_last_trade_before(symbol: str, settle: str, ts: int) -> dict | None:
    """Fetch the most recent trade before a timestamp, expanding the search window if needed."""
    # First try: no 'from', just 'to' with limit=1 (gets the most recent trade before ts)
    data = _request_trades(symbol, settle, {"contract": symbol, "to": ts, "limit": 1})
    if data:
        return data[0]

    # If that returned nothing, try expanding windows backwards
    for window in SEARCH_WINDOWS:
        from_ts = ts - window
        print(f"  [search] Expanding window to {window}s before settlement", flush=True)
        data = _request_trades(symbol, settle, {
            "contract": symbol, "from": from_ts, "to": ts, "limit": 1,
        })
        if data:
            return data[0]

    return None


def fetch_settlement_prices(date_str: str, symbol: str, settle: str = "usdt") -> pd.DataFrame:
    dt = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    rows = []

    for hour in SETTLEMENT_HOURS:
        settlement_ts = int((dt + timedelta(hours=hour)).timestamp())
        trade = fetch_last_trade_before(symbol, settle, settlement_ts)
        if trade is None:
            print(f"  [settlement] No trade before {date_str} {hour:02d}:00 for {symbol}")
            continue

        rows.append({
            "settlement_time": pd.Timestamp(settlement_ts, unit="s", tz="UTC"),
            "trade_time": pd.Timestamp(float(trade["create_time_ms"]), unit="s", tz="UTC"),
            "price": float(trade["price"]),
            "trade_id": trade["id"],
        })
        print(f"  [settlement] {symbol} {date_str} {hour:02d}:00 UTC -> price={trade['price']}")

    if not rows:
        print(f"[settlement] No data for {symbol} on {date_str}")
        return pd.DataFrame()

    return pd.DataFrame(rows)


def save(df: pd.DataFrame, date_str: str, symbol: str):
    if df.empty:
        return
    os.makedirs(DATA_DIR, exist_ok=True)
    path = os.path.join(DATA_DIR, f"settlement_prices_{symbol}_{date_str}.parquet")
    df.to_parquet(path, index=False)
    print(f"[settlement] Saved {len(df)} rows -> {path}")


def main():
    parser = argparse.ArgumentParser(description="Fetch last trade price before each funding settlement")
    parser.add_argument("--date", required=True, help="Date in YYYY-MM-DD (UTC)")
    parser.add_argument("--symbol", required=True, help="Contract symbol, e.g. BTC_USDT")
    parser.add_argument("--settle", default="usdt", help="Settlement currency (default: usdt)")
    args = parser.parse_args()

    df = fetch_settlement_prices(args.date, args.symbol, args.settle)
    save(df, args.date, args.symbol)


if __name__ == "__main__":
    main()
