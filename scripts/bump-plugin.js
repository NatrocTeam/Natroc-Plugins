#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline/promises");

const rootDir = process.cwd();
const pluginsDir = path.join(rootDir, "plugins");
const marketplacePath = path.join(
  rootDir,
  ".claude-plugin",
  "marketplace.json",
);
const bumpTypes = ["patch", "minor", "major"];

function rel(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

function fail(message, nextSteps = []) {
  console.error(`Error: ${message}`);

  if (nextSteps.length > 0) {
    console.error("\nWhat to do:");
    nextSteps.forEach((step, index) => {
      console.error(`  ${index + 1}. ${step}`);
    });
  }

  process.exit(1);
}

function printHelp() {
  console.log(`Usage:
  node scripts/bump-plugin.js
  node scripts/bump-plugin.js --patch
  node scripts/bump-plugin.js --minor
  node scripts/bump-plugin.js --major

The script updates:
  - .claude-plugin/marketplace.json plugins[].version
  - plugins/<plugin-name>/.claude-plugin/plugin.json version
  - plugins/<plugin-name>/.codex-plugin/plugin.json version`);
}

function parseArgs(argv) {
  const flags = argv.slice(2);

  if (flags.includes("--help") || flags.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const bumpFlags = flags
    .filter((flag) => flag.startsWith("--"))
    .map((flag) => flag.slice(2));
  const requestedBumps = bumpFlags.filter((flag) => bumpTypes.includes(flag));
  const unknownFlags = bumpFlags.filter((flag) => !bumpTypes.includes(flag));

  if (unknownFlags.length > 0) {
    fail(`Unknown option: --${unknownFlags[0]}`, [
      "Use --patch, --minor, --major, or run without flags for interactive mode.",
      "Run `node scripts/bump-plugin.js --help` to see usage.",
    ]);
  }

  if (requestedBumps.length > 1) {
    fail("Choose only one bump type.", [
      "Run one command such as `node scripts/bump-plugin.js --patch`.",
    ]);
  }

  return requestedBumps[0] || null;
}

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing ${label}: ${rel(filePath)}`, [
      "Create the missing file or choose a plugin with complete metadata.",
      "Run `pnpm run verify-plugins` to find structure issues.",
    ]);
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${label} must be valid JSON: ${error.message}`, [
      `Fix ${rel(filePath)} and run this script again.`,
    ]);
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function getPluginNames() {
  if (!fs.existsSync(pluginsDir) || !fs.statSync(pluginsDir).isDirectory()) {
    fail("Missing plugins directory.", [
      "Run this script from the repository root.",
      "Make sure plugins/<plugin-name>/ folders exist.",
    ]);
  }

  const pluginNames = fs
    .readdirSync(pluginsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (pluginNames.length === 0) {
    fail("No plugin folders found in plugins/.", [
      "Create at least one plugins/<plugin-name>/ folder before bumping versions.",
    ]);
  }

  return pluginNames;
}

async function promptChoice(rl, title, choices) {
  console.log(`\n${title}`);

  choices.forEach((choice, index) => {
    console.log(`  ${index + 1}. ${choice}`);
  });

  while (true) {
    const answer = (await rl.question("> ")).trim();
    const selectedIndex = Number.parseInt(answer, 10);

    if (
      Number.isInteger(selectedIndex) &&
      selectedIndex >= 1 &&
      selectedIndex <= choices.length
    ) {
      return choices[selectedIndex - 1];
    }

    const exactMatch = choices.find((choice) => choice === answer);
    if (exactMatch) {
      return exactMatch;
    }

    console.log(
      `Choose a number from 1-${choices.length} or type an exact option name.`,
    );
  }
}

function createPrompt() {
  if (process.stdin.isTTY) {
    return readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  const answers = fs
    .readFileSync(0, "utf8")
    .split(/\r?\n/)
    .filter((answer, index, allAnswers) => {
      return index !== allAnswers.length - 1 || answer !== "";
    });
  let index = 0;

  return {
    async question(prompt) {
      process.stdout.write(prompt);

      if (index >= answers.length) {
        fail("No input available for interactive prompt.", [
          "Run the script in a terminal, or pipe one answer per prompt.",
          "Example: `printf '1\\n1\\n' | node scripts/bump-plugin.js`",
        ]);
      }

      const answer = answers[index];
      index += 1;
      process.stdout.write(`${answer}\n`);
      return answer;
    },
    close() {},
  };
}

function parseVersion(version, label) {
  if (typeof version !== "string") {
    fail(`${label} version must be a string.`, [
      "Set the version to semantic format x.y.z, for example 1.0.0.",
    ]);
  }

  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    fail(`${label} version is not supported: ${version}`, [
      "Use semantic version format x.y.z without prerelease or build metadata.",
      "Fix the current version manually, then run this script again.",
    ]);
  }

  return match.slice(1).map((part) => Number.parseInt(part, 10));
}

function bumpVersion(version, bumpType) {
  const [major, minor, patch] = parseVersion(version, "Plugin");

  if (bumpType === "major") {
    return `${major + 1}.0.0`;
  }

  if (bumpType === "minor") {
    return `${major}.${minor + 1}.0`;
  }

  return `${major}.${minor}.${patch + 1}`;
}

function loadTarget(pluginName) {
  const pluginPath = path.join(pluginsDir, pluginName);

  if (!fs.existsSync(pluginPath) || !fs.statSync(pluginPath).isDirectory()) {
    fail(`Plugin folder not found: plugins/${pluginName}`, [
      "Choose one of the plugin folders listed by the script.",
    ]);
  }

  const claudeManifestPath = path.join(
    pluginPath,
    ".claude-plugin",
    "plugin.json",
  );
  const codexManifestPath = path.join(
    pluginPath,
    ".codex-plugin",
    "plugin.json",
  );

  const marketplace = readJson(marketplacePath, "Claude marketplace");
  const claudeManifest = readJson(claudeManifestPath, "Claude plugin manifest");
  const codexManifest = readJson(codexManifestPath, "Codex plugin manifest");

  if (!Array.isArray(marketplace.plugins)) {
    fail("Claude marketplace must include a plugins array.", [
      "Fix .claude-plugin/marketplace.json so it has a plugins array.",
    ]);
  }

  const marketplacePlugin = marketplace.plugins.find(
    (plugin) => plugin && plugin.name === pluginName,
  );

  if (!marketplacePlugin) {
    fail(
      `Plugin "${pluginName}" is not listed in .claude-plugin/marketplace.json.`,
      [
        `Add an entry to .claude-plugin/marketplace.json plugins[] with "name": "${pluginName}".`,
        `Set its source to "./plugins/${pluginName}" if this is a local marketplace plugin.`,
        "Run `pnpm run verify-plugins`, then run this script again.",
      ],
    );
  }

  for (const [label, manifest] of [
    ["Claude plugin manifest", claudeManifest],
    ["Codex plugin manifest", codexManifest],
  ]) {
    if (manifest.name !== pluginName) {
      fail(`${label} name does not match the selected plugin.`, [
        `Set "name" to "${pluginName}" or choose the matching plugin folder.`,
      ]);
    }
  }

  parseVersion(claudeManifest.version, "Claude plugin manifest");
  parseVersion(codexManifest.version, "Codex plugin manifest");

  if (claudeManifest.version !== codexManifest.version) {
    fail("Claude and Codex plugin manifest versions do not match.", [
      `Current Claude version: ${claudeManifest.version}`,
      `Current Codex version: ${codexManifest.version}`,
      "Make the manifest versions match before bumping.",
    ]);
  }

  return {
    marketplace,
    marketplacePlugin,
    claudeManifest,
    codexManifest,
    claudeManifestPath,
    codexManifestPath,
  };
}

async function main() {
  const requestedBump = parseArgs(process.argv);
  const pluginNames = getPluginNames();
  const rl = createPrompt();

  try {
    const bumpType =
      requestedBump ||
      (await promptChoice(rl, "Choose version bump type:", bumpTypes));
    const pluginName = await promptChoice(rl, "Choose plugin:", pluginNames);
    const target = loadTarget(pluginName);
    const currentVersion = target.claudeManifest.version;
    const nextVersion = bumpVersion(currentVersion, bumpType);

    target.marketplacePlugin.version = nextVersion;
    target.claudeManifest.version = nextVersion;
    target.codexManifest.version = nextVersion;

    writeJson(marketplacePath, target.marketplace);
    writeJson(target.claudeManifestPath, target.claudeManifest);
    writeJson(target.codexManifestPath, target.codexManifest);

    console.log("");
    console.log(`Updated ${pluginName}: ${currentVersion} -> ${nextVersion}`);
    console.log(`  ${rel(marketplacePath)} plugins[].version`);
    console.log(`  ${rel(target.claudeManifestPath)} version`);
    console.log(`  ${rel(target.codexManifestPath)} version`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  fail(error.message || String(error));
});
