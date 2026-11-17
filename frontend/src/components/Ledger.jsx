import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { naira } from "../format.js";

export default function Ledger() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "income",
    description: "",
    amount: "",
  });
  const [error, setError] = useState("");

  const load = useCallback(async () => setItems(await api.getTransactions(token)), [token]);
  useEffect(() => { load(); }, [load]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.addTransaction(token, { ...form, amount: Number(form.amount) });
      setForm({ ...form, description: "", amount: "" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    await api.deleteTransaction(token, id);
    await load();
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 space-y-6">
      <form onSubmit={submit} className="rounded-xl2 bg-white border border-line p-6 shadow-soft">
        <h2 className="font-display font-semibold text-ink/80 mb-4">Add a transaction</h2>
        <div className="grid sm:grid-cols-[auto_auto_1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="text-xs text-ink/50 block mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest" />
          </div>
          <div>
            <label className="text-xs text-ink/50 block mb-1">Type</label>
            <div className="flex rounded-lg border border-line overflow-hidden text-sm">
              {["income", "expense"].map((t) => (
                <button type="button" key={t} onClick={() => setForm({ ...form, type: t })}
                  className={`px-3 py-2 flex items-center gap-1 transition-colors ${form.type === t ? "bg-forest text-white" : "bg-white text-ink/60"}`}>
                  {t === "income" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {t === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-ink/50 block mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Sale of fabrics"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest" />
          </div>
          <div>
            <label className="text-xs text-ink/50 block mb-1">Amount (₦)</label>
            <input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="50000"
              className="w-32 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest" />
          </div>
          <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-ink text-white px-4 py-2 text-sm font-medium hover:bg-forest-dark transition-colors">
            <Plus size={15} /> Add
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <p className="mt-3 text-xs text-ink/40">Stored in your account's database — only you (and your supervisor, if they log in) can see this.</p>
      </form>

      <div className="rounded-xl2 bg-white border border-line shadow-soft overflow-hidden">
        <h2 className="font-display font-semibold text-ink/80 px-6 pt-6 mb-2">All transactions</h2>
        {items.length === 0 ? (
          <p className="text-sm text-ink/45 px-6 pb-6">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {items.map((t) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                  className="px-6 py-3 flex items-center justify-between gap-3 text-sm group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-ink/40 tabular-nums w-20 sm:w-24 shrink-0">{t.date}</span>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.type === "income" ? "bg-forest" : "bg-gold"}`} />
                    <span className="truncate">{t.description}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`font-medium tabular-nums ${t.type === "income" ? "text-forest" : "text-ink/70"}`}>
                      {t.type === "income" ? "+" : "-"}{naira(t.amount)}
                    </span>
                    <button onClick={() => remove(t._id)} className="text-ink/0 group-hover:text-ink/40 hover:!text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
