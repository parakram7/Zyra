"""
Data access layer. Wraps yfinance so the rest of the codebase never touches
the network directly, and provides a synthetic data generator so the whole
pipeline (factors -> portfolio -> backtest -> metrics) can be exercised and
unit-tested without network access or an API key.
"""

from __future__ import annotations

import json
import os
from typing import Iterable

import numpy as np
import pandas as pd

CACHE_DIR = os.path.join(os.path.dirname(__file__), "output", "cache")
os.makedirs(CACHE_DIR, exist_ok=True)


def download_prices(tickers: Iterable[str], start: str, end: str) -> pd.DataFrame:
    """Adjusted close prices for `tickers` between start/end, one column per ticker."""
    import yfinance as yf

    tickers = list(tickers)
    raw = yf.download(
        tickers, start=start, end=end, auto_adjust=True, progress=False, group_by="ticker"
    )

    if len(tickers) == 1:
        prices = raw[["Close"]].rename(columns={"Close": tickers[0]})
    else:
        prices = pd.DataFrame({t: raw[t]["Close"] for t in tickers if t in raw})

    prices = prices.dropna(how="all").ffill()
    return prices


def download_fundamentals(tickers: Iterable[str]) -> pd.DataFrame:
    """
    Snapshot fundamentals used for the value/quality factors. yfinance only
    exposes *current* snapshots (not point-in-time history), which is a known
    limitation documented in the README -- fine for a live signal, but it
    means a historical backtest look-ahead-biases the value/quality legs
    slightly. Momentum is unaffected since it's pure price history.
    """
    import yfinance as yf

    rows = []
    for t in tickers:
        try:
            info = yf.Ticker(t).info
        except Exception:
            info = {}
        rows.append(
            {
                "ticker": t,
                "sector": info.get("sector", "Unknown"),
                "trailing_pe": info.get("trailingPE"),
                "price_to_book": info.get("priceToBook"),
                "return_on_equity": info.get("returnOnEquity"),
                "debt_to_equity": info.get("debtToEquity"),
                "gross_margins": info.get("grossMargins"),
                "earnings_growth": info.get("earningsGrowth"),
            }
        )
    df = pd.DataFrame(rows).set_index("ticker")
    df.to_json(os.path.join(CACHE_DIR, "fundamentals_snapshot.json"), orient="index", indent=2)
    return df


def generate_synthetic_dataset(
    tickers: list[str],
    start: str,
    end: str,
    seed: int = 7,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Deterministic fake prices + fundamentals with the same shape as the real
    data sources. Used by the test suite and by `main.py --synthetic` so the
    full pipeline can be demoed / validated offline.
    """
    rng = np.random.default_rng(seed)
    dates = pd.bdate_range(start, end)
    n, k = len(dates), len(tickers)

    # Each name gets a random drift + vol + a shared market factor so momentum
    # and correlation structure look realistic.
    market = rng.normal(0.0003, 0.01, size=n)
    drifts = rng.normal(0.0002, 0.0004, size=k)
    vols = rng.uniform(0.008, 0.025, size=k)
    betas = rng.uniform(0.6, 1.4, size=k)

    prices = pd.DataFrame(index=dates, columns=tickers, dtype=float)
    for j, t in enumerate(tickers):
        idio = rng.normal(0, vols[j], size=n)
        rets = drifts[j] + betas[j] * market + idio
        prices[t] = 100 * np.exp(np.cumsum(rets))

    sectors = ["Technology", "Consumer", "Financials", "Healthcare", "Industrials"]
    fundamentals = pd.DataFrame(
        {
            "sector": rng.choice(sectors, size=k),
            "trailing_pe": rng.uniform(8, 40, size=k),
            "price_to_book": rng.uniform(1, 12, size=k),
            "return_on_equity": rng.uniform(0.02, 0.45, size=k),
            "debt_to_equity": rng.uniform(10, 200, size=k),
            "gross_margins": rng.uniform(0.2, 0.75, size=k),
            "earnings_growth": rng.uniform(-0.1, 0.35, size=k),
        },
        index=tickers,
    )
    return prices, fundamentals
