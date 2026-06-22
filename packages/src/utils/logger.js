// ── Colors ──────────────────────────────────────────────────────────────────
export const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

export function c(text, ...codes) {
  const open = codes.map((code) => colors[code] || code).join("");
  return `${open}${text}${colors.reset}`;
}

export function info(msg) {
  console.log(`  ${c("∷", "dim")} ${msg}`);
}

export function success(msg) {
  console.log(`  ${c("✔", "green")} ${c(msg, "green")}`);
}

export function fail(msg) {
  console.log(`  ${c("✘", "red")} ${c(msg, "red")}`);
}

export function dim(msg) {
  console.log(`  ${c(msg, "dim")}`);
}
