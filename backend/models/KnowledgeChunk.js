const mongoose = require("mongoose");

const knowledgeChunkSchema = new mongoose.Schema({
  sourceAct: { type: String, required: true },   // e.g. "NTA 2025" or "NTAA 2025"
  sectionRef: { type: String, required: true },   // e.g. "s.56"
  text: { type: String, required: true },
  embedding: { type: [Number], default: [] },      // vector from OpenAI embeddings API
}, { timestamps: true });

module.exports = mongoose.model("KnowledgeChunk", knowledgeChunkSchema);
