"""
Event-driven-ish backtest engine: walks forward day by day, lets positions
drift with daily returns, and rebalances to fresh factor-based target
weights on `PortfolioConfig.rebalance_freq`. Tracks an equity curve, per-
rebalance turnover, and transaction costs.

Note on fundamentals: yfinance only exposes current-snapshot fundamentals
(no point-in-time history), so the value/quality legs use the same
fundamentals snapshot at every historical rebalance date. This is a known
look-ahead-bias limitation of free data sources -- see README for detail and
mitigations. Momentum is computed purely from historical prices and is not
affected.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
import pandas as pd

import factors
from config import BacktestConfig, FactorConfig, PortfolioConfig
from portfolio import build_target_weights


@dataclass
class BacktestResult:
    equity_curve: pd.Series
    weights_history: dict = field(default_factory=dict)   # {date: Series of weights}
    turnover_history: dict = field(default_factory=dict)  # {date: one-way turnover}
    cost_history: dict = field(default_factory=dict)       # {date: $ cost}
    scores_history: dict = field(default_factory=dict)     # {date: DataFrame of factor scores}


_FREQ_ALIASES = {"M": "ME", "Q": "QE", "Y": "YE", "A": "YE"}


def get_rebalance_dates(index: pd.DatetimeIndex, freq: str, warmup_days: int) -> list[pd.Timestamp]:
    freq = _FREQ_ALIASES.get(freq, freq)
    period_ends = pd.Series(index=index, data=index).resample(freq).last().dropna()
    dates = [d for d in period_ends if index.get_loc(d) >= warmup_days]
    return dates


def run_backtest(
    prices: pd.DataFrame,
    fundamentals: pd.DataFrame,
    bt_cfg: BacktestConfig,
    port_cfg: PortfolioConfig,
    factor_cfg: FactorConfig,
) -> BacktestResult:
    prices = prices.loc[bt_cfg.start_date : bt_cfg.end_date].dropna(how="all")
    daily_returns = prices.pct_change().fillna(0.0)

    warmup = factor_cfg.momentum_lookback_days + factor_cfg.momentum_skip_days + 5
    rebalance_dates = set(get_rebalance_dates(prices.index, port_cfg.rebalance_freq, warmup))

    tickers = prices.columns
    dollar_positions = pd.Series(0.0, index=tickers)
    cash = bt_cfg.initial_capital

    equity_curve = {}
    result = BacktestResult(equity_curve=pd.Series(dtype=float))

    for i, date in enumerate(prices.index):
        if i > 0:
            dollar_positions *= 1.0 + daily_returns.loc[date, tickers]

        if date in rebalance_dates:
            total_value = dollar_positions.sum() + cash
            scores = factors.compute_composite_scores(prices, fundamentals, date, factor_cfg)
            target_weights = build_target_weights(scores, port_cfg)

            target_dollar = pd.Series(0.0, index=tickers)
            target_dollar[target_weights.index] = target_weights.values * total_value

            traded = (target_dollar - dollar_positions).abs()
            traded_notional = traded.sum()
            turnover = traded_notional / total_value / 2.0
            cost = traded_notional * (bt_cfg.transaction_cost_bps / 10_000.0)

            cash = total_value - target_dollar.sum() - cost
            dollar_positions = target_dollar

            result.weights_history[date] = target_weights
            result.turnover_history[date] = turnover
            result.cost_history[date] = cost
            result.scores_history[date] = scores

        equity_curve[date] = dollar_positions.sum() + cash

    result.equity_curve = pd.Series(equity_curve).sort_index()
    return result
