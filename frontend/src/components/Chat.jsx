import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, BookMarked } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Chat() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    { sender: "bot", content: "Hello! I'm Tax Buddy. Ask me anything about NTA 2025 compliance for your business.", retrievedSourceRefs: [] },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    api.getChatHistory(token).then((history) => {
      if (history.length) setMessages(history);
    }).catch(() => {});
  }, [token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setMessages((m) => [...m, { sender: "user", content: text, retrievedSourceRefs: [] }]);
    setInput(""); setBusy(true);
    try {
      const data = await api.sendChat(token, text);
      setMessages((m) => [...m, { sender: "bot", content: data.answer, retrievedSourceRefs: data.sources || [] }]);
    } catch (e) {
      setMessages((m) => [...m, { sender: "bot", content: "Something went wrong reaching the assistant: " + e.message, retrievedSourceRefs: [] }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <div className="rounded-xl2 bg-white border border-line shadow-soft flex flex-col h-[70vh]">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-line">
          <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center">
            <Sparkles size={15} className="text-gold-light" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-ink">Tax Buddy</p>
            <p className="text-xs text-ink/45">Grounded in NTA 2025 &amp; NTAA 2025</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                  m.sender === "user" ? "bg-ink text-white" : "bg-paper border border-line text-ink"
                }`}>
                  {m.content}
                  {m.retrievedSourceRefs?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.retrievedSourceRefs.map((s, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-medium text-forest-dark bg-forest/10 px-2 py-0.5 rounded-full">
                          <BookMarked size={10} /> {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {busy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-paper border border-line rounded-2xl px-4 py-2.5 text-sm text-ink/40">
                Thinking…
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 border-t border-line flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about exemptions, filing, rates…"
            className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
          />
          <button
            onClick={send}
            disabled={busy}
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-forest text-white hover:bg-forest-dark transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
