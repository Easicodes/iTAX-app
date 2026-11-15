// Figure 4.3 algorithm: Small Company Exemption, NTA 2025 s.56
// Kept as a pure function (no DB, no Express) so it can be unit-tested directly.

const TURNOVER_LIMIT = 100_000_000;
const ASSET_LIMIT = 250_000_000;
const STANDARD_CIT_RATE = 0.30;

/**
 * @param {Array<{type: 'income'|'expense', amount: number}>} transactions
 * @param {number} fixedAssets
 * @returns {{income:number, expenses:number, grossProfit:number, turnover:number, fixedAssets:number, isExempt:boolean, cit:number}}
 */
function calculateCIT(transactions, fixedAssets) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const grossProfit = income - expenses;
  const turnover = income;
  const isExempt = turnover <= TURNOVER_LIMIT && fixedAssets <= ASSET_LIMIT;
  const cit = isExempt ? 0 : Math.round(grossProfit * STANDARD_CIT_RATE);

  return { income, expenses, grossProfit, turnover, fixedAssets, isExempt, cit };
}

/** @param {{amount:number, type:string}} input */
function validateTransactionInput({ date, type, description, amount }) {
  if (!date || !type || !description || amount === undefined || amount === null) {
    return "date, type, description and amount are required";
  }
  if (!["income", "expense"].includes(type)) {
    return "type must be 'income' or 'expense'";
  }
  if (Number(amount) <= 0 || Number.isNaN(Number(amount))) {
    return "amount must be a number greater than 0";
  }
  return null;
}

module.exports = {
  calculateCIT,
  validateTransactionInput,
  TURNOVER_LIMIT,
  ASSET_LIMIT,
  STANDARD_CIT_RATE,
};
