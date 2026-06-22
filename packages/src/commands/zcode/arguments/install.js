import { existsSync, readFileSync, mkdirSync, cpSync, rmSync } from "fs";
import { join } from "path";
import os from "os";
import { c, success, fail } from "../../../utils/logger.js";
import { suggest } from "../../../utils/validate.js";
import { checkbox, spinner } from "../../../utils/prompt.js";

const MARKETPLACE_NAME = "natroc-plugins";
const MARKET_FILE = join(
  os.homedir(),
  ".zcode",
  "cli",
  "plugins",
  "marketplaces",
  MARKETPLACE_NAME,
  "marketplace.json",
);

const VALID_FLAGS = ["--help", "-h"];

function readRegisteredPlugins() {
  if (!existsSync(MARKET_FILE)) {
    return null;
  }
  const raw = readFileSync(MARKET_FILE, "utf8");
  return JSON.parse(raw).plugins || [];
}

function copyToZcode(srcPath, dstPath) {
  if (existsSync(dstPath)) {
    rmSync(dstPath, { recursive: true, force: true });
  }
  mkdirSync(dstPath, { recursive: true });
  cpSync(srcPath, dstPath, { recursive: true, force: true });
}

function getDstPath(name, version) {
  return join(
    os.homedir(),
    ".zcode",
    "cli",
    "plugins",
    "cache",
    "zcode-plugins-official",
    name,
    version,
  );
}

function getPluginNames(plugins) {
  return plugins.map((p) => p.name);
}

export async function install(args) {
  // ── Parse arguments ─────────────────────────────────────────────────────
  let specificPlugin = null;
  const cleanArgs = [];
  let hasHelpFlag = false;

  for (const arg of args) {
    if (arg.startsWith("--") && arg.length > 2) {
      if (arg === "--help") {
        hasHelpFlag = true;
        continue;
      }
      // Check if it looks like a known plugin name after --
      specificPlugin = arg.slice(2);
    } else if (arg === "-h") {
      hasHelpFlag = true;
    } else {
      cleanArgs.push(arg);
    }
  }

  if (cleanArgs.length > 1) {
    console.error(
      `\n  ${c("Too many arguments.", "red")} ${c("Usage:", "dim")} ${c("zcode install [--plugin-name]", "cyan")}\n`,
    );
    process.exit(1);
  }

  // ── Read marketplace ──────────────────────────────────────────────────
  const allPlugins = readRegisteredPlugins();

  if (!allPlugins || allPlugins.length === 0) {
    fail(`No registered plugins found. Run "zcode add" first.`);
    process.exit(1);
  }

  const pluginNames = getPluginNames(allPlugins);

  // ── Direct install ────────────────────────────────────────────────────
  if (specificPlugin) {
    if (hasHelpFlag) {
      console.log(
        `\n  ${c("Usage:", "bold")} ${c("zcode install --<plugin-name>", "cyan")}\n`,
      );
      return;
    }

    const match = allPlugins.find((p) => p.name === specificPlugin);
    if (!match) {
      const s = suggest(specificPlugin, pluginNames);
      console.error(
        `\n  ${c("Plugin not found:", "red")} ${c(specificPlugin, "yellow")}`,
      );
      if (s.length > 0) {
        console.error(`  ${c("Did you mean:", "yellow")}`);
        for (const n of s) console.error(`    ${c(n, "cyan")}`);
      }
      console.error(
        `  ${c("Run", "dim")} ${c("zcode install --help", "cyan")} ${c("to see available plugins.", "dim")}\n`,
      );
      process.exit(1);
    }

    const label = `${c(match.name, "bold")} ${c(match.version, "dim")}`;
    await spinner(
      label,
      new Promise((resolve, reject) => {
        try {
          copyToZcode(match.cachePath, getDstPath(match.name, match.version));
          resolve();
        } catch (err) {
          reject(err);
        }
      }),
    );

    return;
  }

  if (hasHelpFlag) {
    console.log(
      `\n  ${c("Usage:", "bold")} ${c("zcode install [--plugin-name]", "cyan")}`,
    );
    console.log(`  ${c("Plugins available:", "bold")} ${pluginNames.length}\n`);
    for (const name of pluginNames) {
      console.log(`    ${c(name, "white")}`);
    }
    console.log();
    return;
  }

  // ── Invalid flags ──────────────────────────────────────────────────────
  for (const arg of cleanArgs) {
    if (arg.startsWith("-")) {
      console.error(`\n  ${c("Unknown flag:", "red")} ${c(arg, "yellow")}`);
      console.error(
        `  ${c("Run", "dim")} ${c("zcode install --help", "cyan")} ${c("for usage.", "dim")}\n`,
      );
      process.exit(1);
    }
  }

  // ── Interactive ───────────────────────────────────────────────────────
  const choices = [
    { name: "__select_all__", label: "Select All", checked: true },
    ...allPlugins.map((p) => ({
      name: p.name,
      label: `${p.name} ${c(p.version, "dim")}`,
      checked: true,
    })),
  ];

  const selected = await checkbox({
    message: "Select plugins to install for ZCode:",
    choices,
  });

  const toInstall = allPlugins.filter((p) => selected.includes(p.name));

  if (toInstall.length === 0) {
    console.log(`\n  ${c("No plugins selected.", "dim")}\n`);
    return;
  }

  console.log(
    `\n  ${c(`Installing ${toInstall.length} plugin(s)...`, "bold")}\n`,
  );

  let ok = 0;
  for (const plugin of toInstall) {
    const label = `${c(plugin.name, "bold")} ${c(plugin.version, "dim")}`;
    try {
      await spinner(
        label,
        new Promise((resolve, reject) => {
          try {
            copyToZcode(
              plugin.cachePath,
              getDstPath(plugin.name, plugin.version),
            );
            resolve();
          } catch (err) {
            reject(err);
          }
        }),
      );
      ok++;
    } catch {
      fail(`Failed to install "${plugin.name}"`);
    }
  }

  console.log(
    `\n  ${c(`${ok}/${toInstall.length} installed successfully`, ok === toInstall.length ? "green" : "yellow")}\n`,
  );
}
