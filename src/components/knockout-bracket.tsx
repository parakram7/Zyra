"use client";

// A real bracket visualization (columns of rounds connected by lines),
// not just a flat list of fixtures. Vertical centering uses one formula —
// center(round, i) = H * (i + 0.5) / matchesInRound — which keeps every
// round's boxes correctly nested between their two "parent" boxes for any
// number of rounds, so the connector lines always meet cleanly.

const BOX_H = 60;
const ROW_H = 84;
const COL_W = 236;
const GAP_W = 40;

export interface BracketMatch {
  top: React.ReactNode;
  bottom: React.ReactNode;
}

export interface BracketRound {
  title: string;
  matches: BracketMatch[];
}

export function KnockoutBracket({ rounds }: { rounds: BracketRound[] }) {
  if (rounds.length === 0) return null;
  const height = rounds[0].matches.length * ROW_H;

  return (
    <div className="overflow-x-auto">
      <div className="flex" style={{ minWidth: rounds.length * COL_W + (rounds.length - 1) * GAP_W }}>
        {rounds.map((round, r) => (
          <div key={round.title + r} className="flex items-start" style={{ flexShrink: 0 }}>
            <div style={{ width: COL_W }}>
              <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wide text-ink-500">
                {round.title}
              </p>
              <div className="relative" style={{ height }}>
                {round.matches.map((m, i) => {
                  const center = (height * (i + 0.5)) / round.matches.length;
                  return (
                    <div
                      key={i}
                      className="absolute left-0 right-0 overflow-hidden rounded-xl border border-ink-700/50 bg-ink-850"
                      style={{ top: center - BOX_H / 2, height: BOX_H }}
                    >
                      <div className="flex h-1/2 items-center border-b border-ink-800 px-3 text-xs font-semibold text-ink-100">
                        {m.top}
                      </div>
                      <div className="flex h-1/2 items-center px-3 text-xs font-semibold text-ink-100">
                        {m.bottom}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {r < rounds.length - 1 && (
              <svg width={GAP_W} height={height} className="shrink-0 overflow-visible">
                {round.matches.map((_, i) => {
                  if (i % 2 !== 0) return null;
                  const y1 = (height * (i + 0.5)) / round.matches.length;
                  const y2 = (height * (i + 1.5)) / round.matches.length;
                  const ym = (y1 + y2) / 2;
                  const midX = GAP_W / 2;
                  return (
                    <g key={i} stroke="#2d3750" strokeWidth={1.5} fill="none">
                      <line x1={0} y1={y1} x2={midX} y2={y1} />
                      <line x1={0} y1={y2} x2={midX} y2={y2} />
                      <line x1={midX} y1={y1} x2={midX} y2={y2} />
                      <line x1={midX} y1={ym} x2={GAP_W} y2={ym} />
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
