import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function money(n) {
  return (Number.isFinite(n) ? n : 0).toLocaleString("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

export default function AmountModal({ label, valueKey, color, entries, onClose }) {
  // entries here are the already-computed rows (have .gross, .received, .pending)
  // Group by year: { 2024: { 9: 1234.5, 10: 987.2, ... }, 2025: {...} }
  const byYear = useMemo(() => {
    const map = {};
    entries.forEach((e) => {
      const [y, m] = e.month.split("-").map(Number);
      const val = Number(e[valueKey]) || 0;
      if (!map[y]) map[y] = {};
      map[y][m] = val;
    });
    return map;
  }, [entries, valueKey]);

  const years = useMemo(
    () => Object.keys(byYear).map(Number).sort((a, b) => b - a),
    [byYear]
  );

  const [yearIdx, setYearIdx] = useState(0);
  const year = years[yearIdx];
  const monthsData = byYear[year] || {};
  const yearTotal = Object.values(monthsData).reduce((s, v) => s + v, 0);
  const maxVal = Math.max(1, ...Object.values(monthsData));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-5 sm:p-6"
        style={{ background: "#14141c", borderColor: "rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-white">{label}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-white/35 mb-4">Paginated by year</p>

        {years.length === 0 ? (
          <p className="text-sm text-white/30 py-10 text-center">No data logged yet.</p>
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

            <div className="space-y-2 mb-4 max-h-80 overflow-y-auto pr-1">
              {MONTH_NAMES.map((name, i) => {
                const m = i + 1;
                const val = monthsData[m];
                const has = val !== undefined;
                const barPct = maxVal > 0 && has ? Math.max((val / maxVal) * 100, 4) : 0;
                return (
                  <div
                    key={m}
                    className="rounded-xl border px-3.5 py-3"
                    style={{
                      borderColor: has ? `${color}35` : "rgba(255,255,255,0.06)",
                      background: has ? `${color}10` : "rgba(255,255,255,0.015)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-white/70">{name}</span>
                      <span
                        className="text-base font-bold tabular-nums"
                        style={{ color: has ? color : "rgba(255,255,255,0.25)" }}
                      >
                        {has ? money(val) : "No data"}
                      </span>
                    </div>
                    {has && (
                      <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${barPct}%`, background: color }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/8">
              <span className="text-sm text-white/50">Total for {year}</span>
              <span className="text-xl font-bold tabular-nums" style={{ color }}>{money(yearTotal)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
