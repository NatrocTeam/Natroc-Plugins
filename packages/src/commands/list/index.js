import { readdirSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { c } from "../../utils/logger.js";
import { pluginsDir } from "../../utils/resolve-plugins.js";

export function list() {
  let pluginsDirPath;
  try {
    pluginsDirPath = pluginsDir();
  } catch {
    console.log(`\n  ${c("Plugins directory not found from bundle.", "dim")}`);
    return;
  }

  const dirs = readdirSync(pluginsDirPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  if (dirs.length === 0) {
    console.log(`\n  ${c("No plugins found.", "dim")}\n`);
    return;
  }

  const rows = [];
  let nameW = 4;

  for (const name of dirs) {
    const manifestPath = resolve(
      pluginsDirPath,
      name,
      ".claude-plugin",
      "plugin.json",
    );
    let version = "-";
    let ok = false;

    try {
      const raw = readFileSync(manifestPath, "utf8");
      const json = JSON.parse(raw);
      if (json.version) version = json.version;
      ok = true;
    } catch {}

    if (name.length > nameW) nameW = name.length;
    rows.push({ name, version, ok });
  }

  console.log(c(`\n  Plugins (${rows.length})\n`, "bold"));
  for (const row of rows) {
    const name = row.ok ? c(row.name, "white") : c(row.name, "dim");
    const ver = c(row.version, "dim");
    console.log(`  ${name.padEnd(nameW + 24)}${ver}`);
  }
  console.log();
}
