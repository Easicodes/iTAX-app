const mongoose = require("mongoose");

const taxFilingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  periodYear: { type: Number, required: true },
  income: { type: Number, required: true },
  expenses: { type: Number, required: true },
  grossProfit: { type: Number, required: true },
  turnover: { type: Number, required: true },
  fixedAssets: { type: Number, required: true },
  isExempt: { type: Boolean, required: true },
  citLiability: { type: Number, required: true },
  status: { type: String, enum: ["draft", "submitted"], default: "draft" },
}, { timestamps: true });

module.exports = mongoose.model("TaxFiling", taxFilingSchema);
