// One-time ingestion script (Chapter 4, 4.8: "a one-time ingestion script that
// chunks and embeds the NTA 2025 and NTAA 2025 texts into the vector store").
//
// Usage:
//   1. Set MONGO_URI and OPENAI_API_KEY in your .env file.
//   2. Run:  npm run ingest
//
// This embeds each chunk in data/knowledgeBase.js using OpenAI's embeddings API
// and stores the resulting vectors in the KnowledgeChunk collection. Re-run any
// time you add or change entries in knowledgeBase.js.

require("dotenv").config();
const mongoose = require("mongoose");
const KnowledgeChunk = require("../models/KnowledgeChunk");
const knowledgeBase = require("../data/knowledgeBase");
const { embed } = require("../lib/rag");

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set. Copy .env.example to .env and fill it in first.");
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set. Ingestion requires it to generate embeddings.");
    console.error("(Tax Buddy will still work without this, using simple rule-based answers —");
    console.error(" but it will not be doing real semantic retrieval until you run this script.)");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected. Ingesting ${knowledgeBase.length} knowledge chunks...`);

  await KnowledgeChunk.deleteMany({}); // clean re-ingest

  for (const item of knowledgeBase) {
    const embedding = await embed(item.text);
    await KnowledgeChunk.create({ ...item, embedding });
    console.log(`  embedded: ${item.sourceAct} ${item.sectionRef}`);
  }

  console.log("Done. Tax Buddy can now perform real semantic retrieval over these chunks.");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error("Ingestion failed:", e.message);
  process.exit(1);
});
