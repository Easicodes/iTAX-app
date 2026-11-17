import React from "react";
import { motion } from "framer-motion";
import { LayoutGrid, BookOpen, MessageCircle } from "lucide-react";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "ledger", label: "Ledger", icon: BookOpen },
  { key: "chat", label: "Tax Buddy", icon: MessageCircle },
];

export default function TabNav({ tab, setTab }) {
  return (
    <div className="inline-flex items-center gap-1 bg-white border border-line rounded-full p-1 shadow-soft">
      {TABS.map(({ key, label, icon: Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              active ? "text-white" : "text-ink/60 hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 bg-forest rounded-full -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <Icon size={15} strokeWidth={2.2} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
