"""
Portfolio construction: turns factor composite scores into long-only target
weights subject to a single-name cap, a sector cap, and a cash buffer.
"""

from __future__ import annotations

import pandas as pd

from config import PortfolioConfig


def _cap_and_redistribute(weights: pd.Series, cap: float, groups: pd.Series | None = None) -> pd.Series:
    """
    Clip any name/group exceeding `cap` and redistribute the excess pro-rata
    across the uncapped remainder. `groups`, if given, caps group sums
    instead of individual weights. Iterates to convergence (a handful of
    passes is always enough for these cap sizes).
    """
    w = weights.copy()
    for _ in range(50):
        if groups is None:
            over = w[w > cap]
            if over.empty:
                break
            excess = (over - cap).sum()
            w[over.index] = cap
            room = w[w < cap]
        else:
            grp_sum = w.groupby(groups).sum()
            breached = grp_sum[grp_sum > cap]
            if breached.empty:
                break
            excess = 0.0
            for g, total in breached.items():
                members = w.index[groups == g]
                scale = cap / total
                excess += (w[members] * (1 - scale)).sum()
                w[members] *= scale
            capped_names = w.index[groups.isin(breached.index)]
            room = w.drop(capped_names, errors="ignore")
            room = room[room > 0]

        if room.empty or excess <= 1e-12:
            break
        w[room.index] += excess * (room / room.sum())
    return w


def build_target_weights(scores: pd.DataFrame, cfg: PortfolioConfig) -> pd.Series:
    """
    scores: output of factors.compute_composite_scores (needs 'composite' and
    'sector' columns). Returns a Series of target portfolio weights indexed
    by ticker, summing to (1 - cash_buffer).
    """
    top = scores.head(cfg.n_holdings).copy()

    # Score-tilted starting weights: shift scores positive so every held
    # name gets some allocation, then normalize.
    shifted = top["composite"] - top["composite"].min() + 0.1
    weights = shifted / shifted.sum()

    investable = 1.0 - cfg.cash_buffer
    weights *= investable

    # Capping, dropping dust, and renormalizing each can push weights back
    # over a cap the others just enforced, so iterate the whole sequence to
    # convergence rather than doing a single pass.
    for _ in range(10):
        weights = _cap_and_redistribute(weights, cfg.max_weight)
        weights = _cap_and_redistribute(weights, cfg.max_sector_weight, groups=top["sector"])

        dust = weights[(weights > 0) & (weights < cfg.min_weight)]
        weights[weights < cfg.min_weight] = 0.0
        if weights.sum() > 0:
            weights *= investable / weights.sum()

        if dust.empty:
            break

    # The redistribution above can bounce a name back and forth across the
    # name cap and the sector cap without fully converging. Finish with a
    # hard, non-redistributing clip so both caps are a strict guarantee --
    # any excess just goes unallocated (i.e. sits in cash) rather than being
    # pushed onto another name.
    weights = weights.clip(upper=cfg.max_weight)
    for sector, members in top.groupby("sector").groups.items():
        members = weights.index.intersection(members)
        sector_total = weights[members].sum()
        if sector_total > cfg.max_sector_weight:
            weights[members] *= cfg.max_sector_weight / sector_total

    return weights[weights > 0].sort_values(ascending=False)
