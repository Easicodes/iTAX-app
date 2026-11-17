// A thin space (U+2009) between the Naira sign and the digits avoids a visual
// overlap that occurs in some fonts where the ₦ glyph falls back to a
// different font than the digits (their advance widths don't line up).
export function naira(n) {
  return "\u20a6\u2009" + Math.round(n).toLocaleString();
}
