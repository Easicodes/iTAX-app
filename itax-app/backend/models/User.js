const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  fixedAssets: { type: Number, default: 900000 }, // used for the CIT exemption check
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
