import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, ArrowRight } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ businessName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const data = await api[mode](form);
      login(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-forest text-white p-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-forest-light/30 blur-3xl" />
        <div className="absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <Landmark size={26} strokeWidth={2.2} />
          <span className="font-display font-semibold text-xl tracking-tight">iTAX</span>
        </div>
        <div className="relative max-w-sm">
          <p className="font-display text-4xl leading-tight font-medium">
            Tax compliance that speaks your language, not the statute's.
          </p>
          <p className="mt-5 text-forest-light/90 text-[15px] leading-relaxed">
            Built for Nigerian SMEs navigating the NTA 2025 reforms — track income and
            expenses, see your Company Income Tax position instantly, and ask Tax Buddy
            when the rules get confusing.
          </p>
        </div>
        <p className="relative text-sm text-white/60">iTAX Prototype &middot; Final Year Project</p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10 text-forest">
            <Landmark size={24} />
            <span className="font-display font-semibold text-lg">iTAX</span>
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-ink/60 mt-1.5 text-[15px]">
            {mode === "login" ? "Log in to see where you stand with the NRS." : "Takes less than a minute."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {mode === "register" && (
                <motion.div
                  key="biz"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <label className="text-sm font-medium text-ink/70">Business name</label>
                  <input
                    className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition"
                    placeholder="Musa's Fabrics"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-sm font-medium text-ink/70">Email</label>
              <input
                type="email"
                className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition"
                placeholder="you@business.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">Password</label>
              <input
                type="password"
                className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-sm text-red-600"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink text-white py-2.75 py-[11px] font-medium text-[15px] hover:bg-forest-dark transition-colors disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
              {!busy && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink/60">
            {mode === "login" ? "New to iTAX? " : "Already registered? "}
            <button
              className="text-forest font-medium hover:text-forest-dark"
              onClick={() => { setError(""); setMode(mode === "login" ? "register" : "login"); }}
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
