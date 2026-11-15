const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatSession", required: true, index: true },
  sender: { type: String, enum: ["user", "bot"], required: true },
  content: { type: String, required: true },
  retrievedSourceRefs: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
