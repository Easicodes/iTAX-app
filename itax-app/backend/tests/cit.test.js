const { calculateCIT, validateTransactionInput } = require("../lib/cit");

// These correspond to Table 4.2 (Sample Unit Test Cases) in Chapter 4.

test("UT-01: turnover below thresholds -> Small Company Exemption applies, CIT = 0", () => {
  const transactions = [
    { type: "income", amount: 50_000_000 },
    { type: "expense", amount: 10_000_000 },
  ];
  const result = calculateCIT(transactions, 1_000_000); // fixed assets well under limit
  expect(result.isExempt).toBe(true);
  expect(result.cit).toBe(0);
  expect(result.grossProfit).toBe(40_000_000);
});

test("UT-02: turnover above threshold -> standard 30% CIT rate applies", () => {
  const transactions = [
    { type: "income", amount: 150_000_000 },
    { type: "expense", amount: 50_000_000 },
  ];
  const result = calculateCIT(transactions, 1_000_000);
  expect(result.isExempt).toBe(false);
  expect(result.grossProfit).toBe(100_000_000);
  expect(result.cit).toBe(30_000_000); // 30% of 100,000,000
});

test("UT-02b: fixed assets above threshold also disqualifies the exemption even if turnover is low", () => {
  const transactions = [{ type: "income", amount: 1_000_000 }];
  const result = calculateCIT(transactions, 300_000_000); // over the N250M asset limit
  expect(result.isExempt).toBe(false);
});

test("UT-03: validateTransactionInput rejects a zero or negative amount", () => {
  expect(validateTransactionInput({ date: "2026-01-01", type: "income", description: "Sale", amount: 0 }))
    .toMatch(/greater than 0/);
  expect(validateTransactionInput({ date: "2026-01-01", type: "income", description: "Sale", amount: -500 }))
    .toMatch(/greater than 0/);
});

test("UT-03b: validateTransactionInput rejects an invalid type", () => {
  expect(validateTransactionInput({ date: "2026-01-01", type: "refund", description: "x", amount: 100 }))
    .toMatch(/type must be/);
});

test("UT-03c: validateTransactionInput passes for a valid transaction", () => {
  expect(validateTransactionInput({ date: "2026-01-01", type: "expense", description: "Transport", amount: 5000 }))
    .toBeNull();
});
