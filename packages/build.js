import * as esbuild from "esbuild";
import { existsSync, readdirSync, statSync, cpSync, rmSync } from "fs";
import { resolve } from "path";

// ── Colors ──────────────────────────────────────────────────────────────────
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
};

function c(text, ...codes) {
  return `${codes.map((code) => colors[code] || code).join("")}${text}${colors.reset}`;
}

// ── Build ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n  ${c("natroc-plugins", "bold")} ${c("build", "dim")}\n`);

  // Check src entry
  const entryPath = resolve("src/index.js");
  if (!existsSync(entryPath)) {
    console.log(
      `  ${c("✘", "red")} ${c("Entry not found:", "red")} ${c(entryPath, "yellow")}`,
    );
    console.log(`  ${c("Build failed.", "dim")}\n`);
    process.exit(1);
  }

  const srcSize = statSync(entryPath).size;
  console.log(
    `  ${c("✓", "green")} ${c("Entry:", "bold")} src/index.js ${c(`(${(srcSize / 1024).toFixed(1)} KB)`, "dim")}`,
  );

  // Source files discovered
  console.log(`  ${c("⋯", "cyan")} ${c("Bundling...", "dim")}`);

  const start = Date.now();

  try {
    const result = await esbuild.build({
      entryPoints: ["src/index.js"],
      bundle: true,
      platform: "node",
      format: "esm",
      outfile: "dist/index.js",
      banner: {
        js: "#!/usr/bin/env node",
      },
      metafile: true,
    });

    const elapsed = Date.now() - start;
    const outPath = resolve("dist/index.js");
    const outSize = statSync(outPath).size;
    const kb = (outSize / 1024).toFixed(1);

    console.log(
      `  ${c("✓", "green")} ${c("Built:", "bold")} dist/index.js ${c(`(${kb} KB)`, "dim")}`,
    );
    console.log(
      `  ${c("✓", "green")} ${c("Duration:", "bold")} ${c(`${elapsed} ms`, "dim")}`,
    );

    // Warnings
    const warningCount = (result.warnings || []).length;
    if (warningCount > 0) {
      console.log(
        `  ${c("⚠", "yellow")} ${c(`${warningCount} warning(s):`, "yellow")}`,
      );
      for (const w of result.warnings) {
        console.log(`    ${c(w.text, "dim")}`);
      }
    }

    // Summary
    const moduleCount = result.metafile
      ? Object.keys(result.metafile.inputs).length
      : "?";
    console.log(
      `  ${c("✓", "green")} ${c("Modules:", "bold")} ${c(`${moduleCount} bundled`, "dim")}`,
    );

    // ── Copy plugins to package ─────────────────────────────────────────────
    const sourcePlugins = resolve("..", "plugins");
    const targetPlugins = resolve("plugins");

    if (!existsSync(sourcePlugins)) {
      console.log(
        `  ${c("✘", "red")} ${c("Source plugins/ directory not found:", "red")} ${c(sourcePlugins, "yellow")}`,
      );
      console.log(`  ${c("Build complete with warnings.", "dim")}\n`);
    } else {
      if (existsSync(targetPlugins)) {
        rmSync(targetPlugins, { recursive: true, force: true });
      }

      cpSync(sourcePlugins, targetPlugins, { recursive: true, force: true });

      let count = 0;
      if (existsSync(targetPlugins)) {
        try {
          count = readdirSync(targetPlugins, { withFileTypes: true }).filter(
            (d) => d.isDirectory(),
          ).length;
        } catch {}
      }

      console.log(
        `  ${c("✓", "green")} ${c("Plugins:", "bold")} ${c(`${count} plugin(s) copied`, "dim")}`,
      );
    }

    console.log(`\n  ${c("Build complete.", "green")}\n`);
  } catch (err) {
    console.log(
      `\n  ${c("✘", "red")} ${c("Build error:", "red")} ${c(err.message, "yellow")}`,
    );
    console.log(`\n  ${c("Build failed.", "dim")}\n`);
    process.exit(1);
  }
}

main();
