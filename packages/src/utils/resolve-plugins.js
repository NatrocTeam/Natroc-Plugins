import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

/**
 * Resolve plugins/ directory relative to the bundle location.
 *
 * From dist/index.js:
 *   dist/../plugins/ = repo-root/plugins/
 *
 * From npx/pnpm dlx/yarn dlx/bunx:
 *   node_modules/@natroc/plugins/dist/../plugins/ = bundled plugins/
 */
function resolveFromScript() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  return resolve(scriptDir, "..", "plugins");
}

/**
 * Resolve the plugins/ directory.
 * Only uses one strategy: relative to the script location.
 * This always works because plugins/ is bundled in the npm package.
 */
export function resolvePluginsDir() {
  const dir = resolveFromScript();
  if (existsSync(dir)) return dir;
  return null;
}

/**
 * Same as resolvePluginsDir but throws on failure.
 */
export function pluginsDir() {
  const dir = resolvePluginsDir();
  if (dir) return dir;

  throw new Error(
    `Could not find the "plugins/" directory.

Make sure @natroc/plugins is installed correctly:

  npx @natroc/plugins list`,
  );
}
