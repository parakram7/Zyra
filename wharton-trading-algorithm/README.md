# Factor-Based Long-Only Equity Strategy — Wharton GIC

A long-only, factor-based equity strategy built for the Wharton Global Investment
Competition (standard track: cash equities/ETFs only, no shorting, no margin,
no derivatives). It ranks a universe of large/mid-cap stocks on a blended
**value + quality + momentum** score, builds a risk-capped portfolio from the
top names, and rebalances monthly.

## 1. Investment thesis

Value, quality, and momentum are the three most extensively documented
cross-sectional equity factors in the academic literature (Fama-French,
Asness/AQR's QMJ, Jegadeesh-Titman). Each captures a different, largely
uncorrelated source of return:

- **Momentum** (40% of composite) — stocks with strong risk-adjusted returns
  over the past 12 months (excluding the most recent month, to avoid
  short-term reversal) tend to keep outperforming over the following month.
  Computed purely from price history.
- **Value** (30%) — cheap stocks (high earnings yield, high book yield)
  outperform expensive ones over the long run. Computed from trailing P/E and
  price/book.
- **Quality** (30%) — profitable, well-capitalized, growing companies (high
  ROE, high margins, low leverage, positive earnings growth) are more
  resilient and are used to filter out "value traps" among the cheap names.

Blending the three avoids being purely a momentum strategy (crash risk in
reversals) or purely a value strategy (long, painful drawdowns) — this is the
standard rationale multi-factor funds use, and it's straightforward to
defend in front of judges.

## 2. Universe & constraints

- **Universe**: ~45 liquid, sector-diverse S&P 500 constituents (`config.py:UNIVERSE`) —
  swap in your own list.
- **Long-only**, no leverage, no shorting, no derivatives — matches standard
  Wharton GIC rules.
- **Position cap**: 12% per name, **30%** per sector — keeps the book
  diversified even when the factor score is dominated by one sector.
- **Cash buffer**: 2% held back for slippage/fee headroom.
- **Rebalance**: monthly (configurable to weekly/quarterly).

## 3. How a score becomes a portfolio

1. At each rebalance date, compute momentum, value, and quality for every
   name in the universe.
2. Winsorize each factor at the 2nd/98th percentile (kills outlier
   distortion from a single garbage data point) and z-score it
   cross-sectionally.
3. Blend: `composite = 0.4*momentum_z + 0.3*value_z + 0.3*quality_z`.
4. Take the top 15 names by composite score.
5. Weight them by a shifted-and-normalized composite score (higher score →
   bigger position), then apply the 12% name cap / 30% sector cap, moving
   any excess to cash rather than another name once the caps are tight
   (`portfolio.py`).

## 4. Backtest engine

`backtest.py` walks forward day by day: positions drift with daily returns
between rebalances, and on each rebalance date it recomputes scores, builds
new target weights, and charges a transaction cost
(`config.BacktestConfig.transaction_cost_bps`, default 5 bps) on the dollar
amount traded. This produces a realistic net-of-cost equity curve rather than
a frictionless one.

## 5. Results (synthetic data smoke test)

Run `python main.py backtest --synthetic` to see the pipeline end-to-end
without any network access — it generates a fake but statistically
realistic 10-year price history and prints a full performance summary
(CAGR, Sharpe, Sortino, max drawdown, alpha/beta vs. a synthetic benchmark,
turnover). Numbers will differ every run since the data is fake; the point
is to prove the mechanics — caps, turnover, no shorting/leverage — hold up,
which is exactly what `tests/test_pipeline.py` checks.

**For real numbers**, run `python main.py backtest` with a network
connection — it pulls actual historical prices via `yfinance`.

## 6. Known limitations (be upfront about these with judges)

- **Fundamentals are a current snapshot, not point-in-time history.**
  `yfinance` doesn't provide historical fundamentals for free, so the
  value/quality legs in a *historical* backtest reuse today's P/E, ROE, etc.
  at every past rebalance date. This introduces look-ahead bias on those two
  legs (momentum is unaffected — it's pure price history). This is a known,
  disclosed limitation of using free data for a backtest; a paid
  point-in-time database (Compustat, Sharadar) would remove it. It does
  **not** affect the live `signal` command, which only ever needs today's
  fundamentals.
- **Continuous (fractional) share weights.** The backtest and target
  portfolio assume you can hold any fraction of a share. When placing real
  orders, round to whole shares and expect a small amount of residual cash.
- **Universe is static.** No survivorship-bias handling or dynamic
  universe reconstitution — the same ~45 names are used throughout the
  backtest window.
- **Slippage model is a flat bps assumption**, not a market-impact model.
  Fine for a 15-name, monthly-turnover portfolio at this AUM scale.

## 7. Running it

```bash
pip install -r requirements.txt

# Historical backtest (needs network for real data)
python main.py backtest              # real data via yfinance
python main.py backtest --synthetic  # offline smoke test

# Today's target portfolio -- what you'd actually enter as trades
python main.py signal                # real data
python main.py signal --synthetic    # offline smoke test

# Unit tests (offline, checks caps/turnover/no-leverage invariants)
python -m pytest tests/ -v
```

Outputs land in `output/`: `equity_curve.png`, `equity_curve.csv`,
`weights_history.csv` (backtest), and `target_portfolio.csv` (signal).

## 8. Files

| File | Purpose |
|---|---|
| `config.py` | Universe, factor weights, portfolio caps, backtest assumptions — tune the strategy here |
| `data.py` | Price/fundamentals download via `yfinance`, plus a synthetic data generator for offline testing |
| `factors.py` | Momentum/value/quality computation, winsorization, z-scoring, composite blend |
| `portfolio.py` | Turns factor scores into capped target weights |
| `backtest.py` | Day-by-day backtest loop with transaction costs |
| `metrics.py` | CAGR, Sharpe, Sortino, max drawdown, alpha/beta, turnover |
| `main.py` | CLI: `backtest` and `signal` commands |
| `tests/` | Offline pytest suite validating caps, no-shorting/leverage, output shapes |

## 9. Extending it

- Add sector/factor exposure charts to the report for the judges' deck.
- Add a risk-parity or minimum-variance overlay instead of score-tilted
  weights.
- Add a volatility target (scale total exposure down in high-VIX regimes).
- Swap the static universe for a dynamically reconstituted index (e.g.
  current S&P 500 membership) to remove survivorship bias.
