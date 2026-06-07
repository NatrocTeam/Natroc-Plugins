const fs = require("node:fs");
const path = require("node:path");

const packagePath = path.resolve(process.cwd(), "package.json");

if (!fs.existsSync(packagePath)) {
  console.error("File not found: package.json");
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

if (
  typeof packageJson.version !== "string" ||
  packageJson.version.length === 0
) {
  console.error("Missing package.json version.");
  process.exit(1);
}

const { version } = packageJson;

const files = [".claude-plugin/marketplace.json"];

for (const file of files) {
  const filePath = path.resolve(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf8");
  const json = JSON.parse(content);

  json.version = version;

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n");

  console.log(`Updated ${file} to version ${version}`);
}
