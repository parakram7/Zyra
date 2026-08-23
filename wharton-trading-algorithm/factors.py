"""
Factor construction: momentum (pure price history) plus value and quality
(fundamentals-based). Each factor is winsorized and cross-sectionally
z-scored at every rebalance date, then blended into a single composite score
per `config.FactorConfig` weights.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from config import FactorConfig


def winsorize(s: pd.Series, pct: float) -> pd.Series:
    lo, hi = s.quantile(pct), s.quantile(1 - pct)
    return s.clip(lo, hi)


def zscore(s: pd.Series) -> pd.Series:
    s = s.astype(float)
    mu, sigma = s.mean(skipna=True), s.std(skipna=True)
    if not sigma or np.isnan(sigma) or sigma == 0:
        return pd.Series(0.0, index=s.index)
    return (s - mu) / sigma


def compute_momentum(prices: pd.DataFrame, as_of: pd.Timestamp, cfg: FactorConfig) -> pd.Series:
    """12-1 month momentum: return from (as_of - lookback) to (as_of - skip)."""
    window = prices.loc[:as_of]
    if len(window) < cfg.momentum_lookback_days + 1:
        return pd.Series(np.nan, index=prices.columns)

    end_px = window.iloc[-1 - cfg.momentum_skip_days]
    start_px = window.iloc[-1 - cfg.momentum_lookback_days]
    mom = (end_px / start_px) - 1.0
    return mom


def compute_value_score(fundamentals: pd.DataFrame, cfg: FactorConfig) -> pd.Series:
    earnings_yield = 1.0 / fundamentals["trailing_pe"].replace({0: np.nan})
    book_yield = 1.0 / fundamentals["price_to_book"].replace({0: np.nan})

    earnings_yield = earnings_yield.where(earnings_yield > 0)  # drop negative-earnings noise
    book_yield = book_yield.where(book_yield > 0)

    ey_z = zscore(winsorize(earnings_yield.dropna(), cfg.winsorize_pct)).reindex(fundamentals.index)
    by_z = zscore(winsorize(book_yield.dropna(), cfg.winsorize_pct)).reindex(fundamentals.index)

    return pd.concat([ey_z, by_z], axis=1).mean(axis=1, skipna=True)


def compute_quality_score(fundamentals: pd.DataFrame, cfg: FactorConfig) -> pd.Series:
    roe = fundamentals["return_on_equity"]
    margins = fundamentals["gross_margins"]
    growth = fundamentals["earnings_growth"]
    leverage = fundamentals["debt_to_equity"]  # lower is better -> flip sign after z-score

    parts = []
    for s, invert in [(roe, False), (margins, False), (growth, False), (leverage, True)]:
        s = winsorize(s.dropna(), cfg.winsorize_pct)
        z = zscore(s).reindex(fundamentals.index)
        parts.append(-z if invert else z)

    return pd.concat(parts, axis=1).mean(axis=1, skipna=True)


def compute_composite_scores(
    prices: pd.DataFrame,
    fundamentals: pd.DataFrame,
    as_of: pd.Timestamp,
    cfg: FactorConfig,
) -> pd.DataFrame:
    tickers = fundamentals.index

    mom_raw = compute_momentum(prices[tickers], as_of, cfg)
    mom_z = zscore(winsorize(mom_raw.dropna(), cfg.winsorize_pct)).reindex(tickers)

    val_z = compute_value_score(fundamentals, cfg)
    qual_z = compute_quality_score(fundamentals, cfg)

    out = pd.DataFrame({"momentum": mom_z, "value": val_z, "quality": qual_z})
    out = out.fillna(0.0)  # a name missing one leg gets a neutral (0) score on that leg only
    out["composite"] = (
        cfg.weight_momentum * out["momentum"]
        + cfg.weight_value * out["value"]
        + cfg.weight_quality * out["quality"]
    )
    out["sector"] = fundamentals["sector"]
    return out.sort_values("composite", ascending=False)
