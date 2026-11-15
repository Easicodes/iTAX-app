const express = require("express");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const TaxFiling = require("../models/TaxFiling");
const requireAuth = require("../middleware/auth");
const { calculateCIT } = require("../lib/cit");

const router = express.Router();
router.use(requireAuth);

// Generate (or regenerate) a draft return for a given assessment year,
// matching the "Generate itemised draft CIT return" step in Figure 4.3.
router.post("/file", async (req, res) => {
  const periodYear = Number(req.body.periodYear) || new Date().getFullYear();
  const items = await Transaction.find({ userId: req.userId });
  const user = await User.findById(req.userId);
  const { income, expenses, grossProfit, turnover, fixedAssets, isExempt, cit } = calculateCIT(items, user.fixedAssets);

  const filing = await TaxFiling.findOneAndUpdate(
    { userId: req.userId, periodYear },
    { income, expenses, grossProfit, turnover, fixedAssets, isExempt, citLiability: cit, status: "draft" },
    { upsert: true, new: true }
  );
  res.status(201).json(filing);
});

// "User confirms submission?" -> Yes path in Figure 4.3 (simulated NRS submission).
router.post("/:id/submit", async (req, res) => {
  const filing = await TaxFiling.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { status: "submitted" },
    { new: true }
  );
  if (!filing) return res.status(404).json({ error: "Filing not found" });
  res.json(filing);
});

router.get("/filings", async (req, res) => {
  const filings = await TaxFiling.find({ userId: req.userId }).sort({ periodYear: -1 });
  res.json(filings);
});

module.exports = router;
