"""
Gate.io Latency Test Suite
Tests REST API round-trip and WebSocket market data latency.

Usage:
  # Basic test (no API key needed):
  python latency_test.py

  # With order test (needs API key):
  python latency_test.py --api-key YOUR_KEY --api-secret YOUR_SECRET

  # Custom settings:
  python latency_test.py --samples 200 --pair BTC_USDT --output results.json
"""

import argparse
import asyncio
import hashlib
import hmac
import json
import os
import ssl
import statistics
import sys
import time
from datetime import datetime, timezone

import aiohttp
import numpy as np
import websockets

# Gate.io endpoints
REST_BASE = "https://api.gateio.ws/api/v4"
WS_SPOT = "wss://api.gateio.ws/ws/v4/"
WS_FUTURES = "wss://fx-ws.gateio.ws/v4/ws/usdt"

# ─── Helpers ──────────────────────────────────────────────────────────

def ts_ms():
    """Current timestamp in milliseconds (monotonic not available cross-machine, use wall clock)."""
    return time.time() * 1000


def perf_ms():
    """High-resolution monotonic timer for local round-trip measurements."""
    return time.perf_counter() * 1000


def gate_sign(method, url, query_string, body, ts, secret):
    """Generate Gate.io API v4 signature."""
    body_hash = hashlib.sha512(body.encode()).hexdigest()
    sign_str = f"{method}\n{url}\n{query_string}\n{body_hash}\n{ts}"
    return hmac.new(secret.encode(), sign_str.encode(), hashlib.sha512).hexdigest()


def percentile(data, p):
    return float(np.percentile(data, p))


def stats_summary(samples, label):
    if not samples:
        return {"label": label, "count": 0, "error": "no samples"}
    return {
        "label": label,
        "count": len(samples),
        "min_ms": round(min(samples), 3),
        "max_ms": round(max(samples), 3),
        "mean_ms": round(statistics.mean(samples), 3),
        "median_ms": round(statistics.median(samples), 3),
        "stdev_ms": round(statistics.stdev(samples), 3) if len(samples) > 1 else 0,
        "p95_ms": round(percentile(samples, 95), 3),
        "p99_ms": round(percentile(samples, 99), 3),
    }


# ─── Test 1: REST Round-Trip ─────────────────────────────────────────

async def test_rest_latency(session, endpoint, n_samples):
    """Measure REST API round-trip time."""
    url = f"{REST_BASE}{endpoint}"
    samples = []

    # Warm-up (3 requests, discard)
    for _ in range(3):
        async with session.get(url) as resp:
            await resp.read()

    for i in range(n_samples):
        t0 = perf_ms()
        async with session.get(url) as resp:
            await resp.read()
            t1 = perf_ms()
            if resp.status == 200:
                samples.append(t1 - t0)
            else:
                print(f"  REST {endpoint} sample {i}: HTTP {resp.status}", file=sys.stderr)
        # Small delay to avoid rate limiting
        await asyncio.sleep(0.05)

    return samples


# ─── Test 2: REST Order Round-Trip (needs API key) ───────────────────

async def test_order_latency(session, api_key, api_secret, pair, n_samples):
    """
    Measure order placement + confirmation round-trip.
    Places a limit BUY far below market price, captures confirmation time, then cancels.
    """
    samples = []

    # Get current price to place order far below market
    url = f"{REST_BASE}/spot/tickers?currency_pair={pair}"
    async with session.get(url) as resp:
        data = await resp.json()
        if not data:
            print(f"  Could not fetch ticker for {pair}", file=sys.stderr)
            return samples
        last_price = float(data[0]["last"])

    # Place orders at 50% below market (will never fill)
    order_price = str(round(last_price * 0.5, 2))
    order_amount = "0.0001"  # Minimum amount

    for i in range(n_samples):
        body = json.dumps({
            "currency_pair": pair,
            "side": "buy",
            "amount": order_amount,
            "price": order_price,
            "time_in_force": "gtc",
        })
        ts = str(int(time.time()))
        api_url = "/api/v4/spot/orders"
        sign = gate_sign("POST", api_url, "", body, ts, api_secret)
        headers = {
            "KEY": api_key,
            "SIGN": sign,
            "Timestamp": ts,
            "Content-Type": "application/json",
        }

        # Measure place order
        t0 = perf_ms()
        async with session.post(f"{REST_BASE}/spot/orders", headers=headers, data=body) as resp:
            t1 = perf_ms()
            result = await resp.json()

            if resp.status in (200, 201):
                samples.append(t1 - t0)
                order_id = result.get("id")

                # Cancel the order
                cancel_ts = str(int(time.time()))
                cancel_url = f"/api/v4/spot/orders/{order_id}"
                cancel_sign = gate_sign("DELETE", cancel_url, f"currency_pair={pair}", "", cancel_ts, api_secret)
                cancel_headers = {
                    "KEY": api_key,
                    "SIGN": cancel_sign,
                    "Timestamp": cancel_ts,
                }
                async with session.delete(
                    f"{REST_BASE}/spot/orders/{order_id}?currency_pair={pair}",
                    headers=cancel_headers,
                ) as cancel_resp:
                    await cancel_resp.read()
            else:
                print(f"  Order sample {i}: HTTP {resp.status} - {result}", file=sys.stderr)

        await asyncio.sleep(0.2)  # Be gentle with order rate limits

    return samples


# ─── Test 3: WebSocket Market Data Latency ────────────────────────────

async def test_ws_market_data(ws_url, pair, n_samples, channel="spot.trades"):
    """
    Measure WebSocket market data latency.
    Compares server-side timestamp in trade messages vs local receipt time.
    NOTE: Requires NTP-synced clock for accuracy. The delta includes clock skew.
    """
    samples = []
    connection_time = None
    first_message_time = None

    ssl_ctx = ssl.create_default_context()

    t_conn_start = perf_ms()
    async with websockets.connect(ws_url, ssl=ssl_ctx, ping_interval=20) as ws:
        t_conn_end = perf_ms()
        connection_time = t_conn_end - t_conn_start

        # Subscribe
        sub_msg = {
            "time": int(time.time()),
            "channel": channel,
            "event": "subscribe",
            "payload": [pair],
        }
        t_sub = perf_ms()
        await ws.send(json.dumps(sub_msg))

        collected = 0
        timeout = 120  # seconds max wait

        try:
            while collected < n_samples:
                raw = await asyncio.wait_for(ws.recv(), timeout=timeout)
                t_recv = ts_ms()  # wall clock for comparison with server ts

                if first_message_time is None:
                    first_message_time = perf_ms() - t_sub

                msg = json.loads(raw)

                # Skip subscription confirmations
                if msg.get("event") in ("subscribe", "unsubscribe"):
                    continue

                result = msg.get("result")
                if not result:
                    continue

                # Extract server timestamp
                # spot.trades: result has "create_time_ms" (string, epoch ms)
                # spot.order_book: result has "t" (epoch ms)
                server_ts = None

                if channel == "spot.trades":
                    # result is a single trade object on spot
                    if isinstance(result, dict) and "create_time_ms" in result:
                        server_ts = float(result["create_time_ms"])
                    elif isinstance(result, list):
                        for trade in result:
                            if "create_time_ms" in trade:
                                server_ts = float(trade["create_time_ms"])
                                break

                if channel == "spot.book_ticker":
                    if isinstance(result, dict) and "t" in result:
                        server_ts = float(result["t"])

                if server_ts is not None:
                    delta = t_recv - server_ts
                    # Filter extreme outliers from clock skew (> 10s)
                    if abs(delta) < 10000:
                        samples.append(delta)
                        collected += 1

        except asyncio.TimeoutError:
            print(f"  WS timeout after {timeout}s, got {collected}/{n_samples} samples", file=sys.stderr)

    return samples, connection_time, first_message_time


# ─── Test 4: WebSocket Ping/Pong ─────────────────────────────────────

async def test_ws_ping_pong(ws_url, n_samples):
    """Measure WebSocket ping-pong round-trip (transport-level latency)."""
    samples = []
    ssl_ctx = ssl.create_default_context()

    async with websockets.connect(ws_url, ssl=ssl_ctx, ping_interval=None) as ws:
        # Warm-up
        for _ in range(3):
            t0 = perf_ms()
            pong = await ws.ping()
            await pong
            perf_ms()

        for _ in range(n_samples):
            t0 = perf_ms()
            pong = await ws.ping()
            await pong
            t1 = perf_ms()
            samples.append(t1 - t0)
            await asyncio.sleep(0.1)

    return samples


# ─── Test 5: TCP + TLS Handshake ──────────────────────────────────────

async def test_tcp_tls_handshake(host, port, n_samples):
    """Measure TCP connect + TLS handshake time."""
    samples = []
    ssl_ctx = ssl.create_default_context()

    for _ in range(n_samples):
        t0 = perf_ms()
        try:
            reader, writer = await asyncio.open_connection(host, port, ssl=ssl_ctx)
            t1 = perf_ms()
            samples.append(t1 - t0)
            writer.close()
            await writer.wait_closed()
        except Exception as e:
            print(f"  TCP/TLS error: {e}", file=sys.stderr)
        await asyncio.sleep(0.1)

    return samples


# ─── Main ─────────────────────────────────────────────────────────────

async def run_all(args):
    results = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "pair": args.pair,
        "samples_requested": args.samples,
        "tests": {},
    }

    connector = aiohttp.TCPConnector(limit=5, force_close=False)
    async with aiohttp.ClientSession(connector=connector) as session:

        # 1. TCP+TLS Handshake to api.gateio.ws
        print("[1/5] TCP + TLS handshake latency...")
        tcp_samples = await test_tcp_tls_handshake("api.gateio.ws", 443, args.samples)
        results["tests"]["tcp_tls_handshake"] = stats_summary(tcp_samples, "TCP+TLS to api.gateio.ws:443")
        print(f"      mean={results['tests']['tcp_tls_handshake']['mean_ms']:.1f}ms "
              f"p95={results['tests']['tcp_tls_handshake']['p95_ms']:.1f}ms")

        # 2. REST /spot/time (lightest endpoint)
        print("[2/5] REST /spot/time round-trip...")
        rest_time_samples = await test_rest_latency(session, "/spot/time", args.samples)
        results["tests"]["rest_server_time"] = stats_summary(rest_time_samples, "GET /spot/time")
        print(f"      mean={results['tests']['rest_server_time']['mean_ms']:.1f}ms "
              f"p95={results['tests']['rest_server_time']['p95_ms']:.1f}ms")

        # 3. REST /spot/order_book (realistic payload)
        print("[3/5] REST order book fetch...")
        rest_ob_samples = await test_rest_latency(session, f"/spot/order_book?currency_pair={args.pair}&limit=20", args.samples)
        results["tests"]["rest_order_book"] = stats_summary(rest_ob_samples, f"GET /spot/order_book {args.pair}")
        print(f"      mean={results['tests']['rest_order_book']['mean_ms']:.1f}ms "
              f"p95={results['tests']['rest_order_book']['p95_ms']:.1f}ms")

        # 4. WebSocket ping/pong
        print("[4/5] WebSocket ping/pong...")
        ws_ping_samples = await test_ws_ping_pong(WS_SPOT, args.samples)
        results["tests"]["ws_ping_pong"] = stats_summary(ws_ping_samples, "WS ping/pong (spot)")
        print(f"      mean={results['tests']['ws_ping_pong']['mean_ms']:.1f}ms "
              f"p95={results['tests']['ws_ping_pong']['p95_ms']:.1f}ms")

        # 5. WebSocket market data (trades)
        print(f"[5/5] WebSocket market data ({args.pair} trades)...")
        print(f"      Waiting for {args.samples} trades (may take a while on illiquid pairs)...")
        ws_md_samples, ws_conn_time, ws_first_msg = await test_ws_market_data(
            WS_SPOT, args.pair, min(args.samples, 100), "spot.trades"
        )
        results["tests"]["ws_market_data"] = stats_summary(ws_md_samples, f"WS trade latency {args.pair}")
        results["tests"]["ws_market_data"]["connection_time_ms"] = round(ws_conn_time, 3) if ws_conn_time else None
        results["tests"]["ws_market_data"]["first_message_ms"] = round(ws_first_msg, 3) if ws_first_msg else None
        if ws_md_samples:
            print(f"      mean={results['tests']['ws_market_data']['mean_ms']:.1f}ms "
                  f"p95={results['tests']['ws_market_data']['p95_ms']:.1f}ms "
                  f"(NOTE: includes clock skew)")
        else:
            print("      No trade samples collected (pair may be illiquid)")

        # 6. Order latency (optional, needs API key)
        if args.api_key and args.api_secret:
            print("[6] Order placement round-trip...")
            order_samples = await test_order_latency(
                session, args.api_key, args.api_secret, args.pair, min(args.samples, 20)
            )
            results["tests"]["order_roundtrip"] = stats_summary(order_samples, f"Order place+confirm {args.pair}")
            if order_samples:
                print(f"      mean={results['tests']['order_roundtrip']['mean_ms']:.1f}ms "
                      f"p95={results['tests']['order_roundtrip']['p95_ms']:.1f}ms")
        else:
            print("[6] Order test skipped (no API key provided)")

    # Output
    print("\n" + "=" * 60)
    print(json.dumps(results, indent=2))

    if args.output:
        os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
        with open(args.output, "w") as f:
            json.dump(results, f, indent=2)
        print(f"\nResults saved to {args.output}")

    return results


def main():
    parser = argparse.ArgumentParser(description="Gate.io Latency Test Suite")
    parser.add_argument("--pair", default="BTC_USDT", help="Trading pair (default: BTC_USDT)")
    parser.add_argument("--samples", type=int, default=100, help="Number of samples per test (default: 100)")
    parser.add_argument("--api-key", default=os.environ.get("GATE_API_KEY"), help="Gate.io API key (or GATE_API_KEY env)")
    parser.add_argument("--api-secret", default=os.environ.get("GATE_API_SECRET"), help="Gate.io API secret (or GATE_API_SECRET env)")
    parser.add_argument("--output", default=None, help="Output JSON file path")
    args = parser.parse_args()

    print(f"Gate.io Latency Test Suite")
    print(f"Pair: {args.pair} | Samples: {args.samples}")
    print(f"Time: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)

    asyncio.run(run_all(args))


if __name__ == "__main__":
    main()
