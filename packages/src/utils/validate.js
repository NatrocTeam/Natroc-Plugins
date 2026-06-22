// ── Levenshtein distance ─────────────────────────────────────────────────────
export function levenshtein(a, b) {
  const an = a.length;
  const bn = b.length;
  const matrix = [];

  for (let i = 0; i <= bn; i++) matrix[i] = [i];
  for (let j = 0; j <= an; j++) matrix[0][j] = j;

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[bn][an];
}

// ── Fuzzy match score (0-1, higher = closer) ────────────────────────────────
export function fuzzyScore(input, target) {
  const inputLower = input.toLowerCase();
  const targetLower = target.toLowerCase();

  // Exact match
  if (targetLower === inputLower) return 1;

  // Substring match
  if (targetLower.includes(inputLower)) return 0.9;

  // Starts with
  if (targetLower.startsWith(inputLower)) return 0.85;

  // Contains all chars in order
  let ci = 0;
  for (const ch of targetLower) {
    if (ch === inputLower[ci]) ci++;
  }
  if (ci === inputLower.length) return 0.7;

  // Levenshtein-based
  const dist = levenshtein(inputLower, targetLower);
  const maxLen = Math.max(inputLower.length, targetLower.length);
  if (maxLen === 0) return 1;
  return 1 - dist / maxLen;
}

// ── Find best suggestions ────────────────────────────────────────────────────
const SUGGESTION_THRESHOLD = 0.25;

export function suggest(input, candidates, maxResults = 3) {
  const scored = candidates
    .map((candidate) => ({
      candidate,
      score: fuzzyScore(input, candidate),
    }))
    .filter((s) => s.score > SUGGESTION_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, maxResults).map((s) => s.candidate);
}
