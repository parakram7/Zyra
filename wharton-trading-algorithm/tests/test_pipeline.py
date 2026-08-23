"""
Offline sanity tests using synthetic data (no network required). These check
the pipeline's *contracts* -- weight caps, sums, output shapes -- not
specific return numbers, since synthetic data is random.

Run with: python -m pytest tests/ -v   (from the wharton-trading-algorithm dir)
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
import pytest

import backtest as bt
import factors
from config import BACKTEST, FACTORS, PORTFOLIO
from data import generate_synthetic_dataset
from portfolio import build_target_weights


UNIVERSE = [f"TICK{i}" for i in range(30)]


@pytest.fixture(scope="module")
def synthetic_data():
    prices, fundamentals = generate_synthetic_dataset(UNIVERSE, "2018-01-01", "2023-12-31")
    return prices, fundamentals


def test_zscore_mean_zero_unit_std():
    s = pd.Series(np.random.default_rng(0).normal(5, 2, size=100))
    z = factors.zscore(s)
    assert abs(z.mean()) < 1e-8
    assert abs(z.std() - 1) < 1e-8


def test_zscore_handles_zero_variance():
    s = pd.Series([3.0] * 10)
    z = factors.zscore(s)
    assert (z == 0).all()


def test_composite_scores_shape(synthetic_data):
    prices, fundamentals = synthetic_data
    as_of = prices.index[300]
    scores = factors.compute_composite_scores(prices, fundamentals, as_of, FACTORS)
    assert set(scores.index) == set(UNIVERSE)
    assert {"momentum", "value", "quality", "composite", "sector"} <= set(scores.columns)
    assert not scores["composite"].isna().any()


def test_target_weights_respect_caps(synthetic_data):
    prices, fundamentals = synthetic_data
    as_of = prices.index[300]
    scores = factors.compute_composite_scores(prices, fundamentals, as_of, FACTORS)
    weights = build_target_weights(scores, PORTFOLIO)

    assert len(weights) <= PORTFOLIO.n_holdings
    assert (weights <= PORTFOLIO.max_weight + 1e-4).all()
    assert (weights >= PORTFOLIO.min_weight - 1e-9).all()

    sector_sums = weights.groupby(scores.loc[weights.index, "sector"]).sum()
    assert (sector_sums <= PORTFOLIO.max_sector_weight + 1e-4).all()

    total = weights.sum()
    assert total <= 1 - PORTFOLIO.cash_buffer + 1e-6
    assert total > 0


def test_backtest_produces_monotonic_dates_and_positive_equity(synthetic_data):
    prices, fundamentals = synthetic_data
    result = bt.run_backtest(prices, fundamentals, BACKTEST, PORTFOLIO, FACTORS)

    assert result.equity_curve.index.is_monotonic_increasing
    assert (result.equity_curve > 0).all()
    assert len(result.weights_history) > 0

    for date, w in result.weights_history.items():
        assert (w <= PORTFOLIO.max_weight + 1e-4).all()
        assert w.sum() <= 1 - PORTFOLIO.cash_buffer + 1e-6


def test_backtest_turnover_is_bounded(synthetic_data):
    prices, fundamentals = synthetic_data
    result = bt.run_backtest(prices, fundamentals, BACKTEST, PORTFOLIO, FACTORS)
    for turnover in result.turnover_history.values():
        assert 0 <= turnover <= 1.0 + 1e-6


def test_no_shorting_no_leverage(synthetic_data):
    """Wharton GIC standard-track constraint: weights must be in [0, 1] and never exceed 100% invested."""
    prices, fundamentals = synthetic_data
    result = bt.run_backtest(prices, fundamentals, BACKTEST, PORTFOLIO, FACTORS)
    for date, w in result.weights_history.items():
        assert (w >= 0).all()
        assert w.sum() <= 1.0 + 1e-6
