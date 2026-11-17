import React from "react";
import { Landmark, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import TabNav from "./TabNav.jsx";

export default function TopBar({ tab, setTab }) {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-20 bg-paper/80 backdrop-blur-md border-b border-line">
      <div className="max-w-5xl mx-auto px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-ink shrink-0">
          <Landmark size={22} className="text-forest" strokeWidth={2.2} />
          <span className="font-display font-semibold text-lg tracking-tight">iTAX</span>
        </div>

        <TabNav tab={tab} setTab={setTab} />

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-ink/70 hidden md:inline whitespace-nowrap">{user?.businessName}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors whitespace-nowrap"
          >
            <LogOut size={15} /> <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
