import { c } from "../../utils/logger.js";
import { suggest } from "../../utils/validate.js";

const SUBCOMMANDS = ["add", "install"];

const BASE = `
${c("natroc-plugins zcode", "bold")} ${c("[arguments]", "dim")}

${c("ARGUMENTS", "bold")}
  ${c("add", "cyan").padEnd(60)}Add marketplace to ZCode
  ${c("install", "cyan").padEnd(60)}Install plugins for ZCode

${c("INFO", "bold")}
  ${c("natroc-plugins zcode --help, -h", "cyan").padEnd(60)}Detailed usage
`;

const HELP = `
${c("natroc-plugins zcode", "bold")} ${c("[arguments]", "dim")} ${c("[flags]", "dim")}

${c("ARGUMENTS", "bold")}
  ${c("add", "cyan").padEnd(60)}Add marketplace to ZCode
  ${c("install", "cyan").padEnd(60)}Auto install all plugins
  ${c("install --<plugin-name>", "cyan").padEnd(60)}Install a specific plugin

${c("EXAMPLE", "bold")}
  ${c("natroc-plugins zcode add", "cyan").padEnd(60)}Initialize marketplace for ZCode
  ${c("natroc-plugins zcode install", "cyan").padEnd(60)}Select and Install All Plugins
  ${c("natroc-plugins install --human-context-writer", "cyan").padEnd(60)}Install a specific plugin

${c("FLAGS", "bold")}
  ${c("--help", "yellow")}, ${c("-h", "yellow")}  Show this help
`;

function unknownArgument(arg) {
  const s = suggest(arg, SUBCOMMANDS);

  console.error(`\n  ${c("Unknown argument:", "red")} ${c(arg, "yellow")}`);

  if (s.length > 0) {
    console.error(`  ${c("Did you mean:", "yellow")}`);
    for (const n of s) {
      console.error(`    ${c(n, "cyan")}`);
    }
  }

  console.error(
    `  ${c("Run", "dim")} ${c("natroc-plugins zcode --help", "cyan")} ${c("for usage.", "dim")}\n`,
  );
  process.exit(1);
}

export async function zcode(args) {
  if (args.length === 0) {
    console.log(BASE);
    return;
  }

  if (args[0] === "--help" || args[0] === "-h") {
    console.log(HELP);
    return;
  }

  if (
    args[0] &&
    args[0].startsWith("-") &&
    args[0] !== "--help" &&
    args[0] !== "-h"
  ) {
    console.error(`\n  ${c("Unknown flag:", "red")} ${c(args[0], "yellow")}`);
    console.error(
      `  ${c("Run", "dim")} ${c("natroc-plugins zcode --help", "cyan")} ${c("for valid flags.", "dim")}\n`,
    );
    process.exit(1);
  }

  const sub = args[0];
  const subArgs = args.slice(1);

  switch (sub) {
    case "add": {
      if (
        subArgs.length > 0 &&
        (subArgs[0] === "--help" || subArgs[0] === "-h")
      ) {
        console.log(HELP);
        return;
      }
      const { add } = await import("./arguments/add.js");
      await add(subArgs);
      break;
    }
    case "install": {
      if (
        subArgs.length > 0 &&
        (subArgs[0] === "--help" || subArgs[0] === "-h")
      ) {
        console.log(HELP);
        return;
      }
      const { install } = await import("./arguments/install.js");
      await install(subArgs);
      break;
    }
    default:
      unknownArgument(sub);
  }
}
