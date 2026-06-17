#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const rootDir = process.cwd();
const pluginsDir = path.join(rootDir, "plugins");

const useColor = process.env.NO_COLOR === undefined;
const color = (text, ...codes) =>
  useColor ? `\x1b[${codes.join(";")}m${text}\x1b[0m` : text;

const styles = {
  bold: "1",
  dim: "2",
  red: "31",
  green: "32",
  yellow: "33",
  cyan: "36",
};

const allowedPluginRootFiles = new Set([
  ".app.json",
  ".gitignore",
  ".mcp.json",
  "LICENSE",
  "README.md",
  "hooks.json",
]);

const allowedPluginRootDirs = new Set([
  ".claude-plugin",
  ".codex-plugin",
  "agents",
  "assets",
  "commands",
  "hooks",
  "skills",
]);

const imageExtensions = new Set([".jpeg", ".jpg", ".png", ".svg"]);
const yamlExtensions = new Set([".yaml", ".yml"]);
const codexSkillMetadataFile = "openai.yaml";

const issues = [];
let checkedPlugins = 0;
let checkedSkills = 0;

function rel(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

function addIssue(pluginName, filePath, problem, fix) {
  issues.push({
    pluginName,
    path: typeof filePath === "string" ? rel(filePath) : "-",
    problem,
    fix,
  });
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function readText(pluginName, filePath, label) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    addIssue(
      pluginName,
      filePath,
      `Could not read ${label}: ${error.message}`,
      "Check file permissions and make sure the file is readable.",
    );
    return null;
  }
}

function readJson(pluginName, filePath, label) {
  const text = readText(pluginName, filePath, label);
  if (text === null) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    addIssue(
      pluginName,
      filePath,
      `${label} must be valid JSON: ${error.message}`,
      "Fix the JSON syntax, then run `npm run verify-plugins` again.",
    );
    return null;
  }
}

function hasMarkdownFrontmatter(pluginName, filePath, label) {
  const text = readText(pluginName, filePath, label);
  if (text === null) {
    return false;
  }

  const normalized = text.replace(/^\uFEFF/, "");
  const lines = normalized.split(/\r?\n/);

  if (lines[0] !== "---") {
    return false;
  }

  return lines.slice(1).some((line) => line.trim() === "---");
}

function validateBasicYaml(pluginName, filePath, label) {
  const text = readText(pluginName, filePath, label);
  if (text === null) {
    return;
  }

  const meaningfulLines = text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "" && !line.trimStart().startsWith("#"));

  if (meaningfulLines.length === 0) {
    addIssue(
      pluginName,
      filePath,
      `${label} must not be empty.`,
      "Add valid YAML metadata content or remove the optional metadata file.",
    );
    return;
  }

  if (meaningfulLines.some((line) => /^\t+/.test(line))) {
    addIssue(
      pluginName,
      filePath,
      `${label} uses tab indentation, which is not valid YAML indentation.`,
      "Replace indentation tabs with spaces.",
    );
  }

  if (!meaningfulLines.some((line) => /^\s*[A-Za-z0-9_.-]+:\s*/.test(line))) {
    addIssue(
      pluginName,
      filePath,
      `${label} does not look like YAML metadata.`,
      "Use YAML key/value metadata, for example `interface:` followed by indented fields.",
    );
  }
}

function validateBasicToml(pluginName, filePath, label) {
  const text = readText(pluginName, filePath, label);
  if (text === null) {
    return;
  }

  const meaningfulLines = [];
  let multilineDelimiter = null;

  for (const line of text.split(/\r?\n/)) {
    if (multilineDelimiter !== null) {
      if (line.includes(multilineDelimiter)) {
        multilineDelimiter = null;
      }
      continue;
    }

    if (line.trim() === "" || line.trimStart().startsWith("#")) {
      continue;
    }

    meaningfulLines.push(line);

    const multilineMatch = line.match(/=\s*('''|""")/);
    if (multilineMatch) {
      const delimiter = multilineMatch[1];
      const afterDelimiter = line.slice(
        line.indexOf(delimiter) + delimiter.length,
      );

      if (!afterDelimiter.includes(delimiter)) {
        multilineDelimiter = delimiter;
      }
    }
  }

  if (meaningfulLines.length === 0) {
    addIssue(
      pluginName,
      filePath,
      `${label} must not be empty.`,
      "Add valid TOML agent metadata or remove the optional Codex agent file.",
    );
    return;
  }

  const sectionPattern = /^\s*\[\[?[A-Za-z0-9_.-]+\]?\]\s*(?:#.*)?$/;
  const assignmentPattern =
    /^\s*(?:"[^"]+"|'[^']+'|[A-Za-z0-9_-]+)(?:\.(?:"[^"]+"|'[^']+'|[A-Za-z0-9_-]+))*\s*=\s*.+$/;

  const invalidLine = meaningfulLines.find(
    (line) => !sectionPattern.test(line) && !assignmentPattern.test(line),
  );

  if (invalidLine !== undefined) {
    addIssue(
      pluginName,
      filePath,
      `${label} does not look like TOML.`,
      `Fix this line or remove it: ${invalidLine.trim()}`,
    );
  }

  const rootFields = new Set();

  for (const line of meaningfulLines) {
    const assignmentMatch = line.match(
      /^\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_-]+))\s*=/,
    );

    if (assignmentMatch) {
      rootFields.add(
        assignmentMatch[1] || assignmentMatch[2] || assignmentMatch[3],
      );
    }
  }

  for (const requiredField of [
    "name",
    "description",
    "developer_instructions",
  ]) {
    if (!rootFields.has(requiredField)) {
      addIssue(
        pluginName,
        filePath,
        `${label} is missing required field ${requiredField}.`,
        `Add ${requiredField} to this TOML file.`,
      );
    }
  }
}

function getFrontmatter(pluginName, filePath, label) {
  const text = readText(pluginName, filePath, label);
  if (text === null) {
    return null;
  }

  const normalized = text.replace(/^\uFEFF/, "");
  const lines = normalized.split(/\r?\n/);

  if (lines[0] !== "---") {
    return null;
  }

  const endIndex = lines.slice(1).findIndex((line) => line.trim() === "---");

  if (endIndex === -1) {
    return null;
  }

  return lines.slice(1, endIndex + 1).join("\n");
}

function parseFrontmatterValue(frontmatter, key) {
  for (const line of frontmatter.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);

    if (!match || match[1] !== key) {
      continue;
    }

    return match[2].trim().replace(/^['"]|['"]$/g, "");
  }

  return null;
}

function validateRequiredFile(pluginName, pluginPath, fileName, description) {
  const filePath = path.join(pluginPath, fileName);

  if (!exists(filePath)) {
    addIssue(
      pluginName,
      filePath,
      `Missing required ${description}.`,
      `Create ${rel(filePath)}. This file is required by rules/verify.md.`,
    );
    return false;
  }

  const stat = fs.statSync(filePath);

  if (!stat.isFile()) {
    addIssue(
      pluginName,
      filePath,
      `${description} must be a file.`,
      `Replace ${rel(filePath)} with a regular file.`,
    );
    return false;
  }

  return true;
}

function validateRequiredDir(pluginName, pluginPath, dirName, description) {
  const dirPath = path.join(pluginPath, dirName);

  if (!exists(dirPath)) {
    addIssue(
      pluginName,
      dirPath,
      `Missing required ${description}.`,
      `Create ${rel(dirPath)}. This directory is required by rules/verify.md.`,
    );
    return false;
  }

  const stat = fs.statSync(dirPath);

  if (!stat.isDirectory()) {
    addIssue(
      pluginName,
      dirPath,
      `${description} must be a directory.`,
      `Replace ${rel(dirPath)} with a directory.`,
    );
    return false;
  }

  return true;
}

function validatePluginRootEntries(pluginName, pluginPath) {
  for (const entry of fs.readdirSync(pluginPath, { withFileTypes: true })) {
    const entryPath = path.join(pluginPath, entry.name);

    if (entry.isDirectory()) {
      if (!allowedPluginRootDirs.has(entry.name)) {
        addIssue(
          pluginName,
          entryPath,
          "Unsupported folder in plugin root.",
          "Move it under an appropriate skill folder, or document the new root folder in rules/verify.md before updating the verifier.",
        );
      }

      continue;
    }

    if (entry.isFile()) {
      if (!allowedPluginRootFiles.has(entry.name)) {
        addIssue(
          pluginName,
          entryPath,
          "Unsupported file in plugin root.",
          "Use only files listed in rules/verify.md for plugin roots, or document this file type before allowing it.",
        );
      }

      continue;
    }

    addIssue(
      pluginName,
      entryPath,
      "Unsupported filesystem entry in plugin root.",
      "Replace it with a regular file or directory that is listed in rules/verify.md.",
    );
  }
}

function validateManifestDir(pluginName, pluginPath, dirName, label) {
  if (
    !validateRequiredDir(
      pluginName,
      pluginPath,
      dirName,
      `${label} manifest folder`,
    )
  ) {
    return null;
  }

  const manifestDir = path.join(pluginPath, dirName);
  const manifestPath = path.join(manifestDir, "plugin.json");

  validateRequiredFile(
    pluginName,
    manifestDir,
    "plugin.json",
    `${label} manifest`,
  );

  for (const entry of fs.readdirSync(manifestDir, { withFileTypes: true })) {
    const entryPath = path.join(manifestDir, entry.name);

    if (!entry.isFile() || entry.name !== "plugin.json") {
      addIssue(
        pluginName,
        entryPath,
        `${label} manifest folder may only contain plugin.json.`,
        `Move or remove ${rel(entryPath)} so ${rel(manifestDir)} contains only plugin.json.`,
      );
    }
  }

  if (!exists(manifestPath) || !fs.statSync(manifestPath).isFile()) {
    return null;
  }

  const manifest = readJson(pluginName, manifestPath, `${label} manifest`);

  if (manifest === null) {
    return null;
  }

  if (manifest.name !== pluginName) {
    addIssue(
      pluginName,
      manifestPath,
      `${label} manifest name must match the plugin folder name.`,
      `Set "name" to "${pluginName}" in ${rel(manifestPath)}.`,
    );
  }

  if (typeof manifest.version !== "string" || manifest.version.trim() === "") {
    addIssue(
      pluginName,
      manifestPath,
      `${label} manifest must include a non-empty string version.`,
      `Set "version" in ${rel(manifestPath)} to the plugin version.`,
    );
  }

  return manifest;
}

function validateReadme(pluginName, pluginPath) {
  const readmePath = path.join(pluginPath, "README.md");

  if (!validateRequiredFile(pluginName, pluginPath, "README.md", "README.md")) {
    return;
  }

  const text = readText(pluginName, readmePath, "README.md");

  if (text !== null && text.trim().length === 0) {
    addIssue(
      pluginName,
      readmePath,
      "README.md must be human readable and cannot be empty.",
      "Add a concise plugin overview and usage instructions.",
    );
  }
}

function validateOptionalJsonFile(pluginName, pluginPath, fileName, label) {
  const filePath = path.join(pluginPath, fileName);

  if (exists(filePath)) {
    if (!fs.statSync(filePath).isFile()) {
      addIssue(
        pluginName,
        filePath,
        `${label} must be a file.`,
        `Replace ${rel(filePath)} with a regular JSON file.`,
      );
      return;
    }

    readJson(pluginName, filePath, label);
  }
}

function validateRootAgents(pluginName, pluginPath) {
  const agentsDir = path.join(pluginPath, "agents");

  if (!exists(agentsDir)) {
    return;
  }

  for (const entry of fs.readdirSync(agentsDir, { withFileTypes: true })) {
    const entryPath = path.join(agentsDir, entry.name);

    if (!entry.isFile()) {
      addIssue(
        pluginName,
        entryPath,
        "Root agents folder may only contain Markdown or TOML agent files.",
        "Move nested content into a skill folder or replace it with a .md or .toml agent file.",
      );
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (extension !== ".md" && extension !== ".toml") {
      addIssue(
        pluginName,
        entryPath,
        "Root agent files must use the .md extension for Claude or .toml extension for Codex.",
        "Rename or replace this file with a Markdown agent with frontmatter or a TOML Codex agent.",
      );
      continue;
    }

    if (extension === ".md") {
      if (!hasMarkdownFrontmatter(pluginName, entryPath, "Claude root agent")) {
        addIssue(
          pluginName,
          entryPath,
          "Claude root agent Markdown files must include YAML frontmatter.",
          "Add a frontmatter block at the top of the file, for example `---`, `name: agent-name`, and closing `---`.",
        );
      }

      continue;
    }

    validateBasicToml(pluginName, entryPath, "Codex root agent");
  }
}

function validateCommands(pluginName, pluginPath) {
  const commandsDir = path.join(pluginPath, "commands");

  if (!exists(commandsDir)) {
    return;
  }

  for (const entry of fs.readdirSync(commandsDir, { withFileTypes: true })) {
    const entryPath = path.join(commandsDir, entry.name);

    if (!entry.isFile()) {
      addIssue(
        pluginName,
        entryPath,
        "Commands folder may only contain Markdown command files.",
        "Move nested content elsewhere or replace it with a .md command file.",
      );
      continue;
    }

    if (path.extname(entry.name).toLowerCase() !== ".md") {
      addIssue(
        pluginName,
        entryPath,
        "Command files must use the .md extension.",
        "Rename or replace this file with a Markdown command file.",
      );
    }
  }
}

function validateImageFormat(pluginName, filePath, extension) {
  const buffer = fs.readFileSync(filePath);

  if (extension === ".png") {
    const pngSignature = "89504e470d0a1a0a";

    if (buffer.subarray(0, 8).toString("hex") !== pngSignature) {
      addIssue(
        pluginName,
        filePath,
        "PNG asset extension does not match the file format.",
        "Replace the file with a real PNG or rename it to the correct supported image extension.",
      );
    }

    return;
  }

  if (extension === ".jpg" || extension === ".jpeg") {
    if (buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) {
      addIssue(
        pluginName,
        filePath,
        "JPEG asset extension does not match the file format.",
        "Replace the file with a real JPEG or rename it to the correct supported image extension.",
      );
    }

    return;
  }

  if (extension === ".svg") {
    const text = buffer.toString("utf8").trimStart();

    if (!text.includes("<svg")) {
      addIssue(
        pluginName,
        filePath,
        "SVG asset extension does not match the file format.",
        "Replace the file with a real SVG that contains an <svg> element.",
      );
    }
  }
}

function validateAssets(pluginName, pluginPath) {
  const assetsDir = path.join(pluginPath, "assets");

  if (!exists(assetsDir)) {
    return;
  }

  function walkAssets(currentDir, allowDirs) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!allowDirs.has(entry.name)) {
          addIssue(
            pluginName,
            entryPath,
            "Unsupported folder inside root assets.",
            "Root assets may contain image files and an optional screenshots folder only.",
          );
          continue;
        }

        walkAssets(entryPath, new Set());
        continue;
      }

      if (!entry.isFile()) {
        addIssue(
          pluginName,
          entryPath,
          "Unsupported filesystem entry inside root assets.",
          "Use only image files with jpeg, jpg, png, or svg formats.",
        );
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();

      if (!imageExtensions.has(extension)) {
        addIssue(
          pluginName,
          entryPath,
          "Root asset files must use jpeg, jpg, png, or svg extensions.",
          "Convert this asset to jpeg, jpg, png, or svg, or move non-image examples into a skill folder.",
        );
        continue;
      }

      validateImageFormat(pluginName, entryPath, extension);
    }
  }

  walkAssets(assetsDir, new Set(["screenshots"]));
}

function validateHooks(pluginName, pluginPath) {
  const rootHooksPath = path.join(pluginPath, "hooks.json");
  const hooksDir = path.join(pluginPath, "hooks");
  const nestedHooksPath = path.join(hooksDir, "hooks.json");

  if (exists(rootHooksPath) && exists(nestedHooksPath)) {
    addIssue(
      pluginName,
      rootHooksPath,
      "hooks.json exists in both plugin root and hooks folder.",
      "Keep hooks.json in exactly one place: plugin root or hooks/hooks.json.",
    );
  }

  validateOptionalJsonFile(
    pluginName,
    pluginPath,
    "hooks.json",
    "root hooks.json",
  );

  if (!exists(hooksDir)) {
    return;
  }

  for (const entry of fs.readdirSync(hooksDir, { withFileTypes: true })) {
    const entryPath = path.join(hooksDir, entry.name);

    if (!entry.isFile()) {
      addIssue(
        pluginName,
        entryPath,
        "Hooks folder may only contain hooks.json and hook command files.",
        "Remove generated folders and keep hook commands as regular files.",
      );
      continue;
    }

    if (entry.name === "hooks.json" || entry.name === "hooks-codex.json") {
      readJson(pluginName, entryPath, `hooks/${entry.name}`);
      continue;
    }

    const hookExt = path.extname(entry.name).toLowerCase();
    const allowedHookExts = new Set([".py", ".cmd", ""]);
    if (!allowedHookExts.has(hookExt)) {
      addIssue(
        pluginName,
        entryPath,
        "Hook command files must use .py, .cmd, or no extension (bash script).",
        "Rename or replace this hook command with a supported format, or document another supported hook format in rules/verify.md.",
      );
    }
  }
}

function validateSkillAgents(pluginName, skillPath) {
  const agentsDir = path.join(skillPath, "agents");

  if (!exists(agentsDir)) {
    return;
  }

  const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile());

  for (const entry of entries) {
    const entryPath = path.join(agentsDir, entry.name);

    if (!entry.isFile()) {
      addIssue(
        pluginName,
        entryPath,
        "Skill agents folder may only contain one YAML metadata file.",
        `Remove nested content and keep a single ${codexSkillMetadataFile} Codex skill metadata file.`,
      );
    }
  }

  if (files.length !== 1) {
    addIssue(
      pluginName,
      agentsDir,
      "Skill agents folder must contain exactly one YAML metadata file.",
      `Keep one file named ${codexSkillMetadataFile} in this folder.`,
    );
  }

  for (const file of files) {
    const filePath = path.join(agentsDir, file.name);
    const extension = path.extname(file.name).toLowerCase();

    if (!yamlExtensions.has(extension)) {
      addIssue(
        pluginName,
        filePath,
        "Codex skill metadata files must use a YAML extension.",
        `Rename or replace this file with ${codexSkillMetadataFile}.`,
      );
      continue;
    }

    if (file.name !== codexSkillMetadataFile) {
      addIssue(
        pluginName,
        filePath,
        `Codex skill metadata file must be named ${codexSkillMetadataFile}.`,
        `Rename this file to ${codexSkillMetadataFile}.`,
      );
    }

    validateBasicYaml(pluginName, filePath, "Codex skill metadata");
  }
}

function validateSkill(pluginName, skillPath, skillName) {
  checkedSkills += 1;

  const skillMdPath = path.join(skillPath, "SKILL.md");

  if (!validateRequiredFile(pluginName, skillPath, "SKILL.md", "SKILL.md")) {
    return;
  }

  const frontmatter = getFrontmatter(pluginName, skillMdPath, "SKILL.md");

  if (frontmatter === null) {
    addIssue(
      pluginName,
      skillMdPath,
      "SKILL.md must start with YAML frontmatter.",
      "Add a frontmatter block with at least `name` and `description`.",
    );
  } else {
    const frontmatterName = parseFrontmatterValue(frontmatter, "name");

    if (frontmatterName !== skillName) {
      addIssue(
        pluginName,
        skillMdPath,
        "SKILL.md frontmatter name must match the skill folder name.",
        `Set the frontmatter name to "${skillName}" or rename the folder to match.`,
      );
    }
  }

  validateSkillAgents(pluginName, skillPath);
}

function validateSkills(pluginName, pluginPath) {
  if (!validateRequiredDir(pluginName, pluginPath, "skills", "skills folder")) {
    return;
  }

  const skillsDir = path.join(pluginPath, "skills");
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

  const nonSkillDirNames = new Set(["assets"]);

  const skillDirs = entries.filter(
    (entry) => entry.isDirectory() && !nonSkillDirNames.has(entry.name),
  );

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      addIssue(
        pluginName,
        path.join(skillsDir, entry.name),
        "Skills folder may only contain skill folders.",
        "Move this file into a skill folder or remove it.",
      );
    }
  }

  if (skillDirs.length === 0) {
    addIssue(
      pluginName,
      skillsDir,
      "Plugin must include at least one skill folder.",
      "Create skills/<skill-name>/SKILL.md with matching frontmatter name.",
    );
  }

  for (const skillDir of skillDirs) {
    validateSkill(
      pluginName,
      path.join(skillsDir, skillDir.name),
      skillDir.name,
    );
  }
}

function validatePlugin(pluginName, pluginPath) {
  checkedPlugins += 1;

  validatePluginRootEntries(pluginName, pluginPath);
  validateReadme(pluginName, pluginPath);
  validateOptionalJsonFile(pluginName, pluginPath, ".app.json", ".app.json");
  validateOptionalJsonFile(pluginName, pluginPath, ".mcp.json", ".mcp.json");

  const claudeManifest = validateManifestDir(
    pluginName,
    pluginPath,
    ".claude-plugin",
    "Claude",
  );
  const codexManifest = validateManifestDir(
    pluginName,
    pluginPath,
    ".codex-plugin",
    "Codex",
  );

  if (
    claudeManifest !== null &&
    codexManifest !== null &&
    typeof claudeManifest.version === "string" &&
    typeof codexManifest.version === "string" &&
    claudeManifest.version !== codexManifest.version
  ) {
    addIssue(
      pluginName,
      path.join(pluginPath, ".codex-plugin", "plugin.json"),
      "Claude and Codex plugin manifest versions must match.",
      `Set both manifest versions to the same value. Current values: Claude ${claudeManifest.version}, Codex ${codexManifest.version}.`,
    );
  }

  validateRootAgents(pluginName, pluginPath);
  validateCommands(pluginName, pluginPath);
  validateAssets(pluginName, pluginPath);
  validateHooks(pluginName, pluginPath);
  validateSkills(pluginName, pluginPath);
}

function printHeader() {
  console.log(color("verify-plugins", styles.bold, styles.cyan));
  console.log(
    color(
      "Checking plugin structure, required files, manifest versions, and documented file formats.",
      styles.dim,
    ),
  );
  console.log("");
}

function printSuccess() {
  console.log(color("PASS", styles.bold, styles.green));
  console.log(
    `Checked ${checkedPlugins} plugin(s) and ${checkedSkills} skill(s). No verify.md violations found.`,
  );
}

function printIssues() {
  const grouped = new Map();

  for (const issue of issues) {
    if (!grouped.has(issue.pluginName)) {
      grouped.set(issue.pluginName, []);
    }

    grouped.get(issue.pluginName).push(issue);
  }

  console.log(color("FAIL", styles.bold, styles.red));
  console.log(
    `Checked ${checkedPlugins} plugin(s) and ${checkedSkills} skill(s). Found ${issues.length} issue(s).`,
  );
  console.log("");

  for (const [pluginName, pluginIssues] of grouped) {
    console.log(color(`Plugin: ${pluginName}`, styles.bold, styles.yellow));

    pluginIssues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${color(issue.problem, styles.red)}`);
      console.log(`     Path: ${issue.path}`);
      console.log(`     Do:   ${issue.fix}`);
    });

    console.log("");
  }

  console.log(color("What to do next", styles.bold, styles.cyan));
  console.log("  1. Fix each item listed above.");
  console.log(
    "  2. If a new folder or file format is intentional, document it in rules/verify.md first.",
  );
  console.log("  3. Run `npm run verify-plugins` again.");
}

function main() {
  printHeader();

  if (!exists(pluginsDir)) {
    console.log(color("FAIL", styles.bold, styles.red));
    console.log("Missing plugins directory.");
    console.log(
      "Do: Create plugins/<plugin-name>/ folders before running this verifier.",
    );
    process.exitCode = 1;
    return;
  }

  const pluginEntries = fs
    .readdirSync(pluginsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  if (pluginEntries.length === 0) {
    console.log(color("FAIL", styles.bold, styles.red));
    console.log("No plugin folders found in plugins/.");
    console.log("Do: Create at least one plugins/<plugin-name>/ folder.");
    process.exitCode = 1;
    return;
  }

  for (const pluginEntry of pluginEntries) {
    validatePlugin(pluginEntry.name, path.join(pluginsDir, pluginEntry.name));
  }

  if (issues.length === 0) {
    printSuccess();
    return;
  }

  printIssues();
  process.exitCode = 1;
}

main();
