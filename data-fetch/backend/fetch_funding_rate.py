"""
Fetch realized funding rate data from Gate.io futures API for a given date and symbol.
Saves result as parquet in data/ folder.

Usage:
    python fetch_funding_rate.py --date 2025-01-15 --symbol BTC_USDT [--settle usdt]
"""

import argparse
import os
from datetime import datetime, timezone, timedelta

import pandas as pd
import requests

API_BASE = "https://api.gateio.ws/api/v4"
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def fetch_funding_rate(date_str: str, symbol: str, settle: str = "usdt") -> pd.DataFrame:
    dt = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    from_ts = int(dt.timestamp())
    to_ts = int((dt + timedelta(days=1)).timestamp())

    url = f"{API_BASE}/futures/{settle}/funding_rate"
    params = {
        "contract": symbol,
        "from": from_ts,
        "to": to_ts,
        "limit": 100,
    }

    resp = requests.get(url, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    if not data:
        print(f"[funding] No data for {symbol} on {date_str}")
        return pd.DataFrame()

    df = pd.DataFrame(data)
    df["t"] = pd.to_datetime(df["t"], unit="s", utc=True)
    df["r"] = df["r"].astype(float)

    df = df.rename(columns={
        "t": "timestamp",
        "r": "funding_rate",
    })

    return df


def save(df: pd.DataFrame, date_str: str, symbol: str):
    if df.empty:
        return
    os.makedirs(DATA_DIR, exist_ok=True)
    path = os.path.join(DATA_DIR, f"funding_{symbol}_{date_str}.parquet")
    df.to_parquet(path, index=False)
    print(f"[funding] Saved {len(df)} rows -> {path}")


def main():
    parser = argparse.ArgumentParser(description="Fetch Gate.io futures funding rate data")
    parser.add_argument("--date", required=True, help="Date in YYYY-MM-DD (UTC)")
    parser.add_argument("--symbol", required=True, help="Contract symbol, e.g. BTC_USDT")
    parser.add_argument("--settle", default="usdt", help="Settlement currency (default: usdt)")
    args = parser.parse_args()

    df = fetch_funding_rate(args.date, args.symbol, args.settle)
    save(df, args.date, args.symbol)


if __name__ == "__main__":
    main()
