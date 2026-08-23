"""
CLI entry point.

    python main.py backtest [--synthetic]
        Run the full historical backtest over config.BACKTEST's date range
        and print a performance summary + save an equity curve chart.

    python main.py signal [--synthetic]
        Compute today's factor scores and target portfolio -- the sheet you'd
        actually use to place trades in the Wharton GIC platform.

Pass --synthetic to run either command on generated fake data, with no
network access required (useful for a quick smoke test).
"""

from __future__ import annotations

import argparse
import os

import pandas as pd

import backtest as bt
import config
import data
import factors
import metrics
from portfolio import build_target_weights


def load_data(synthetic: bool):
    if synthetic:
        prices, fundamentals = data.generate_synthetic_dataset(
            config.UNIVERSE, config.BACKTEST.start_date, config.BACKTEST.end_date
        )
        benchmark_prices = data.generate_synthetic_dataset(
            [config.BENCHMARK], config.BACKTEST.start_date, config.BACKTEST.end_date
        )[0]
        return prices, fundamentals, benchmark_prices[config.BENCHMARK]

    prices = data.download_prices(config.UNIVERSE, config.BACKTEST.start_date, config.BACKTEST.end_date)
    fundamentals = data.download_fundamentals(prices.columns)
    benchmark = data.download_prices([config.BENCHMARK], config.BACKTEST.start_date, config.BACKTEST.end_date)
    return prices, fundamentals, benchmark[config.BENCHMARK]


def cmd_backtest(args):
    prices, fundamentals, benchmark = load_data(args.synthetic)

    result = bt.run_backtest(prices, fundamentals, config.BACKTEST, config.PORTFOLIO, config.FACTORS)
    bench_aligned = benchmark.reindex(result.equity_curve.index).ffill()
    bench_curve = bench_aligned / bench_aligned.iloc[0] * config.BACKTEST.initial_capital

    summary = metrics.summary(
        result.equity_curve, bench_curve, result.turnover_history,
        trading_days=config.BACKTEST.trading_days_per_year,
    )

    print("\n=== Backtest Summary ===")
    print(metrics.format_summary(summary))

    os.makedirs("output", exist_ok=True)
    result.equity_curve.to_csv("output/equity_curve.csv")
    pd.DataFrame(
        {d: w for d, w in result.weights_history.items()}
    ).to_csv("output/weights_history.csv")

    try:
        import matplotlib.pyplot as plt

        fig, ax = plt.subplots(figsize=(10, 5))
        (result.equity_curve / result.equity_curve.iloc[0]).plot(ax=ax, label="Strategy")
        (bench_curve / bench_curve.iloc[0]).plot(ax=ax, label=config.BENCHMARK)
        ax.set_title("Strategy vs Benchmark (normalized)")
        ax.legend()
        fig.tight_layout()
        fig.savefig("output/equity_curve.png", dpi=150)
        print("\nSaved output/equity_curve.png, output/equity_curve.csv, output/weights_history.csv")
    except ImportError:
        print("\n(matplotlib not installed -- skipped chart, CSVs still saved)")


def cmd_signal(args):
    prices, fundamentals, _ = load_data(args.synthetic)
    as_of = prices.index[-1]

    scores = factors.compute_composite_scores(prices, fundamentals, as_of, config.FACTORS)
    weights = build_target_weights(scores, config.PORTFOLIO)

    print(f"\n=== Target Portfolio as of {as_of.date()} ===\n")
    report = scores.loc[weights.index].copy()
    report["target_weight"] = weights
    report = report[["target_weight", "composite", "momentum", "value", "quality", "sector"]]
    report = report.sort_values("target_weight", ascending=False)
    with pd.option_context("display.float_format", "{:.4f}".format):
        print(report)
    print(f"\nCash: {1 - weights.sum():.2%}")

    os.makedirs("output", exist_ok=True)
    report.to_csv("output/target_portfolio.csv")
    print("\nSaved output/target_portfolio.csv")


def main():
    parser = argparse.ArgumentParser(description="Wharton GIC factor-based equity strategy")
    sub = parser.add_subparsers(dest="command", required=True)

    p_bt = sub.add_parser("backtest", help="Run the historical backtest")
    p_bt.add_argument("--synthetic", action="store_true", help="Use generated fake data (no network)")
    p_bt.set_defaults(func=cmd_backtest)

    p_sig = sub.add_parser("signal", help="Generate today's target portfolio")
    p_sig.add_argument("--synthetic", action="store_true", help="Use generated fake data (no network)")
    p_sig.set_defaults(func=cmd_signal)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
