"""
Central configuration for the strategy: universe, factor weights, portfolio
construction rules, and backtest assumptions. Edit this file to tune the
strategy without touching the logic in the other modules.
"""

from dataclasses import dataclass, field


# ---------------------------------------------------------------------------
# Universe
# ---------------------------------------------------------------------------
# A liquid, sector-diverse set of large/mid-cap US names + sector ETFs.
# Swap in your own list (e.g. Russell 1000 constituents) if your competition
# allows a broader mandate. Keep everything long-only, cash-settled equities
# or ETFs to stay inside typical Wharton GIC rules (no shorting, no margin,
# no derivatives) unless your track explicitly allows more.
UNIVERSE = [
    # Technology
    "AAPL", "MSFT", "NVDA", "GOOGL", "META", "AVGO", "CRM", "ADBE", "ORCL", "CSCO",
    # Consumer
    "AMZN", "TSLA", "HD", "MCD", "NKE", "SBUX", "COST", "PG", "KO", "PEP",
    # Financials
    "JPM", "BAC", "GS", "MS", "V", "MA", "AXP", "BLK",
    # Healthcare
    "UNH", "JNJ", "LLY", "ABBV", "MRK", "PFE", "TMO", "ABT",
    # Industrials / Energy / Materials
    "CAT", "HON", "GE", "XOM", "CVX", "LIN", "UPS", "RTX",
    # Communication / Utilities
    "DIS", "NFLX", "CMCSA", "NEE", "DUK",
]

BENCHMARK = "SPY"          # used to compute alpha/beta and for relative performance
RISK_FREE_TICKER = "^IRX"  # 13-week T-bill yield, used for Sharpe/Sortino

SECTOR_MAP_CACHE = "output/sector_map.json"


# ---------------------------------------------------------------------------
# Factor construction
# ---------------------------------------------------------------------------
@dataclass
class FactorConfig:
    # Momentum: cumulative return over `lookback_days`, skipping the most
    # recent `skip_days` to avoid short-term reversal contamination
    # (classic 12-1 month momentum).
    momentum_lookback_days: int = 252
    momentum_skip_days: int = 21

    # Value / quality pull point-in-time fundamentals via yfinance's
    # `.info` / `.financials`. These are noisy for a student project, so we
    # winsorize and z-score cross-sectionally each rebalance.
    winsorize_pct: float = 0.02  # clip to [2nd, 98th] percentile before z-scoring

    # Composite weights (must sum to 1.0)
    weight_momentum: float = 0.4
    weight_value: float = 0.3
    weight_quality: float = 0.3


FACTORS = FactorConfig()


# ---------------------------------------------------------------------------
# Portfolio construction
# ---------------------------------------------------------------------------
@dataclass
class PortfolioConfig:
    n_holdings: int = 15          # number of names held at any time
    max_weight: float = 0.12      # single-name cap
    max_sector_weight: float = 0.30  # sector exposure cap
    min_weight: float = 0.02      # drop dust positions below this
    cash_buffer: float = 0.02     # % of portfolio kept in cash for slippage/fees
    rebalance_freq: str = "M"     # 'M' monthly, 'W' weekly, 'Q' quarterly


PORTFOLIO = PortfolioConfig()


# ---------------------------------------------------------------------------
# Backtest assumptions
# ---------------------------------------------------------------------------
@dataclass
class BacktestConfig:
    start_date: str = "2015-01-01"
    end_date: str = "2024-12-31"
    initial_capital: float = 100_000.0
    transaction_cost_bps: float = 5.0   # 5 bps per trade (commission + slippage)
    trading_days_per_year: int = 252


BACKTEST = BacktestConfig()
