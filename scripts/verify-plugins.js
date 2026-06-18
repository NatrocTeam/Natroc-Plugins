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
  blue: "96",
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

const ALLOWED_CATEGORIES_KEBAB = new Set([
  "ai",
  "analytics",
  "automation",
  "cloud",
  "communication",
  "content",
  "data",
  "design",
  "development",
  "devops",
  "documentation",
  "ecommerce",
  "finance",
  "identity",
  "infrastructure",
  "integration",
  "mobile",
  "monitoring",
  "productivity",
  "project-management",
  "security",
  "social",
  "testing",
  "web",
]);

function toTitleCase(kebab) {
  return kebab
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const ALLOWED_CATEGORIES_TITLE = new Set(
  [...ALLOWED_CATEGORIES_KEBAB].map(toTitleCase),
);

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
      "Fix the JSON syntax, then run `pnpm run verify-plugins` again.",
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

function getSkillBody(pluginName, filePath) {
  const text = readText(pluginName, filePath, "SKILL.md");
  if (text === null) {
    return null;
  }

  const normalized = text.replace(/^﻿/, "");
  const lines = normalized.split(/\r?\n/);

  if (lines[0] !== "---") {
    return null;
  }

  // Find second --- to locate end of frontmatter
  const endIndex = lines.slice(1).findIndex((line) => line.trim() === "---");
  if (endIndex === -1) {
    return null;
  }

  // Body starts after the second ---
  const bodyStart = endIndex + 2;
  const bodyLines = lines.slice(bodyStart);
  const body = bodyLines.join("\n");

  return { lines: bodyLines, text: body };
}

function estimateTokens(text) {
  // Rough estimate: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
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

    const rawDescription = parseFrontmatterValue(frontmatter, "description");

    if (rawDescription === null || rawDescription === "") {
      addIssue(
        pluginName,
        skillMdPath,
        "SKILL.md frontmatter is missing a required description field.",
        "Add a description to the YAML frontmatter.",
      );
    } else {
      // Check description length (max 1024 characters)
      if (rawDescription.length > 1024) {
        addIssue(
          pluginName,
          skillMdPath,
          `SKILL.md frontmatter description is ${rawDescription.length} characters (max 1024).`,
          "Shorten the description to 1024 characters or fewer.",
        );
      }

      // Check for colon in single-line description values
      if (
        rawDescription !== ">" &&
        rawDescription !== "|" &&
        rawDescription.includes(":")
      ) {
        addIssue(
          pluginName,
          skillMdPath,
          "SKILL.md frontmatter description must not contain a colon.",
          "Remove the colon from the description line, or wrap the value in quotes.",
        );
      }

      // Check folded multiline descriptions (lines after the > or | marker)
      if (rawDescription === ">" || rawDescription === "|") {
        const lines = frontmatter.split(/\r?\n/);
        const descIndex = lines.findIndex((l) => /^description:/.test(l));
        if (descIndex !== -1) {
          // Collect only the description block lines (indented, until next key or ---)
          const multilineLines = [];
          for (let i = descIndex + 1; i < lines.length; i++) {
            const line = lines[i];
            if (/^[A-Za-z0-9_-]+:\s*/.test(line) || line.trim() === "---") {
              break;
            }
            multilineLines.push(line);
          }
          const multilineContent = multilineLines.join("\n").trim();
          if (multilineContent.includes(":")) {
            addIssue(
              pluginName,
              skillMdPath,
              "SKILL.md frontmatter description must not contain a colon.",
              "Remove the colon from the multiline description, or wrap the value in quotes.",
            );
          }
          if (multilineContent.length > 1024) {
            addIssue(
              pluginName,
              skillMdPath,
              `SKILL.md frontmatter multiline description is ${multilineContent.length} characters (max 1024).`,
              "Shorten the multiline description to 1024 characters or fewer.",
            );
          }
        }
      }
    }
  }

  // Validate skill body (content after frontmatter)
  const body = getSkillBody(pluginName, skillMdPath);
  if (body !== null) {
    const lineCount = body.lines.length;
    if (lineCount > 500) {
      const excess = lineCount - 500;
      addIssue(
        pluginName,
        skillMdPath,
        `SKILL.md body is ${lineCount} lines (max 500 lines) - ${excess} lines over the limit.`,
        `Move the ${excess} excess lines to references/, examples/, or scripts/ under the skill folder. Keep only core workflow and guardrails in SKILL.md.`,
      );
    }

    const tokenCount = estimateTokens(body.text);
    if (tokenCount > 5000) {
      const excess = tokenCount - 5000;
      addIssue(
        pluginName,
        skillMdPath,
        `SKILL.md body is approximately ${tokenCount} tokens (max 5000 tokens) - ~${excess} tokens over the limit.`,
        `Move code examples to examples/, API references to references/, and utility logic to scripts/ under the skill folder. Target: trim ~${excess} tokens.`,
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

function validateAppJson(pluginName, pluginPath, codexManifest) {
  const appJsonPath = path.join(pluginPath, ".app.json");

  if (!exists(appJsonPath)) {
    return;
  }

  if (!fs.statSync(appJsonPath).isFile()) {
    addIssue(
      pluginName,
      appJsonPath,
      ".app.json must be a file.",
      "Replace .app.json with a regular JSON file.",
    );
    return;
  }

  // Validate .app.json is valid JSON
  readJson(pluginName, appJsonPath, ".app.json");

  // Must be referenced in .codex-plugin/plugin.json
  if (codexManifest === null) {
    addIssue(
      pluginName,
      appJsonPath,
      ".app.json exists but .codex-plugin/plugin.json is missing or invalid.",
      'Add an "apps" field to .codex-plugin/plugin.json pointing to ./.app.json.',
    );
    return;
  }

  if (typeof codexManifest.apps !== "string") {
    addIssue(
      pluginName,
      path.join(pluginPath, ".codex-plugin", "plugin.json"),
      '.app.json exists but codex manifest is missing the "apps" field.',
      'Add "apps": "./.app.json" to .codex-plugin/plugin.json.',
    );
    return;
  }

  if (!codexManifest.apps.startsWith("./")) {
    addIssue(
      pluginName,
      path.join(pluginPath, ".codex-plugin", "plugin.json"),
      `Codex manifest "apps" must start with "./" (got "${codexManifest.apps}").`,
      'Change the "apps" value to start with "./".',
    );
    return;
  }

  const expectedAppPath = path.join(pluginPath, codexManifest.apps.slice(2));
  if (!exists(expectedAppPath)) {
    addIssue(
      pluginName,
      path.join(pluginPath, ".codex-plugin", "plugin.json"),
      `Codex manifest "apps" points to "${codexManifest.apps}" but the file does not exist.`,
      'Fix the "apps" path to point to the correct .app.json file.',
    );
  }
}

function validatePlugin(
  pluginName,
  pluginPath,
  claudeMarketplace,
  codexMarketplace,
) {
  checkedPlugins += 1;

  validatePluginRootEntries(pluginName, pluginPath);
  validateReadme(pluginName, pluginPath);
  validateOptionalJsonFile(pluginName, pluginPath, ".app.json", ".app.json");
  validateOptionalJsonFile(pluginName, pluginPath, ".mcp.json", ".mcp.json");

  validateMarketplaceCoverage(pluginName, claudeMarketplace, codexMarketplace);

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

  // Cross-check manifest version against Claude marketplace version
  if (
    claudeManifest !== null &&
    typeof claudeManifest.version === "string" &&
    claudeMarketplace !== null &&
    Array.isArray(claudeMarketplace.plugins)
  ) {
    const marketplaceEntry = claudeMarketplace.plugins.find(
      (p) => p && p.name === pluginName,
    );

    if (
      marketplaceEntry &&
      typeof marketplaceEntry.version === "string" &&
      marketplaceEntry.version !== claudeManifest.version
    ) {
      addIssue(
        pluginName,
        path.join(pluginPath, ".claude-plugin", "plugin.json"),
        `Claude manifest version (${claudeManifest.version}) must match marketplace version (${marketplaceEntry.version}).`,
        `Set both versions to the same value in .claude-plugin/plugin.json and .claude-plugin/marketplace.json.`,
      );
    }
  }

  if (codexManifest !== null) {
    validateCodexManifestCategory(pluginName, pluginPath, codexManifest);
  }

  validateAppJson(pluginName, pluginPath, codexManifest);

  validateRootAgents(pluginName, pluginPath);
  validateCommands(pluginName, pluginPath);
  validateAssets(pluginName, pluginPath);
  validateHooks(pluginName, pluginPath);
  validateSkills(pluginName, pluginPath);
}

function printHeader() {
  console.log("");
  console.log(color(" natroc-plugins · verify", styles.bold, styles.cyan));
  console.log(
    color(
      " ─────────────────────────────────────────────────────",
      styles.blue,
    ),
  );
}

function pluralize(word, count) {
  return count === 1 ? word : `${word}s`;
}

function printSuccess() {
  console.log("");
  console.log(
    color(
      ` ${checkedPlugins} ${pluralize("plugin", checkedPlugins)}, ${checkedSkills} ${pluralize("skill", checkedSkills)}`,
      styles.bold,
    ),
  );
  console.log(color(" ✓ All checks passed", styles.bold, styles.green));
  console.log("");
}

function printIssues() {
  const grouped = new Map();

  for (const issue of issues) {
    if (!grouped.has(issue.pluginName)) {
      grouped.set(issue.pluginName, []);
    }

    grouped.get(issue.pluginName).push(issue);
  }

  const issueWord = pluralize("issue", issues.length);
  const pluginWord = pluralize("plugin", checkedPlugins);
  const skillWord = pluralize("skill", checkedSkills);

  console.log("");
  console.log(
    color(
      ` ${checkedPlugins} ${pluginWord}, ${checkedSkills} ${skillWord} - ${issues.length} ${issueWord} found`,
      styles.bold,
    ),
  );
  console.log(color(" ✗ Verification failed", styles.bold, styles.red));
  console.log("");

  for (const [pluginName, pluginIssues] of grouped) {
    const entryWord = pluralize("issue", pluginIssues.length);
    console.log(
      color(
        ` ▸ ${pluginName} (${pluginIssues.length} ${entryWord})`,
        styles.bold,
        styles.yellow,
      ),
    );

    pluginIssues.forEach((issue, index) => {
      const num = String(index + 1).padStart(2, " ");
      console.log(color(`   ${num}. ${issue.problem}`, styles.red));
      console.log(color(`       path  ${issue.path}`, styles.blue));
      console.log(color(`       fix   ${issue.fix}`, styles.blue));
    });

    console.log("");
  }

  console.log(color(" Actions", styles.bold, styles.cyan));
  console.log(color("   1. Fix each item listed above.", styles.blue));
  console.log(
    color(
      "   2. If intentional, document it in rules/verify.md first.",
      styles.blue,
    ),
  );
  console.log(color("   3. Run pnpm run verify-plugins again.", styles.blue));
  console.log("");
}

function validateCategory(pluginName, filePath, category, allowedSet, label) {
  if (category === undefined || category === null || category === "") {
    addIssue(
      pluginName,
      filePath,
      `${label} is missing a required category field.`,
      `Set "category" to one of the allowed values listed in rules/category.md.`,
    );
    return;
  }

  if (typeof category !== "string") {
    addIssue(
      pluginName,
      filePath,
      `${label} category must be a string.`,
      `Set "category" to one of the allowed values listed in rules/category.md.`,
    );
    return;
  }

  if (!allowedSet.has(category)) {
    const allowed = [...allowedSet]
      .sort()
      .map((c) => `"${c}"`)
      .join(", ");
    addIssue(
      pluginName,
      filePath,
      `${label} category "${category}" is not in the allowed list (rules/category.md).`,
      `Replace "${category}" with one of: ${allowed}.`,
    );
  }
}

function validateMarketplaceFiles() {
  const claudeMarketplacePath = path.join(
    rootDir,
    ".claude-plugin",
    "marketplace.json",
  );
  const codexMarketplacePath = path.join(
    rootDir,
    ".agents",
    "plugins",
    "marketplace.json",
  );

  let claudeMarketplace = null;
  let codexMarketplace = null;

  // Validate .claude-plugin/marketplace.json
  if (exists(claudeMarketplacePath)) {
    claudeMarketplace = readJson(
      "marketplace",
      claudeMarketplacePath,
      "Claude marketplace",
    );

    if (
      claudeMarketplace !== null &&
      Array.isArray(claudeMarketplace.plugins)
    ) {
      for (const plugin of claudeMarketplace.plugins) {
        if (!plugin || !plugin.name) {
          continue;
        }

        validateCategory(
          plugin.name,
          claudeMarketplacePath,
          plugin.category,
          ALLOWED_CATEGORIES_KEBAB,
          `Claude marketplace entry "${plugin.name}"`,
        );
      }
    } else if (
      claudeMarketplace !== null &&
      !Array.isArray(claudeMarketplace.plugins)
    ) {
      addIssue(
        "marketplace",
        claudeMarketplacePath,
        "Claude marketplace is missing a valid plugins array.",
        "Add a plugins array to .claude-plugin/marketplace.json.",
      );
    }
  } else {
    addIssue(
      "marketplace",
      claudeMarketplacePath,
      "Missing .claude-plugin/marketplace.json.",
      "Create the Claude Code marketplace file with a plugins array.",
    );
  }

  // Validate .agents/plugins/marketplace.json
  if (exists(codexMarketplacePath)) {
    codexMarketplace = readJson(
      "marketplace",
      codexMarketplacePath,
      "Codex marketplace",
    );

    if (codexMarketplace !== null && Array.isArray(codexMarketplace.plugins)) {
      for (const plugin of codexMarketplace.plugins) {
        if (!plugin || !plugin.name) {
          continue;
        }

        validateCategory(
          plugin.name,
          codexMarketplacePath,
          plugin.category,
          ALLOWED_CATEGORIES_TITLE,
          `Codex marketplace entry "${plugin.name}"`,
        );
      }
    } else if (
      codexMarketplace !== null &&
      !Array.isArray(codexMarketplace.plugins)
    ) {
      addIssue(
        "marketplace",
        codexMarketplacePath,
        "Codex marketplace is missing a valid plugins array.",
        "Add a plugins array to .agents/plugins/marketplace.json.",
      );
    }
  } else {
    addIssue(
      "marketplace",
      codexMarketplacePath,
      "Missing .agents/plugins/marketplace.json.",
      "Create the Codex marketplace file with a plugins array.",
    );
  }

  // Return both marketplaces for reverse lookup
  return { claude: claudeMarketplace, codex: codexMarketplace };
}

function validateMarketplaceCoverage(
  pluginName,
  claudeMarketplace,
  codexMarketplace,
) {
  const claudePath = ".claude-plugin/marketplace.json";
  const codexPath = ".agents/plugins/marketplace.json";

  if (claudeMarketplace !== null && Array.isArray(claudeMarketplace.plugins)) {
    const found = claudeMarketplace.plugins.some(
      (p) => p && p.name === pluginName,
    );
    if (!found) {
      addIssue(
        pluginName,
        claudePath,
        `Plugin "${pluginName}" is not listed in Claude marketplace.`,
        `Add an entry for "${pluginName}" to ${claudePath}.`,
      );
    }
  }

  if (codexMarketplace !== null && Array.isArray(codexMarketplace.plugins)) {
    const found = codexMarketplace.plugins.some(
      (p) => p && p.name === pluginName,
    );
    if (!found) {
      addIssue(
        pluginName,
        codexPath,
        `Plugin "${pluginName}" is not listed in Codex marketplace.`,
        `Add an entry for "${pluginName}" to ${codexPath}.`,
      );
    }
  }
}

function validateCodexManifestCategory(pluginName, pluginPath, manifest) {
  if (manifest === null || typeof manifest !== "object") {
    return;
  }

  if (!manifest.interface || typeof manifest.interface !== "object") {
    return;
  }

  const category = manifest.interface.category;
  const manifestPath = path.join(pluginPath, ".codex-plugin", "plugin.json");

  validateCategory(
    pluginName,
    manifestPath,
    category,
    ALLOWED_CATEGORIES_TITLE,
    `Codex manifest interface.category for "${pluginName}"`,
  );
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

  const marketplaces = validateMarketplaceFiles();

  for (const pluginEntry of pluginEntries) {
    validatePlugin(
      pluginEntry.name,
      path.join(pluginsDir, pluginEntry.name),
      marketplaces.claude,
      marketplaces.codex,
    );
  }

  if (issues.length === 0) {
    printSuccess();
    return;
  }

  printIssues();
  process.exitCode = 1;
}

main();
