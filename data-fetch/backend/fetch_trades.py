"""
Fetch tick-by-tick trades from Gate.io futures API for a given date and symbol.
Saves result as parquet in data/ folder.

Paginates using offset within small time windows to handle the 1000-per-request limit.

Usage:
    python fetch_trades.py --date 2026-03-15 --symbol BTC_USDT [--settle usdt]
"""

import argparse
import os
import time
from datetime import datetime, timezone, timedelta

import pandas as pd
import requests

API_BASE = "https://api.gateio.ws/api/v4"
LIMIT = 1000
WINDOW_SECONDS = 60  # 1-minute windows to stay under 1000 trades per request
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def fetch_trades_window(symbol: str, settle: str, from_ts: int, to_ts: int) -> list[dict]:
    """Fetch all trades in a time window, paginating with offset if needed."""
    url = f"{API_BASE}/futures/{settle}/trades"
    all_trades = []
    offset = 0

    while True:
        params = {
            "contract": symbol,
            "from": from_ts,
            "to": to_ts,
            "limit": LIMIT,
            "offset": offset,
        }
        resp = requests.get(url, params=params, timeout=30)
        if resp.status_code == 429:
            time.sleep(1)
            continue
        resp.raise_for_status()
        data = resp.json()
        if not data:
            break
        all_trades.extend(data)
        if len(data) < LIMIT:
            break
        offset += LIMIT

    return all_trades


def fetch_trades(date_str: str, symbol: str, settle: str = "usdt") -> pd.DataFrame:
    dt = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    day_start = int(dt.timestamp())
    day_end = int((dt + timedelta(days=1)).timestamp())

    all_trades = []
    current = day_start
    total_windows = (day_end - day_start) // WINDOW_SECONDS

    window_idx = 0
    while current < day_end:
        window_end = min(current + WINDOW_SECONDS, day_end)
        trades = fetch_trades_window(symbol, settle, current, window_end)
        all_trades.extend(trades)
        current = window_end
        window_idx += 1
        if window_idx % 120 == 0:
            print(f"  [trades] {symbol} {date_str}: {window_idx}/{total_windows} windows, {len(all_trades)} trades so far")

    if not all_trades:
        print(f"[trades] No data for {symbol} on {date_str}")
        return pd.DataFrame()

    df = pd.DataFrame(all_trades)
    df = df.drop_duplicates(subset=["id"])
    df["create_time_ms"] = pd.to_datetime(df["create_time_ms"], unit="s", utc=True)
    df["price"] = df["price"].astype(float)
    df = df.rename(columns={
        "create_time_ms": "timestamp",
        "size": "size_contracts",
    })
    df = df[["id", "timestamp", "price", "size_contracts", "contract"]].sort_values("id").reset_index(drop=True)

    return df


def save(df: pd.DataFrame, date_str: str, symbol: str):
    if df.empty:
        return
    os.makedirs(DATA_DIR, exist_ok=True)
    path = os.path.join(DATA_DIR, f"trades_{symbol}_{date_str}.parquet")
    df.to_parquet(path, index=False)
    print(f"[trades] Saved {len(df)} rows -> {path}")


def main():
    parser = argparse.ArgumentParser(description="Fetch Gate.io futures trades (tick-by-tick)")
    parser.add_argument("--date", required=True, help="Date in YYYY-MM-DD (UTC)")
    parser.add_argument("--symbol", required=True, help="Contract symbol, e.g. BTC_USDT")
    parser.add_argument("--settle", default="usdt", help="Settlement currency (default: usdt)")
    args = parser.parse_args()

    df = fetch_trades(args.date, args.symbol, args.settle)
    save(df, args.date, args.symbol)


if __name__ == "__main__":
    main()
