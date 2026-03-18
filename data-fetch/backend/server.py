"""
FastAPI backend that serves OHLCV + funding rate data.
Fetches from Gate.io on cache miss (parquet files in data/).
Falls back to aggregating trades into candles when OHLCV endpoint
rejects old dates.

Run: uvicorn server:app --reload --port 8000
"""

import os
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import time as _time

import requests as _requests

from fetch_ohlcv import fetch_ohlcv, save as save_ohlcv
from fetch_funding_rate import fetch_funding_rate, save as save_funding
from fetch_settlement_prices import fetch_settlement_prices, save as save_settlement

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
ALLOWED_SYMBOLS = {"BTC_USDT", "ETH_USDT", "SOL_USDT"}
MAX_DAYS = 1825

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def date_range(start: str, end: str) -> list[str]:
    current = datetime.strptime(start, "%Y-%m-%d")
    end_dt = datetime.strptime(end, "%Y-%m-%d")
    dates = []
    while current <= end_dt:
        dates.append(current.strftime("%Y-%m-%d"))
        current += timedelta(days=1)
    return dates


API_BASE = "https://api.gateio.ws/api/v4"


def fetch_all_trades_window(symbol: str, settle: str, from_ts: int, to_ts: int) -> list[dict]:
    """Fetch ALL trades in a time window, paginating with offset."""
    url = f"{API_BASE}/futures/{settle}/trades"
    all_trades: list[dict] = []
    offset = 0

    MIN_INTERVAL = 0.15

    page = 0
    while True:
        t0 = _time.monotonic()
        print(f"    [page {page}] offset={offset} requesting...", flush=True)
        for attempt in range(6):
            try:
                t_req = _time.monotonic()
                resp = _requests.get(url, params={
                    "contract": symbol, "from": from_ts, "to": to_ts,
                    "limit": 1000, "offset": offset,
                }, timeout=30)
                t_resp = _time.monotonic()
                print(f"    [page {page}] HTTP {resp.status_code} in {t_resp - t_req:.3f}s", flush=True)
                if resp.status_code == 429:
                    wait = min(2 ** (attempt + 2), 120)
                    print(f"    [429] Rate limited, waiting {wait}s", flush=True)
                    _time.sleep(wait)
                    continue
                resp.raise_for_status()
                break
            except (_requests.exceptions.ConnectionError, _requests.exceptions.Timeout) as e:
                wait = min(2 ** (attempt + 3), 120)
                print(f"    [retry] {type(e).__name__}, waiting {wait}s (attempt {attempt + 1}/6)", flush=True)
                _time.sleep(wait)
        else:
            print(f"    [error] Gave up after 6 retries for offset={offset}", flush=True)
            break

        t_parse = _time.monotonic()
        batch = resp.json()
        t_done = _time.monotonic()
        print(f"    [page {page}] {len(batch)} trades, parse={t_done - t_parse:.3f}s, total={t_done - t0:.3f}s", flush=True)

        if not batch:
            break
        all_trades.extend(batch)
        if len(batch) < 1000:
            break
        offset += 1000
        page += 1

        # Only sleep the remainder if the request was faster than MIN_INTERVAL
        elapsed = _time.monotonic() - t0
        if elapsed < MIN_INTERVAL:
            _time.sleep(MIN_INTERVAL - elapsed)

    print(f"    [done] {len(all_trades)} total trades in window", flush=True)
    return all_trades


def ohlcv_from_trades(date_str: str, symbol: str, settle: str = "usdt") -> pd.DataFrame:
    """Build 1h OHLCV candles from ALL trades in a day (24 paginated windows)."""
    from datetime import timezone
    dt = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    day_start = int(dt.timestamp())

    rows = []
    for h in range(24):
        h_start = day_start + h * 3600
        h_end = h_start + 3600
        trades = fetch_all_trades_window(symbol, settle, h_start, h_end)
        if not trades:
            continue
        prices = [float(t["price"]) for t in trades]
        sizes = [abs(t["size"]) for t in trades]
        vol_quote = sum(p * s for p, s in zip(prices, sizes))
        ts = pd.Timestamp(h_start, unit="s", tz="UTC")
        # API returns newest first → last element is the open, first is the close
        rows.append({
            "timestamp": ts,
            "open": prices[-1],
            "high": max(prices),
            "low": min(prices),
            "close": prices[0],
            "volume_contracts": sum(sizes),
            "volume_quote": vol_quote,
        })
        print(f"  [fallback] {symbol} {date_str} {h:02d}:00 — {len(trades)} trades")

    if not rows:
        return pd.DataFrame()
    return pd.DataFrame(rows)


def ensure_ohlcv(symbol: str, date_str: str):
    """Try OHLCV endpoint first, fall back to trades aggregation (24 reqs)."""
    ohlcv_path = os.path.join(DATA_DIR, f"ohlcv_{symbol}_{date_str}.parquet")
    if os.path.exists(ohlcv_path):
        return

    try:
        df = fetch_ohlcv(date_str, symbol)
        if not df.empty:
            save_ohlcv(df, date_str, symbol)
            return
    except Exception as e:
        print(f"[ohlcv] API failed for {symbol} {date_str}: {e}, falling back to trades")

    # Fallback: aggregate ALL trades per hour (24 paginated windows)
    print(f"[ohlcv] Fallback: building candles from trades for {symbol} {date_str}...")
    ohlcv_df = ohlcv_from_trades(date_str, symbol)
    if not ohlcv_df.empty:
        os.makedirs(DATA_DIR, exist_ok=True)
        ohlcv_df.to_parquet(ohlcv_path, index=False)
        print(f"[ohlcv] Saved {len(ohlcv_df)} candles -> {ohlcv_path}")
    else:
        print(f"[ohlcv] No trades for {symbol} on {date_str}")


def ensure_settlement(symbol: str, date_str: str):
    path = os.path.join(DATA_DIR, f"settlement_prices_{symbol}_{date_str}.parquet")
    if os.path.exists(path):
        return
    try:
        df = fetch_settlement_prices(date_str, symbol)
        save_settlement(df, date_str, symbol)
    except Exception as e:
        print(f"[settlement] Failed for {symbol} {date_str}: {e}")


def ensure_funding(symbol: str, date_str: str):
    funding_path = os.path.join(DATA_DIR, f"funding_{symbol}_{date_str}.parquet")
    if os.path.exists(funding_path):
        return

    try:
        df = fetch_funding_rate(date_str, symbol)
        save_funding(df, date_str, symbol)
    except Exception as e:
        print(f"[funding] Failed for {symbol} {date_str}: {e}")


def load_data(symbol: str, dates: list[str]) -> dict:
    ohlcv_frames = []
    funding_frames = []
    settlement_frames = []

    for d in dates:
        ohlcv_path = os.path.join(DATA_DIR, f"ohlcv_{symbol}_{d}.parquet")
        funding_path = os.path.join(DATA_DIR, f"funding_{symbol}_{d}.parquet")
        settlement_path = os.path.join(DATA_DIR, f"settlement_prices_{symbol}_{d}.parquet")

        if os.path.exists(ohlcv_path):
            ohlcv_frames.append(pd.read_parquet(ohlcv_path))
        if os.path.exists(funding_path):
            funding_frames.append(pd.read_parquet(funding_path))
        if os.path.exists(settlement_path):
            settlement_frames.append(pd.read_parquet(settlement_path))

    ohlcv = pd.concat(ohlcv_frames, ignore_index=True) if ohlcv_frames else pd.DataFrame()
    funding = pd.concat(funding_frames, ignore_index=True) if funding_frames else pd.DataFrame()
    settlement = pd.concat(settlement_frames, ignore_index=True) if settlement_frames else pd.DataFrame()

    if ohlcv.empty and settlement.empty:
        return {"ohlcv": [], "funding": [], "settlement_prices": []}

    ohlcv_records = []
    if not ohlcv.empty:
        ohlcv = ohlcv.sort_values("timestamp").reset_index(drop=True)
        ohlcv["timestamp"] = ohlcv["timestamp"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        ohlcv = ohlcv.replace({np.nan: None})
        ohlcv_records = ohlcv.to_dict(orient="records")

    funding_records = []
    if not funding.empty:
        funding = funding.sort_values("timestamp").reset_index(drop=True)
        funding["timestamp"] = funding["timestamp"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        funding_records = funding.to_dict(orient="records")

    settlement_records = []
    if not settlement.empty:
        settlement = settlement.sort_values("settlement_time").reset_index(drop=True)
        settlement["settlement_time"] = settlement["settlement_time"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        settlement["trade_time"] = settlement["trade_time"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        settlement_records = settlement.to_dict(orient="records")

    return {"ohlcv": ohlcv_records, "funding": funding_records, "settlement_prices": settlement_records}


@app.get("/api/data")
def get_data(
    symbol: str = Query(..., description="e.g. BTC_USDT"),
    start: str = Query(..., description="YYYY-MM-DD"),
    end: str = Query(..., description="YYYY-MM-DD"),
):
    if symbol not in ALLOWED_SYMBOLS:
        raise HTTPException(400, f"Symbol must be one of {ALLOWED_SYMBOLS}")

    try:
        dates = date_range(start, end)
    except ValueError:
        raise HTTPException(400, "Invalid date format. Use YYYY-MM-DD")

    if len(dates) > MAX_DAYS:
        raise HTTPException(400, f"Date range cannot exceed {MAX_DAYS} days")

    for d in dates:
        ensure_ohlcv(symbol, d)
        ensure_funding(symbol, d)
        ensure_settlement(symbol, d)

    return load_data(symbol, dates)


def load_data_lite(symbol: str, dates: list[str]) -> dict:
    funding_frames = []
    settlement_frames = []

    for d in dates:
        funding_path = os.path.join(DATA_DIR, f"funding_{symbol}_{d}.parquet")
        settlement_path = os.path.join(DATA_DIR, f"settlement_prices_{symbol}_{d}.parquet")

        if os.path.exists(funding_path):
            funding_frames.append(pd.read_parquet(funding_path))
        if os.path.exists(settlement_path):
            settlement_frames.append(pd.read_parquet(settlement_path))

    funding = pd.concat(funding_frames, ignore_index=True) if funding_frames else pd.DataFrame()
    settlement = pd.concat(settlement_frames, ignore_index=True) if settlement_frames else pd.DataFrame()

    if settlement.empty:
        return {"funding": [], "settlement_prices": []}

    funding_records = []
    if not funding.empty:
        funding = funding.sort_values("timestamp").reset_index(drop=True)
        funding["timestamp"] = funding["timestamp"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        funding_records = funding.to_dict(orient="records")

    settlement = settlement.sort_values("settlement_time").reset_index(drop=True)
    settlement["settlement_time"] = settlement["settlement_time"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    settlement["trade_time"] = settlement["trade_time"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    settlement_records = settlement.to_dict(orient="records")

    return {"funding": funding_records, "settlement_prices": settlement_records}


@app.get("/api/data-lite")
def get_data_lite(
    symbol: str = Query(..., description="e.g. BTC_USDT"),
    start: str = Query(..., description="YYYY-MM-DD"),
    end: str = Query(..., description="YYYY-MM-DD"),
):
    if symbol not in ALLOWED_SYMBOLS:
        raise HTTPException(400, f"Symbol must be one of {ALLOWED_SYMBOLS}")

    try:
        dates = date_range(start, end)
    except ValueError:
        raise HTTPException(400, "Invalid date format. Use YYYY-MM-DD")

    if len(dates) > MAX_DAYS:
        raise HTTPException(400, f"Date range cannot exceed {MAX_DAYS} days")

    for d in dates:
        ensure_funding(symbol, d)
        ensure_settlement(symbol, d)

    return load_data_lite(symbol, dates)
