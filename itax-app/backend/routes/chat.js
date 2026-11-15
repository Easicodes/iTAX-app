const express = require("express");
const requireAuth = require("../middleware/auth");
const ChatSession = require("../models/ChatSession");
const ChatMessage = require("../models/ChatMessage");
const KnowledgeChunk = require("../models/KnowledgeChunk");
const { embed, topKSimilar, chatCompletion, ruleBasedMatch } = require("../lib/rag");

const router = express.Router();
router.use(requireAuth);

// Get (or lazily create) the user's single ongoing chat session.
// Kept simple on purpose — one running thread per user, matching the
// 1:M User -> ChatSession -> ChatMessage relationship in Figure 4.2,
// without building a full multi-thread UI.
async function getOrCreateSession(userId) {
  let session = await ChatSession.findOne({ userId }).sort({ createdAt: -1 });
  if (!session) session = await ChatSession.create({ userId });
  return session;
}

router.get("/history", async (req, res) => {
  const session = await getOrCreateSession(req.userId);
  const messages = await ChatMessage.find({ sessionId: session._id }).sort({ createdAt: 1 });
  res.json(messages);
});

router.post("/", async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ error: "message is required" });

  const session = await getOrCreateSession(req.userId);
  await ChatMessage.create({ sessionId: session._id, sender: "user", content: message, retrievedSourceRefs: [] });

  let answer, sources = [], mode;

  try {
    if (process.env.OPENAI_API_KEY) {
      // Real RAG path: embed query -> similarity search over KnowledgeChunk -> grounded prompt -> chat completion
      const chunks = await KnowledgeChunk.find({ embedding: { $exists: true, $ne: [] } });
      if (chunks.length === 0) {
        throw new Error("Knowledge base is empty. Run `npm run ingest` first (see README).");
      }
      const queryEmbedding = await embed(message);
      const topChunks = topKSimilar(queryEmbedding, chunks, 3);
      sources = topChunks.map((c) => `${c.sourceAct}, ${c.sectionRef}`);

      const context = topChunks.map((c) => `[${c.sourceAct} ${c.sectionRef}] ${c.text}`).join("\n");
      const prompt = `You are "Tax Buddy", a helpful assistant inside a Nigerian SME tax-compliance app called iTAX. Answer the user's question using ONLY the retrieved context below, in 2-4 short, plain-language sentences. If the context doesn't cover the question, say you're not certain and recommend checking with the NRS or a tax professional. Do not repeat the source tags in your answer text; they are shown separately.\n\nRETRIEVED CONTEXT:\n${context}\n\nUSER QUESTION: ${message}`;
      answer = await chatCompletion(prompt);
      mode = "rag";
    } else {
      // Free fallback: keyword rule-matching, no embeddings/API key required.
      const match = ruleBasedMatch(message);
      if (match) {
        answer = match.text;
        sources = [match.source];
      } else {
        answer = "I'm not fully certain about that from what I've been given. For anything outside the Small Company Exemption rules, please check directly with the NRS or a tax professional.";
      }
      mode = "rule-based";
    }
  } catch (e) {
    const match = ruleBasedMatch(message);
    answer = match ? match.text : "Something went wrong reaching the AI assistant, and I couldn't find a rule-based answer either. Please try again.";
    sources = match ? [match.source] : [];
    mode = "fallback";
  }

  await ChatMessage.create({ sessionId: session._id, sender: "bot", content: answer, retrievedSourceRefs: sources });
  res.json({ answer, sources, mode });
});

module.exports = router;
