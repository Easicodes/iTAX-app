// Minimal Retrieval-Augmented Generation (RAG) helpers.
// Uses OpenAI's embeddings + chat completion APIs when OPENAI_API_KEY is set.
// Falls back to simple keyword matching (no cost, no key needed) otherwise,
// so the app still works end-to-end for free during grading/demo.

async function embed(text) {
  const key = process.env.OPENAI_API_KEY;
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });
  if (!resp.ok) throw new Error(`OpenAI embeddings error: ${resp.status}`);
  const data = await resp.json();
  return data.data[0].embedding;
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Given a query embedding and an array of KnowledgeChunk docs (each with .embedding),
 * return the top-k most similar chunks, highest similarity first.
 */
function topKSimilar(queryEmbedding, chunks, k = 3) {
  return chunks
    .map((c) => ({ chunk: c, score: cosineSimilarity(queryEmbedding, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((r) => r.chunk);
}

async function chatCompletion(prompt) {
  const key = process.env.OPENAI_API_KEY;
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 250,
    }),
  });
  if (!resp.ok) throw new Error(`OpenAI chat completion error: ${resp.status}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response just now.";
}

// Simple keyword-based fallback used when no OPENAI_API_KEY is configured,
// so the chatbot still works for free. Returns null if nothing matches
// (the caller then returns an "I'm not certain" response) — this is what
// Test UT-04 ("chatbot query on an unrelated topic") checks.
function ruleBasedMatch(question) {
  const q = question.toLowerCase();
  if (q.includes("exempt") || q.includes("threshold") || q.includes("100,000,000") || q.includes("100m")) {
    return { text: "Under Section 56 of the NTA 2025, you're exempt from Company Income Tax if your annual turnover is \u20a6100,000,000 or less AND your fixed assets are \u20a6250,000,000 or less.", source: "NTA 2025, s.56" };
  }
  if (q.includes("record") || q.includes("register") || q.includes("file")) {
    return { text: "Even if you're CIT-exempt, you must still register with the NRS, keep accurate records of your transactions, and file an annual return.", source: "NTAA 2025, Part IV" };
  }
  if (q.includes("rate") || q.includes("30%") || q.includes("how much")) {
    return { text: "If your business is above the Small Company Exemption thresholds, Company Income Tax is charged at 30% of your taxable profit.", source: "NTA 2025, s.56" };
  }
  if (q.includes("firs") || q.includes("nrs") || q.includes("taxpro")) {
    return { text: "The Federal Inland Revenue Service (FIRS) has been replaced by the Nigeria Revenue Service (NRS). TaxPro Max remains the official portal for filing returns.", source: "NTAA 2025" };
  }
  return null;
}

module.exports = { embed, cosineSimilarity, topKSimilar, chatCompletion, ruleBasedMatch };
