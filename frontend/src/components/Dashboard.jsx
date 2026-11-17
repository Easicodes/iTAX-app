import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, FileCheck2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCountUp } from "./useCountUp.js";
import { naira } from "../format.js";

export default function Dashboard() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filings, setFilings] = useState([]);
  const [filing, setFiling] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [s, tx, f] = await Promise.all([
      api.getSummary(token),
      api.getTransactions(token),
      api.getFilings(token),
    ]);
    setSummary(s); setTransactions(tx); setFilings(f);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const heroValue = useCountUp(summary ? (summary.isExempt ? 0 : summary.cit) : 0);
  const netProfit = summary ? summary.income - summary.expenses : 0;

  const chartData = React.useMemo(() => {
    const byDate = {};
    transactions.forEach((t) => {
      byDate[t.date] = byDate[t.date] || { date: t.date, income: 0, expenses: 0 };
      byDate[t.date][t.type === "income" ? "income" : "expenses"] += t.amount;
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  async function generateDraft() {
    setFiling(true); setMsg("");
    try {
      await api.fileDraft(token, new Date().getFullYear());
      setMsg("Draft return generated below.");
      await load();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setFiling(false);
    }
  }

  async function confirmSubmit(id) {
    await api.submitFiling(token, id);
    await load();
  }

  if (!summary) return <div className="max-w-5xl mx-auto px-5 py-16 text-ink/40 text-sm">Loading your position…</div>;

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 space-y-6">
      {/* Hero row */}
      <div className="grid md:grid-cols-5 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="md:col-span-3 rounded-xl2 bg-ink text-white p-8 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute -right-10 -bottom-16 w-56 h-56 rounded-full bg-forest/40 blur-3xl" />
          <div className="relative flex items-center gap-2 text-white/60 text-sm">
            {summary.isExempt ? <ShieldCheck size={16} className="text-gold" /> : <ShieldAlert size={16} className="text-gold" />}
            Estimated Company Income Tax — {new Date().getFullYear()}
          </div>
          <div className="relative mt-6">
            <span className="font-display text-5xl sm:text-6xl font-semibold tracking-tight tabular-nums">
              {naira(heroValue)}
            </span>
            {summary.isExempt && (
              <span className="ml-3 align-middle text-xs font-medium bg-gold/20 text-gold-light px-2.5 py-1 rounded-full border border-gold/30">
                Small Company Exemption
              </span>
            )}
          </div>
          <p className="relative mt-4 text-white/70 text-[15px] leading-relaxed max-w-md">
            {summary.isExempt
              ? `Your turnover (${naira(summary.turnover)}) and fixed assets (${naira(summary.fixedAssets)}) are both under the NTA 2025 §56 thresholds, so no CIT is due this year.`
              : `Your figures are above the Small Company Exemption thresholds, so the standard 30% rate applies to your net profit.`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
          className="md:col-span-2 rounded-xl2 bg-white border border-line p-6 flex flex-col justify-between shadow-soft"
        >
          <dl className="space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-ink/55 text-sm flex items-center gap-1.5"><ArrowUpRight size={14} className="text-forest" />Income</dt>
              <dd className="font-display font-semibold tabular-nums">{naira(summary.income)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink/55 text-sm flex items-center gap-1.5"><ArrowDownRight size={14} className="text-red-500" />Expenses</dt>
              <dd className="font-display font-semibold tabular-nums">{naira(summary.expenses)}</dd>
            </div>
            <div className="h-px bg-line" />
            <div className="flex items-center justify-between">
              <dt className="text-ink/70 text-sm font-medium">Net profit</dt>
              <dd className="font-display font-semibold tabular-nums text-forest-dark">{naira(netProfit)}</dd>
            </div>
          </dl>
          <button
            onClick={generateDraft}
            disabled={filing}
            className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-forest text-white text-sm font-medium py-2.5 hover:bg-forest-dark transition-colors disabled:opacity-50"
          >
            <FileCheck2 size={15} />
            {filing ? "Generating…" : "Generate draft return"}
          </button>
          {msg && <p className="mt-2 text-xs text-ink/50">{msg}</p>}
        </motion.div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl2 bg-white border border-line p-6 shadow-soft">
          <h2 className="font-display font-semibold text-ink/80 mb-4">Income vs. expenses</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F6B4C" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0F6B4C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D9A441" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#D9A441" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCE6DF" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#12182699" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#12182699" }} axisLine={false} tickLine={false} width={70}
                     tickFormatter={(v) => "\u20a6" + (v/1000).toFixed(0) + "k"} />
              <Tooltip formatter={(v) => naira(v)} contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF" }} />
              <Area type="monotone" dataKey="income" stroke="#0F6B4C" fill="url(#inc)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#D9A441" fill="url(#exp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filing history */}
      <div className="rounded-xl2 bg-white border border-line p-6 shadow-soft">
        <h2 className="font-display font-semibold text-ink/80 mb-4">Filing history</h2>
        {filings.length === 0 ? (
          <p className="text-sm text-ink/45">No draft returns yet — generate one above when you're ready.</p>
        ) : (
          <div className="divide-y divide-line">
            {filings.map((f) => (
              <div key={f._id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{f.periodYear}</span>
                  <span className="text-ink/50">{naira(f.grossProfit)} gross profit</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={f.isExempt ? "text-forest font-medium" : "font-medium"}>
                    {f.isExempt ? "Exempt" : naira(f.citLiability)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${f.status === "submitted" ? "bg-forest/10 text-forest-dark" : "bg-gold/15 text-gold"}`}>
                    {f.status}
                  </span>
                  {f.status === "draft" && (
                    <button onClick={() => confirmSubmit(f._id)} className="text-forest hover:text-forest-dark font-medium">
                      Confirm submission
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <div className="rounded-xl2 bg-white border border-line p-6 shadow-soft">
        <h2 className="font-display font-semibold text-ink/80 mb-4">Recent transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-ink/45">Nothing recorded yet — add your first transaction in the Ledger tab.</p>
        ) : (
          <div className="divide-y divide-line">
            {transactions.slice(0, 5).map((t) => (
              <div key={t._id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-ink/40 tabular-nums w-20 sm:w-24 shrink-0">{t.date}</span>
                  <span className="truncate">{t.description}</span>
                </div>
                <span className={`font-medium tabular-nums shrink-0 ${t.type === "income" ? "text-forest" : "text-red-500"}`}>
                  {t.type === "income" ? "+" : "-"}{naira(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
