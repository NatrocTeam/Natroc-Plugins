import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { c } from "./utils/logger.js";
import { suggest } from "./utils/validate.js";
import { zcode } from "./commands/zcode/index.js";
import { list } from "./commands/list/index.js";

// ── Meta ────────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = JSON.parse(
  readFileSync(resolve(__dirname, "..", "package.json"), "utf8"),
);

const COMMANDS = ["list", "ls", "zcode"];

// ── Help ────────────────────────────────────────────────────────────────────
const HELP = `
${c("natroc-plugins", "bold")} ${c("v" + PKG.version, "dim")}

${c("USAGE", "bold")}
  ${c("natroc-plugins", "cyan")} ${c("[command]", "yellow")} ${c("[arguments]", "dim")} ${c("[flags]", "dim")}

${c("COMMANDS", "bold")}
  ${c("list", "cyan")}, ${c("ls", "cyan")}           Show all plugins list
  ${c("zcode", "cyan")}              Add marketplace to ZCode

${c("FLAGS", "bold")}
  ${c("--help", "yellow")}, ${c("-h", "yellow")}         Show this help
  ${c("--version", "yellow")}, ${c("-v", "yellow")}      Check package version
`;

// ── Router ──────────────────────────────────────────────────────────────────
function showHelp() {
  console.log(HELP);
}

function unknownCommand(cmd) {
  const suggestions = suggest(cmd, COMMANDS);

  console.error(`\n  ${c("Unknown command:", "red")} ${c(cmd, "yellow")}`);

  if (suggestions.length > 0) {
    console.error(`  ${c("Did you mean:", "yellow")}`);
    for (const s of suggestions) {
      console.error(`    ${c(s, "cyan")}`);
    }
  }

  console.error(
    `  ${c("Run", "dim")} ${c("natroc-plugins --help", "cyan")} ${c("for usage.", "dim")}\n`,
  );
  process.exit(1);
}

async function main() {
  const raw = process.argv.slice(2);

  if (raw.length === 0 || raw[0] === "--help" || raw[0] === "-h") {
    showHelp();
    return;
  }

  if (raw[0] === "--version" || raw[0] === "-v") {
    console.log(c(PKG.version, "bold"));
    return;
  }

  if (
    raw[0] &&
    raw[0].startsWith("-") &&
    raw[0] !== "--help" &&
    raw[0] !== "-h"
  ) {
    console.error(`\n  ${c("Unknown flag:", "red")} ${c(raw[0], "yellow")}`);
    console.error(
      `  ${c("Run", "dim")} ${c("natroc-plugins --help", "cyan")} ${c("for valid flags.", "dim")}\n`,
    );
    process.exit(1);
  }

  const cmd = raw[0];
  const args = raw.slice(1);

  switch (cmd) {
    case "list":
    case "ls":
      if (args.length > 0) {
        console.error(
          `\n  ${c('"' + cmd + '" does not accept arguments.', "red")}`,
        );
        console.error(
          `  ${c("Usage:", "dim")} ${c("natroc-plugins " + cmd, "cyan")}\n`,
        );
        process.exit(1);
      }
      list();
      break;

    case "zcode":
      await zcode(args);
      break;

    default:
      unknownCommand(cmd);
  }
}

main();
