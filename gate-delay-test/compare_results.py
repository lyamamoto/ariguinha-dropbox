"""
Compare latency results across regions.

Usage:
  python compare_results.py                    # reads results/*.json
  python compare_results.py results/local.json results/20240101T*.json
"""

import glob
import json
import sys


def load_results(paths):
    results = {}
    for path in paths:
        with open(path) as f:
            data = json.load(f)
        # Extract region from filename or use path
        name = path.split("/")[-1].replace(".json", "")
        results[name] = data
    return results


def print_comparison(results):
    # Collect all test names
    all_tests = set()
    for data in results.values():
        all_tests.update(data.get("tests", {}).keys())

    for test_name in sorted(all_tests):
        print(f"\n{'='*70}")
        print(f"  {test_name}")
        print(f"{'='*70}")
        print(f"  {'Region':<35} {'Mean':>8} {'P95':>8} {'P99':>8} {'Min':>8} {'Stdev':>8}")
        print(f"  {'-'*35} {'-'*8} {'-'*8} {'-'*8} {'-'*8} {'-'*8}")

        # Sort by mean latency
        rows = []
        for name, data in results.items():
            test = data.get("tests", {}).get(test_name, {})
            if test.get("count", 0) > 0:
                rows.append((
                    name,
                    test.get("mean_ms", 0),
                    test.get("p95_ms", 0),
                    test.get("p99_ms", 0),
                    test.get("min_ms", 0),
                    test.get("stdev_ms", 0),
                ))

        for name, mean, p95, p99, mn, std in sorted(rows, key=lambda r: r[1]):
            marker = " <-- best" if rows and mean == min(r[1] for r in rows) else ""
            print(f"  {name:<35} {mean:>7.1f}  {p95:>7.1f}  {p99:>7.1f}  {mn:>7.1f}  {std:>7.1f}{marker}")

    # Summary recommendation
    print(f"\n{'='*70}")
    print("  RECOMMENDATION")
    print(f"{'='*70}")

    # Find best region for ws_ping_pong (most reliable transport metric)
    best_region = None
    best_latency = float("inf")
    for name, data in results.items():
        ping = data.get("tests", {}).get("ws_ping_pong", {})
        if ping.get("mean_ms", float("inf")) < best_latency:
            best_latency = ping["mean_ms"]
            best_region = name

    if best_region:
        print(f"  Lowest transport latency: {best_region} ({best_latency:.1f}ms WS ping)")
        print(f"  Gate.io servers are in AWS ap-northeast-1 (Tokyo)")
        print(f"  For production: deploy in ap-northeast-1 for lowest latency")


def main():
    if len(sys.argv) > 1:
        paths = sys.argv[1:]
    else:
        paths = sorted(glob.glob("results/*.json"))

    if not paths:
        print("No result files found. Run latency_test.py first.")
        sys.exit(1)

    print(f"Comparing {len(paths)} result files:\n")
    for p in paths:
        print(f"  - {p}")

    results = load_results(paths)
    print_comparison(results)


if __name__ == "__main__":
    main()
