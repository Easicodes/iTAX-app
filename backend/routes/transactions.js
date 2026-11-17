const express = require("express");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");
const { calculateCIT, validateTransactionInput } = require("../lib/cit");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const items = await Transaction.find({ userId: req.userId }).sort({ date: -1, createdAt: -1 });
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const error = validateTransactionInput(req.body);
    if (error) return res.status(400).json({ error });

    const { date, type, description, amount } = req.body;
    const item = await Transaction.create({ userId: req.userId, date, type, description, amount });
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: "Could not add transaction", detail: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  await Transaction.deleteOne({ _id: req.params.id, userId: req.userId });
  res.status(204).send();
});

router.get("/summary", async (req, res) => {
  const items = await Transaction.find({ userId: req.userId });
  const user = await User.findById(req.userId);
  const summary = calculateCIT(items, user.fixedAssets);
  res.json(summary);
});

module.exports = router;
