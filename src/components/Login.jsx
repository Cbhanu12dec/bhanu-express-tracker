import { useState } from "react";
import { Lock } from "lucide-react";
import { ALLOWED_EMAIL } from "../firebase";

export default function Login({ onLogin, error }) {
  const [email, setEmail] = useState(ALLOWED_EMAIL);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await onLogin(email, password);
    setSubmitting(false);
  }

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at top, #15121e 0%, #08070c 55%, #060509 100%)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border p-6"
        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #A78BFA, #22D3EE)" }}
          >
            <Lock size={15} className="text-black" />
          </div>
          <h1 className="text-lg font-bold text-white">Paycheck tracker</h1>
        </div>
        <p className="text-xs text-white/40 mb-6 ml-[42px]">Locked to a single account</p>

        <label className="block text-xs font-medium text-white/40 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white mb-4 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
        />
        <label className="block text-xs font-medium text-white/40 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white mb-4 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
        />

        {error && <p className="text-xs text-[#F0288C] mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-black text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50 transition-transform active:scale-95"
          style={{ background: "linear-gradient(135deg, #A78BFA, #22D3EE)" }}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
