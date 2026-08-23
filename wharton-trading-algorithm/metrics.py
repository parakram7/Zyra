"""Performance metrics computed from an equity curve (+ optional benchmark)."""

from __future__ import annotations

import numpy as np
import pandas as pd


def daily_returns(equity_curve: pd.Series) -> pd.Series:
    return equity_curve.pct_change().dropna()


def cagr(equity_curve: pd.Series, trading_days: int = 252) -> float:
    rets = daily_returns(equity_curve)
    n_years = len(rets) / trading_days
    if n_years <= 0:
        return np.nan
    total_return = equity_curve.iloc[-1] / equity_curve.iloc[0]
    return total_return ** (1 / n_years) - 1


def annualized_vol(equity_curve: pd.Series, trading_days: int = 252) -> float:
    return daily_returns(equity_curve).std() * np.sqrt(trading_days)


def sharpe_ratio(equity_curve: pd.Series, risk_free_annual: float = 0.0, trading_days: int = 252) -> float:
    rets = daily_returns(equity_curve)
    rf_daily = risk_free_annual / trading_days
    excess = rets - rf_daily
    if excess.std() == 0:
        return np.nan
    return (excess.mean() / excess.std()) * np.sqrt(trading_days)


def sortino_ratio(equity_curve: pd.Series, risk_free_annual: float = 0.0, trading_days: int = 252) -> float:
    rets = daily_returns(equity_curve)
    rf_daily = risk_free_annual / trading_days
    excess = rets - rf_daily
    downside = excess[excess < 0]
    downside_std = downside.std()
    if not downside_std:
        return np.nan
    return (excess.mean() / downside_std) * np.sqrt(trading_days)


def max_drawdown(equity_curve: pd.Series) -> float:
    running_max = equity_curve.cummax()
    drawdown = equity_curve / running_max - 1.0
    return drawdown.min()


def calmar_ratio(equity_curve: pd.Series, trading_days: int = 252) -> float:
    mdd = max_drawdown(equity_curve)
    if mdd == 0:
        return np.nan
    return cagr(equity_curve, trading_days) / abs(mdd)


def beta_alpha(equity_curve: pd.Series, benchmark_curve: pd.Series, trading_days: int = 252) -> tuple[float, float]:
    port_rets = daily_returns(equity_curve)
    bench_rets = daily_returns(benchmark_curve)
    aligned = pd.concat([port_rets, bench_rets], axis=1, join="inner").dropna()
    aligned.columns = ["port", "bench"]
    if len(aligned) < 2 or aligned["bench"].var() == 0:
        return np.nan, np.nan
    cov = np.cov(aligned["port"], aligned["bench"])
    beta = cov[0, 1] / cov[1, 1]
    alpha_daily = aligned["port"].mean() - beta * aligned["bench"].mean()
    alpha_annual = alpha_daily * trading_days
    return beta, alpha_annual


def summary(
    equity_curve: pd.Series,
    benchmark_curve: pd.Series | None = None,
    turnover_history: dict | None = None,
    risk_free_annual: float = 0.0,
    trading_days: int = 252,
) -> dict:
    out = {
        "CAGR": cagr(equity_curve, trading_days),
        "Annualized Volatility": annualized_vol(equity_curve, trading_days),
        "Sharpe Ratio": sharpe_ratio(equity_curve, risk_free_annual, trading_days),
        "Sortino Ratio": sortino_ratio(equity_curve, risk_free_annual, trading_days),
        "Max Drawdown": max_drawdown(equity_curve),
        "Calmar Ratio": calmar_ratio(equity_curve, trading_days),
        "Final Equity": equity_curve.iloc[-1],
        "Total Return": equity_curve.iloc[-1] / equity_curve.iloc[0] - 1,
    }
    if benchmark_curve is not None:
        beta, alpha = beta_alpha(equity_curve, benchmark_curve, trading_days)
        out["Beta vs Benchmark"] = beta
        out["Annualized Alpha vs Benchmark"] = alpha
        out["Benchmark Total Return"] = benchmark_curve.iloc[-1] / benchmark_curve.iloc[0] - 1
    if turnover_history:
        out["Avg One-Way Turnover per Rebalance"] = float(np.mean(list(turnover_history.values())))
    return out


def format_summary(s: dict) -> str:
    lines = []
    pct_keys = {
        "CAGR", "Annualized Volatility", "Max Drawdown", "Total Return",
        "Annualized Alpha vs Benchmark", "Benchmark Total Return",
        "Avg One-Way Turnover per Rebalance",
    }
    for k, v in s.items():
        if isinstance(v, float) and k in pct_keys:
            lines.append(f"{k:38s}: {v:8.2%}")
        elif isinstance(v, float):
            lines.append(f"{k:38s}: {v:8.3f}")
        else:
            lines.append(f"{k:38s}: {v}")
    return "\n".join(lines)
