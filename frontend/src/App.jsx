import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import TopBar from "./components/TopBar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Ledger from "./components/Ledger.jsx";
import Chat from "./components/Chat.jsx";

function Shell() {
  const { token } = useAuth();
  const [tab, setTab] = useState("dashboard");

  if (!token) return <AuthScreen />;

  return (
    <div className="min-h-screen">
      <TopBar tab={tab} setTab={setTab} />
      {tab === "dashboard" && <Dashboard />}
      {tab === "ledger" && <Ledger />}
      {tab === "chat" && <Chat />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
