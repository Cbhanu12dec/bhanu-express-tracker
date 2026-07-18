import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus, Download, Trash2, Pencil, X, Check, Wallet, Radio,
  ChevronDown, StickyNote, Zap, LogOut,
} from "lucide-react";
import * as XLSX from "xlsx";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useEntries } from "../hooks/useEntries";

const RATE_A = 54.5;
const RATE_B = 57.8;
const COLOR_A = "#A78BFA";
const COLOR_B = "#22D3EE";
const COLOR_PENDING = "#F0288C";
const COLOR_OK = "#34D399";

const emptyForm = {
  month: new Date().toISOString().slice(0, 7),
  hoursA: "", hoursB: "", regularPaycheck: "", extraAmount: "", notes: "",
};

function money(n) {
  return (Number.isFinite(n) ? n : 0).toLocaleString("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}
function monthLabel(ym) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "short", year: "numeric" });
}

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);
  useEffect(() => {
    fromRef.current = val;
    startRef.current = null;
    let raf;
    const step = (ts) => {
      if (startRef.current === null) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(fromRef.current + (target - fromRef.current) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);
  return val;
}

function MetricCard({ icon, label, value, accent }) {
  const animated = useCountUp(value);
  return (
    <div className="relative rounded-2xl p-5 border overflow-hidden"
      style={{ background: "linear-gradient(155deg, #14141c 0%, #0e0e15 100%)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="relative flex items-center gap-2 mb-3" style={{ color: accent }}>
        {icon}
        <span className="text-xs font-semibold tracking-wide uppercase text-white/50">{label}</span>
      </div>
      <p className="relative text-3xl font-bold tabular-nums text-white tracking-tight">{money(animated)}</p>
    </div>
  );
}

function SignalGauge({ pct }) {
  const bars = [0.2, 0.4, 0.6, 0.8, 1];
  const filled = Math.round(pct * 5);
  return (
    <div className="flex items-end gap-1.5 h-10">
      {bars.map((h, i) => {
        const isFilled = i < filled;
        return (
          <div key={i} className="w-2.5 rounded-sm transition-all duration-700 ease-out"
            style={{
              height: `${h * 100}%`,
              background: isFilled ? `linear-gradient(180deg, ${COLOR_OK}, ${COLOR_B})` : "rgba(255,255,255,0.08)",
              boxShadow: isFilled ? `0 0 10px ${COLOR_OK}55` : "none",
              transitionDelay: `${i * 80}ms`,
            }} />
        );
      })}
    </div>
  );
}

function HistoryRow({ entry, index, maxGross, onEdit, onDelete }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40 + index * 60);
    return () => clearTimeout(t);
  }, [index]);

  const pctA = maxGross > 0 ? (entry.grossA / maxGross) * 100 : 0;
  const pctB = maxGross > 0 ? (entry.grossB / maxGross) * 100 : 0;
  const receivedPct = entry.gross > 0 ? Math.min((entry.received / entry.gross) * 100, 100) : 0;
  const hasPending = entry.pending > 0.004;

  return (
    <div className="rounded-xl border transition-all"
      style={{
        borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)",
        opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(14px)", transitionDuration: "500ms",
      }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-4 px-4 py-3 text-left group">
        <div className="w-20 shrink-0">
          <p className="text-sm font-semibold text-white">{monthLabel(entry.month)}</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-2.5 rounded-full overflow-hidden flex bg-white/5">
            <div className="h-full transition-all ease-out" style={{ width: mounted ? `${pctA}%` : "0%", background: COLOR_A, transitionDuration: "900ms" }} />
            <div className="h-full transition-all ease-out" style={{ width: mounted ? `${pctB}%` : "0%", background: COLOR_B, transitionDuration: "900ms", transitionDelay: "120ms" }} />
          </div>
          <div className="h-1 rounded-full overflow-hidden mt-1.5 bg-white/5 relative">
            <div className="h-full transition-all ease-out"
              style={{
                width: mounted ? `${receivedPct}%` : "0%",
                background: hasPending ? COLOR_PENDING : COLOR_OK,
                transitionDuration: "1100ms", transitionDelay: "200ms",
                ...(hasPending ? {
                  backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 6px, transparent 6px 12px)",
                  backgroundSize: "200% 100%", animation: "stripe-move 1.4s linear infinite",
                } : {}),
              }} />
          </div>
        </div>
        <div className="text-right shrink-0 w-28">
          <p className="text-sm font-bold tabular-nums" style={{ color: hasPending ? COLOR_PENDING : "rgba(255,255,255,0.4)" }}>
            {hasPending ? money(entry.pending) : "settled"}
          </p>
          <p className="text-[11px] text-white/35 tabular-nums">{money(entry.gross)} gross</p>
        </div>
        <ChevronDown size={16} className="text-white/30 shrink-0 transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>

      <div className="grid transition-all duration-300 ease-out overflow-hidden" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-4 pt-1 border-t border-white/5 mt-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
              <div><p className="text-white/35 mb-0.5">Company A</p><p className="text-white font-medium tabular-nums">{Number(entry.hoursA) || 0} hrs &middot; {money(entry.grossA)}</p></div>
              <div><p className="text-white/35 mb-0.5">Company B</p><p className="text-white font-medium tabular-nums">{Number(entry.hoursB) || 0} hrs &middot; {money(entry.grossB)}</p></div>
              <div><p className="text-white/35 mb-0.5">Regular paycheck</p><p className="text-white font-medium tabular-nums">{money(Number(entry.regularPaycheck) || 0)}</p></div>
              <div><p className="text-white/35 mb-0.5">Extra taken</p><p className="text-white font-medium tabular-nums">{money(Number(entry.extraAmount) || 0)}</p></div>
            </div>
            {entry.notes && (
              <div className="flex items-start gap-1.5 text-xs text-white/50 mb-3">
                <StickyNote size={13} className="mt-0.5 shrink-0" /><span>{entry.notes}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button onClick={() => onEdit(entry)} className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors">
                <Pencil size={12} /> Edit
              </button>
              <button onClick={() => onDelete(entry.month)} className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-[#F0288C] transition-colors">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ uid, onLogout }) {
  const { entries, loaded, saveEntry, deleteEntry } = useEntries(uid);
  const [form, setForm] = useState(emptyForm);
  const [editingMonth, setEditingMonth] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const computed = useMemo(() => {
    return entries.map((e) => {
      const grossA = (Number(e.hoursA) || 0) * RATE_A;
      const grossB = (Number(e.hoursB) || 0) * RATE_B;
      const gross = grossA + grossB;
      const received = (Number(e.regularPaycheck) || 0) + (Number(e.extraAmount) || 0);
      return { ...e, grossA, grossB, gross, received, pending: gross - received };
    }).sort((a, b) => (a.month < b.month ? 1 : -1));
  }, [entries]);

  const maxGross = useMemo(() => Math.max(1, ...computed.map((e) => e.gross)), [computed]);
  const totals = useMemo(() => computed.reduce((acc, e) => {
    acc.gross += e.gross; acc.received += e.received; acc.pending += e.pending; return acc;
  }, { gross: 0, received: 0, pending: 0 }), [computed]);

  const chartData = useMemo(() => computed.slice().sort((a, b) => (a.month > b.month ? 1 : -1)).map((e) => ({
    month: monthLabel(e.month).replace(" 20", " '"), gross: Number(e.gross.toFixed(2)), received: Number(e.received.toFixed(2)),
  })), [computed]);

  const pctPaid = totals.gross > 0 ? Math.min(totals.received / totals.gross, 1) : 0;
  const pendingAnimated = useCountUp(totals.pending);

  function resetForm() { setForm(emptyForm); setEditingMonth(null); }
  function startEdit(entry) {
    setForm({ month: entry.month, hoursA: entry.hoursA, hoursB: entry.hoursB, regularPaycheck: entry.regularPaycheck, extraAmount: entry.extraAmount, notes: entry.notes || "" });
    setEditingMonth(entry.month);
  }

  async function handleSave() {
    setError("");
    if (!form.month) { setError("Pick a month first."); return; }
    const exists = entries.some((e) => e.month === form.month);
    if (exists && editingMonth !== form.month) { setError("That month is already logged — edit it below instead."); return; }
    setSaving(true);
    try {
      await saveEntry(uid, form);
      resetForm();
    } catch (e) {
      setError("Could not save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(month) {
    try {
      await deleteEntry(uid, month);
      if (editingMonth === month) resetForm();
    } catch (e) {
      setError("Could not delete. Try again.");
    }
  }

  function exportSpreadsheet() {
    const rows = computed.slice().sort((a, b) => (a.month > b.month ? 1 : -1)).map((e) => ({
      Month: monthLabel(e.month), "Company A hours": Number(e.hoursA) || 0, "Company A rate": RATE_A,
      "Company B hours": Number(e.hoursB) || 0, "Company B rate": RATE_B,
      "Gross earned": Number(e.gross.toFixed(2)), "Regular paycheck": Number(e.regularPaycheck) || 0,
      "Extra amount taken": Number(e.extraAmount) || 0, "Total received": Number(e.received.toFixed(2)),
      "Remaining pending": Number(e.pending.toFixed(2)), Notes: e.notes || "",
    }));
    rows.push({
      Month: "TOTAL", "Company A hours": "", "Company A rate": "", "Company B hours": "", "Company B rate": "",
      "Gross earned": Number(totals.gross.toFixed(2)), "Regular paycheck": "", "Extra amount taken": "",
      "Total received": Number(totals.received.toFixed(2)), "Remaining pending": Number(totals.pending.toFixed(2)), Notes: "",
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 13 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 24 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Paycheck Tracker");
    XLSX.writeFile(wb, "paycheck-tracker.xlsx");
  }

  const inputCls = "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500/60 transition-all";
  const labelCls = "block text-xs font-medium text-white/40 mb-1";

  return (
    <div className="w-full min-h-screen" style={{ background: "radial-gradient(ellipse at top, #15121e 0%, #08070c 55%, #060509 100%)" }}>
      <style>{`
        @keyframes stripe-move { from { background-position: 0 0; } to { background-position: 24px 0; } }
        @keyframes pulse-ring { 0%,100% { box-shadow: 0 0 0 0 rgba(240,40,140,0.45);} 50% { box-shadow: 0 0 0 6px rgba(240,40,140,0);} }
        .pending-pulse { animation: pulse-ring 2.2s ease-in-out infinite; }
        input[type="month"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; }
      `}</style>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #A78BFA, #22D3EE)" }}>
              <Zap size={16} className="text-black" fill="black" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Paycheck tracker</h1>
          </div>
          <button onClick={onLogout} className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
            <LogOut size={14} /> Sign out
          </button>
        </div>
        <p className="text-sm text-white/35 ml-[42px] mb-8">
          <span style={{ color: COLOR_A }}>Company A ${RATE_A.toFixed(2)}/hr</span>
          <span className="mx-2 text-white/20">&middot;</span>
          <span style={{ color: COLOR_B }}>Company B ${RATE_B.toFixed(2)}/hr</span>
        </p>

        {!loaded ? (
          <div className="text-sm text-white/30 py-24 text-center">Loading your data&hellip;</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <MetricCard icon={<Radio size={15} />} label="Gross earned" value={totals.gross} accent={COLOR_A} />
              <MetricCard icon={<Wallet size={15} />} label="Total received" value={totals.received} accent={COLOR_OK} />
              <div className={`relative rounded-2xl p-5 border overflow-hidden ${totals.pending > 0.004 ? "pending-pulse" : ""}`}
                style={{ background: "linear-gradient(155deg, #1f1220 0%, #14090f 100%)", borderColor: "rgba(240,40,140,0.25)" }}>
                <div className="relative flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold tracking-wide uppercase text-white/50">Remaining pending</span>
                  <SignalGauge pct={pctPaid} />
                </div>
                <p className="relative text-3xl font-bold tabular-nums tracking-tight" style={{ color: COLOR_PENDING }}>{money(pendingAnimated)}</p>
              </div>
            </div>

            {chartData.length > 1 && (
              <div className="rounded-2xl border border-white/8 p-4 sm:p-5 mb-6" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-xs font-semibold tracking-wide uppercase text-white/40 mb-3">Gross vs received over time</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gGross" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLOR_A} stopOpacity={0.4} /><stop offset="100%" stopColor={COLOR_A} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gReceived" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLOR_OK} stopOpacity={0.5} /><stop offset="100%" stopColor={COLOR_OK} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} width={0} />
                    <Tooltip contentStyle={{ background: "#16141d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#fff" }} formatter={(v) => money(v)} />
                    <Area type="monotone" dataKey="gross" stroke={COLOR_A} strokeWidth={2} fill="url(#gGross)" />
                    <Area type="monotone" dataKey="received" stroke={COLOR_OK} strokeWidth={2} fill="url(#gReceived)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="rounded-2xl border border-white/8 p-4 sm:p-5 mb-6" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">{editingMonth ? `Edit ${monthLabel(editingMonth)}` : "Add a month"}</h2>
                {editingMonth && (
                  <button onClick={resetForm} className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors">
                    <X size={14} /> Cancel edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Month</label>
                  <input type="month" className={inputCls} value={form.month} disabled={!!editingMonth} onChange={(e) => setForm({ ...form, month: e.target.value })} />
                </div>
                <div />
                <div>
                  <label className={labelCls}>Company A hours (${RATE_A}/hr)</label>
                  <input type="number" step="0.1" placeholder="0.0" className={inputCls} value={form.hoursA} onChange={(e) => setForm({ ...form, hoursA: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Company B hours (${RATE_B}/hr)</label>
                  <input type="number" step="0.1" placeholder="0.0" className={inputCls} value={form.hoursB} onChange={(e) => setForm({ ...form, hoursB: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Regular paycheck received</label>
                  <input type="number" step="0.01" placeholder="0.00" className={inputCls} value={form.regularPaycheck} onChange={(e) => setForm({ ...form, regularPaycheck: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Extra amount taken</label>
                  <input type="number" step="0.01" placeholder="0.00" className={inputCls} value={form.extraAmount} onChange={(e) => setForm({ ...form, extraAmount: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Notes</label>
                  <input type="text" placeholder="e.g. advance for car repair" className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              {error && <p className="text-xs mt-3" style={{ color: COLOR_PENDING }}>{error}</p>}
              <div className="flex justify-end mt-4">
                <button onClick={handleSave} disabled={saving}
                  className="inline-flex items-center gap-1.5 text-black text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50 transition-transform active:scale-95"
                  style={{ background: "linear-gradient(135deg, #A78BFA, #22D3EE)" }}>
                  {editingMonth ? <Check size={16} /> : <Plus size={16} />}
                  {saving ? "Saving…" : editingMonth ? "Save changes" : "Save month"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 p-4 sm:p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Monthly history</h2>
                <button onClick={exportSpreadsheet} disabled={computed.length === 0}
                  className="inline-flex items-center gap-1.5 border border-white/15 hover:border-white/30 hover:bg-white/5 text-white/80 text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-30 transition-all">
                  <Download size={14} /> Export spreadsheet
                </button>
              </div>
              {computed.length === 0 ? (
                <p className="text-sm text-white/30 py-10 text-center">No months logged yet. Add your first month above.</p>
              ) : (
                <div className="space-y-2">
                  {computed.map((e, i) => (
                    <HistoryRow key={e.month} entry={e} index={i} maxGross={maxGross} onEdit={startEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-white/25 mt-4 text-center">Saved to your account &middot; persists until you delete it.</p>
          </>
        )}
      </div>
    </div>
  );
}
