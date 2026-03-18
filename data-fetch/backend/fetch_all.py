"""
Orchestrator script: fetches OHLCV, funding rate, trades, and settlement prices data
for a list of symbols across a date range.

Usage:
    python fetch_all.py --start 2025-01-01 --end 2025-01-31 --symbols BTC_USDT,ETH_USDT [--settle usdt] [--interval 1h]
"""

import argparse
import subprocess
import sys
from datetime import datetime, timedelta


def date_range(start: str, end: str):
    current = datetime.strptime(start, "%Y-%m-%d")
    end_dt = datetime.strptime(end, "%Y-%m-%d")
    while current <= end_dt:
        yield current.strftime("%Y-%m-%d")
        current += timedelta(days=1)


def run_script(script: str, date: str, symbol: str, settle: str, extra_args: list[str] | None = None):
    cmd = [sys.executable, script, "--date", date, "--symbol", symbol, "--settle", settle]
    if extra_args:
        cmd.extend(extra_args)
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout, end="")
    if result.returncode != 0:
        print(f"[ERROR] {script} failed for {symbol} {date}: {result.stderr.strip()}")


def main():
    parser = argparse.ArgumentParser(description="Fetch Gate.io data for multiple symbols and dates")
    parser.add_argument("--start", required=True, help="Start date YYYY-MM-DD (inclusive)")
    parser.add_argument("--end", required=True, help="End date YYYY-MM-DD (inclusive)")
    parser.add_argument("--symbols", required=True, help="Comma-separated list of symbols, e.g. BTC_USDT,ETH_USDT")
    parser.add_argument("--settle", default="usdt", help="Settlement currency (default: usdt)")
    parser.add_argument("--interval", default="1h", help="OHLCV candle interval (default: 1h)")
    args = parser.parse_args()

    symbols = [s.strip() for s in args.symbols.split(",")]
    dates = list(date_range(args.start, args.end))

    total = len(symbols) * len(dates) * 4
    done = 0

    for symbol in symbols:
        for date in dates:
            run_script("fetch_ohlcv.py", date, symbol, args.settle, ["--interval", args.interval])
            done += 1

            run_script("fetch_funding_rate.py", date, symbol, args.settle)
            done += 1

            run_script("fetch_trades.py", date, symbol, args.settle)
            done += 1

            run_script("fetch_settlement_prices.py", date, symbol, args.settle)
            done += 1

            print(f"--- Progress: {done}/{total} ---")


if __name__ == "__main__":
    main()
