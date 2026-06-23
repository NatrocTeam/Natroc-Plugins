import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  readFileSync,
  cpSync,
  rmSync,
} from "fs";
import { join, resolve } from "path";
import os from "os";
import { c, success, fail } from "../../../utils/logger.js";
import { suggest } from "../../../utils/validate.js";
import { pluginsDir } from "../../../utils/resolve-plugins.js";

const MARKETPLACE_NAME = "natroc-plugins";

export async function add(args) {
  // —— Flag validation ——
  for (const arg of args) {
    if (arg.startsWith("--")) {
      console.error(`\n  ${c("Unknown flag:", "red")} ${c(arg, "yellow")}`);
      console.error(
        `  ${c("Usage:", "dim")} ${c("zcode add", "cyan")} ${c("(takes no arguments)", "dim")}\n`,
      );
      process.exit(1);
    }
  }

  if (args.length > 0) {
    const s = suggest(args[0], []);
    console.error(
      `\n  ${c("Unexpected argument:", "red")} ${c(args[0], "yellow")}`,
    );
    console.error(
      `  ${c("Usage:", "dim")} ${c("zcode add", "cyan")} ${c("(takes no arguments)", "dim")}\n`,
    );
    process.exit(1);
  }

  // —— Locate bundled plugins ——
  let repoPluginsDir;
  try {
    repoPluginsDir = pluginsDir();
  } catch (err) {
    fail(err.message);
    process.exit(1);
  }

  const pluginDirs = readdirSync(repoPluginsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const zcodeCacheBase = join(
    os.homedir(),
    ".zcode",
    "cli",
    "plugins",
    "cache",
    MARKETPLACE_NAME,
  );

  // —— Read each plugin's version from manifest ——
  const plugins = [];

  for (const name of pluginDirs) {
    const manifestPath = join(
      repoPluginsDir,
      name,
      ".claude-plugin",
      "plugin.json",
    );
    let version = null;

    try {
      const raw = readFileSync(manifestPath, "utf8");
      const json = JSON.parse(raw);
      version = json.version || null;
    } catch {
      continue;
    }

    if (!version) continue;

    plugins.push({
      cachePath: join(zcodeCacheBase, name, version),
      name,
      source: "filesystem",
      version,
    });
  }

  // —— Write marketplace.json ——
  const marketDir = join(
    os.homedir(),
    ".zcode",
    "cli",
    "plugins",
    "marketplaces",
    MARKETPLACE_NAME,
  );
  const marketFile = join(marketDir, "marketplace.json");

  const marketplaceJson = {
    name: MARKETPLACE_NAME,
    plugins,
    version: 1,
  };

  try {
    mkdirSync(marketDir, { recursive: true });
    writeFileSync(
      marketFile,
      JSON.stringify(marketplaceJson, null, 2) + "\n",
      "utf8",
    );
  } catch (err) {
    fail(`Failed to register marketplace: ${err.message}`);
    process.exit(1);
  }

  // —— Copy plugins to cache ——
  let copied = 0;

  for (const plugin of plugins) {
    const cacheDir = plugin.cachePath;
    const sourceDir = join(repoPluginsDir, plugin.name);

    if (existsSync(cacheDir)) {
      rmSync(cacheDir, { recursive: true, force: true });
    }

    try {
      mkdirSync(cacheDir, { recursive: true });
      cpSync(sourceDir, cacheDir, { recursive: true, force: true });
      copied++;
    } catch (err) {
      fail(`Failed to copy plugin "${plugin.name}": ${err.message}`);
    }
  }

  // —— Summary ——
  success(`Marketplace "${MARKETPLACE_NAME}" registered`);
  success(`Plugins: ${plugins.length} registered, ${copied} copied to cache`);
  success(marketFile);

  console.log();
}
