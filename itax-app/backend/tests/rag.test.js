const { cosineSimilarity, topKSimilar, ruleBasedMatch } = require("../lib/rag");

test("UT-04: an unrelated/off-topic question returns no rule-based match", () => {
  const match = ruleBasedMatch("What's the weather like in Lagos today?");
  expect(match).toBeNull();
});

test("UT-04b: a question about the exemption threshold matches Section 56", () => {
  const match = ruleBasedMatch("Am I exempt from paying company income tax?");
  expect(match).not.toBeNull();
  expect(match.source).toMatch(/s\.56/);
});

test("UT-05: cosineSimilarity gives identical vectors a score of 1", () => {
  const v = [1, 0, 1, 0];
  expect(cosineSimilarity(v, v)).toBeCloseTo(1);
});

test("UT-05b: cosineSimilarity gives orthogonal vectors a score of 0", () => {
  expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
});

test("UT-05c: topKSimilar ranks the most relevant chunk first", () => {
  const chunks = [
    { sectionRef: "irrelevant", embedding: [0, 1] },
    { sectionRef: "exact-match", embedding: [1, 0] },
    { sectionRef: "somewhat-close", embedding: [0.8, 0.2] },
  ];
  const results = topKSimilar([1, 0], chunks, 2);
  expect(results[0].sectionRef).toBe("exact-match");
  expect(results.length).toBe(2);
});
