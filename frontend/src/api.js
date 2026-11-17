const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function request(path, { token, ...opts } = {}) {
  const res = await fetch(API_BASE_URL + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  register: (payload) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  getTransactions: (token) => request("/api/transactions", { token }),
  addTransaction: (token, payload) => request("/api/transactions", { token, method: "POST", body: JSON.stringify(payload) }),
  deleteTransaction: (token, id) => request(`/api/transactions/${id}`, { token, method: "DELETE" }),
  getSummary: (token) => request("/api/transactions/summary", { token }),

  fileDraft: (token, periodYear) => request("/api/tax/file", { token, method: "POST", body: JSON.stringify({ periodYear }) }),
  submitFiling: (token, id) => request(`/api/tax/${id}/submit`, { token, method: "POST" }),
  getFilings: (token) => request("/api/tax/filings", { token }),

  sendChat: (token, message) => request("/api/chat", { token, method: "POST", body: JSON.stringify({ message }) }),
  getChatHistory: (token) => request("/api/chat/history", { token }),
};

export { API_BASE_URL };
