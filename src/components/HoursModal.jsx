import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function HoursModal({ company, rate, color, entries, onClose }) {
  // Group hours by year: { 2024: { 9: 160, 10: 140, ... }, 2025: {...} }
  const byYear = useMemo(() => {
    const map = {};
    entries.forEach((e) => {
      const [y, m] = e.month.split("-").map(Number);
      const hours = Number(company === "A" ? e.hoursA : e.hoursB) || 0;
      if (!map[y]) map[y] = {};
      map[y][m] = hours;
    });
    return map;
  }, [entries, company]);

  const years = useMemo(
    () => Object.keys(byYear).map(Number).sort((a, b) => b - a),
    [byYear]
  );

  const [yearIdx, setYearIdx] = useState(0);
  const year = years[yearIdx];
  const monthsData = byYear[year] || {};
  const yearTotal = Object.values(monthsData).reduce((s, h) => s + h, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-5"
        style={{ background: "#14141c", borderColor: "rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-white">
            Company {company} hours <span style={{ color }}>&middot; ${rate}/hr</span>
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-white/35 mb-4">Paginated by year</p>

        {years.length === 0 ? (
          <p className="text-sm text-white/30 py-10 text-center">No hours logged yet.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setYearIdx((i) => Math.min(i + 1, years.length - 1))}
                disabled={yearIdx >= years.length - 1}
                className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/25 disabled:opacity-25 disabled:hover:text-white/60 transition-colors"
                aria-label="Earlier year"
              >
                <ChevronLeft size={16} />
              </button>
              <p className="text-lg font-semibold text-white tabular-nums">{year}</p>
              <button
                onClick={() => setYearIdx((i) => Math.max(i - 1, 0))}
                disabled={yearIdx <= 0}
                className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/25 disabled:opacity-25 disabled:hover:text-white/60 transition-colors"
                aria-label="Later year"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {MONTH_NAMES.map((name, i) => {
                const m = i + 1;
                const hours = monthsData[m];
                const has = hours !== undefined;
                return (
                  <div
                    key={m}
                    className="rounded-lg border px-2 py-2 text-center"
                    style={{
                      borderColor: has ? `${color}40` : "rgba(255,255,255,0.06)",
                      background: has ? `${color}14` : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <p className="text-[10px] text-white/35 mb-0.5">{name}</p>
                    <p className="text-sm font-semibold tabular-nums" style={{ color: has ? color : "rgba(255,255,255,0.25)" }}>
                      {has ? hours : "—"}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/8">
              <span className="text-xs text-white/40">Total for {year}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color }}>
                {yearTotal.toLocaleString()} hrs
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
