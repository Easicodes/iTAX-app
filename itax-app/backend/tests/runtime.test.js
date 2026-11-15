const path = require("path");
const { resolveAppEntry } = require("../lib/runtime");

test("resolveAppEntry prefers the backend server when launched from the repo root", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const expected = path.join(repoRoot, "server.js");
  expect(resolveAppEntry(path.resolve(__dirname, "..", ".."))).toBe(expected);
});

test("resolveAppEntry keeps the backend path unchanged when already inside backend", () => {
  const backendRoot = path.resolve(__dirname, "..");
  expect(resolveAppEntry(backendRoot)).toBe(path.join(backendRoot, "server.js"));
});
