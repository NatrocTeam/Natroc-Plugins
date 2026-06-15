---
name: stitch-mcp
description: Use Stitch-MCP to connect AI agents to Google Stitch design platform - MCP tools for projects, screens, design systems, design file uploads/downloads, and asset management via @natroc/stitch-mcp bridge.
---

# Stitch-MCP - Google Stitch MCP Bridge

**Stitch-MCP** (`@natroc/stitch-mcp`) is an STDIO MCP bridge that connects AI coding agents to the **Google Stitch** design platform. It runs as a local MCP server (auto-started by this plugin's `.mcp.json`) and forwards all requests to Google Stitch via HTTPS.

**Data flow:**

```
[AI Agent] ← STDIO → [@natroc/stitch-mcp] ← HTTPS → [Google Stitch MCP API]
```

---

## Setup

### 1. Environment Variable

Set your Stitch API key before starting the agent:

```bash
export STITCH_API_KEY="your_stitch_api_key_here"
```

Alternatively, use an OAuth2 access token:

```bash
export STITCH_ACCESS_TOKEN="your_token"
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

### 2. Verify MCP Server

Once the plugin is installed and the agent restarted, verify the MCP server is running:

```
/mcp
```

You should see `stitch` listed with status connected.

### 3. Test Connectivity

Try listing your projects:

```
mcp__plugin_stitch_stitch__stitch_list_projects
```

If the server responds with a project list or an empty array, everything works.

---

## Environment Variables Reference

| Variable                        | Required        | Default                             | Description                                  |
| ------------------------------- | --------------- | ----------------------------------- | -------------------------------------------- |
| `STITCH_API_KEY`                | \* (one of two) | -                                   | API key for Stitch authentication            |
| `STITCH_ACCESS_TOKEN`           | \* (one of two) | -                                   | OAuth2 Bearer token alternative              |
| `GOOGLE_CLOUD_PROJECT`          | with OAuth      | -                                   | Quota project ID                             |
| `STITCH_MCP_URL`                | optional        | `https://stitch.googleapis.com/mcp` | Target Stitch MCP server URL                 |
| `STITCH_ALLOW_INSECURE_MCP_URL` | optional        | `false`                             | Allow non-HTTPS URLs (dev only)              |
| `STITCH_ALLOWED_UPLOAD_DIR`     | optional        | -                                   | Restricted directory for upload_design_files |
| `STITCH_UPLOAD_MAX_BYTES`       | optional        | `10485760` (10 MB)                  | Max upload file size                         |
| `STITCH_PROXY_NAME`             | optional        | `stitch-mcp`                        | Server name reported to Stitch               |
| `STITCH_PROXY_VERSION`          | optional        | (package version)                   | Server version reported to Stitch            |

---

## Available Tools

The plugin exposes **19 tools total** - 14 native Stitch MCP tools and 5 virtual SDK tools.

> **MCP tool naming:** When calling these tools directly, use the format `mcp__plugin_stitch_stitch__stitch_<tool-name>`. The skill description above should trigger automatic routing for most tasks.

### 14 Stitch MCP Native Tools

#### Project Management

| Tool                    | Description                  | Key Parameters                                    |
| ----------------------- | ---------------------------- | ------------------------------------------------- |
| `stitch_create_project` | Create a new Stitch project  | `displayName` (required), `parent`, `description` |
| `stitch_get_project`    | Get project details          | `name` (required): `projects/{projectId}`         |
| `stitch_list_projects`  | List all accessible projects | _(none)_                                          |

#### Screen Management

| Tool                               | Description                           | Key Parameters                                                                     |
| ---------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------- |
| `stitch_list_screens`              | List screens in a project             | `parent` (required): `projects/{id}`, `pageSize`, `pageToken`, `filter`            |
| `stitch_get_screen`                | Get screen details                    | `name` (required): `projects/{id}/screens/{screenId}`                              |
| `stitch_generate_screen_from_text` | Generate screen from text description | `parent` (required), `prompt` (required), `styleHints`, `numberOfScreens`          |
| `stitch_edit_screens`              | Edit existing screens                 | `parent` (required), `requests` (required): array of `{name, prompt, styleHints?}` |
| `stitch_generate_variants`         | Generate screen variants              | `parent` (required), `sourceScreen` (required), `numberOfVariants`, `prompt`       |

#### Design Systems

| Tool                                         | Description                      | Key Parameters                                                              |
| -------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------- |
| `stitch_create_design_system`                | Create a new design system       | `parent` (required), `displayName` (required), `description`, `source`      |
| `stitch_update_design_system`                | Update a design system           | `name` (required), `displayName`, `description`                             |
| `stitch_list_design_systems`                 | List design systems              | `parent` (required): `projects/{id}`, `pageSize`                            |
| `stitch_apply_design_system`                 | Apply a design system to screens | `name` (required), `screenNames` (required): array of screen resource names |
| `stitch_upload_design_md`                    | Upload a DESIGN.md file          | `parent` (required), `designMd` (required), `overwrite`                     |
| `stitch_create_design_system_from_design_md` | Create DS from DESIGN.md         | `parent` (required), `designMd` (required)                                  |

### 5 Virtual (SDK) Tools

| Tool                         | Description                      | Key Parameters                                                                        |
| ---------------------------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| `stitch_download_assets`     | Download screens/assets locally  | `projectId` (required), `outputDir` (required), `fileMode`, `tempDir`, `assetsSubdir` |
| `stitch_upload_design_files` | Upload design files via REST     | `projectId` (required), `filePath` (required), `title`, `createScreenInstances`       |
| `stitch_inspect_sdk`         | Full SDK tool catalog            | `toolName` (filter), `format` ("detailed" or "summary")                               |
| `stitch_build_fife_url`      | Build FIFE image URL with sizing | `baseUrl` (required), `width`, `height`                                               |
| `stitch_parse_stitch_name`   | Parse Stitch resource names      | `resourceName` (required)                                                             |

---

## Workflows

### Project Discovery & Screen Browsing

```
1. stitch_list_projects → pick a project
2. stitch_list_screens(parent: "projects/{projectId}") → browse screens
3. stitch_get_screen(name: "projects/{projectId}/screens/{screenId}") → inspect details
```

### Text-to-Screen Generation

```
1. stitch_generate_screen_from_text(
     parent: "projects/{projectId}",
     prompt: "A modern dashboard with analytics charts, sidebar navigation, and a dark theme",
     styleHints: "Material Design 3, dark mode",
     numberOfScreens: 3
   )
2. Review generated screens
3. Edit or generate variants as needed
```

### Full Design System Pipeline

```
1. Curate a DESIGN.md spec → stitch_upload_design_md(parent, designMd: "...")
2. stitch_create_design_system_from_design_md(parent, designMd: "...")
3. stitch_update_design_system(name, displayName: "Refined name")
4. stitch_generate_screen_from_text(parent, prompt: "New screen matching the DS")
5. stitch_apply_design_system(name, screenNames: [newly generated screens])
```

### Screen Editing & Variants

```
1. stitch_get_screen → understand current state
2. stitch_edit_screens(
     parent: "projects/{id}",
     requests: [{ name: "projects/{id}/screens/{sid}", prompt: "Move CTA to top-right, use primary color" }]
   )
3. stitch_generate_variants(
     parent: "projects/{id}",
     sourceScreen: "projects/{id}/screens/{sid}",
     numberOfVariants: 4,
     prompt: "Explore hero section layouts with different image placements"
   )
```

### Asset Upload & Download

```
1. Download existing work:
   stitch_download_assets(projectId: "...", outputDir: "./exports")
2. Upload new designs:
   stitch_upload_design_files(projectId: "...", filePath: "./designs/hero.png", title: "Hero Section")
3. Upload multiple formats (PNG, JPG, WEBP, HTML supported)
```

### SDK Inspection

```
1. stitch_inspect_sdk → get full tool catalog with schemas
2. stitch_inspect_sdk(toolName: "download_assets", format: "detailed") → drill into one
3. stitch_parse_stitch_name(resourceName: "projects/123/screens/abc") → parse identifiers
```

---

## Security Notes

- **HTTPS enforced by default.** Set `STITCH_ALLOW_INSECURE_MCP_URL=true` for local testing only.
- **Upload tool is sandboxed.** `stitch_upload_design_files` is disabled until `STITCH_ALLOWED_UPLOAD_DIR` is set. File reads are restricted to that directory.
- **Upload size capped at 10 MB** by default. Adjust via `STITCH_UPLOAD_MAX_BYTES`.
- **API key / access token** should be kept secure - use environment variables, never hardcode them.

---

## Troubleshooting

| Problem                  | Check                                                                 |
| ------------------------ | --------------------------------------------------------------------- |
| MCP server not found     | Run `/mcp` to verify `stitch` is listed. Restart agent.               |
| `STITCH_API_KEY` not set | Verify env var is exported in your shell profile.                     |
| Connection errors        | Verify internet access to `https://stitch.googleapis.com`.            |
| Upload fails             | Is `STITCH_ALLOWED_UPLOAD_DIR` set? Is the file under 10 MB?          |
| Permission denied        | Does your API key have the correct Stitch scopes?                     |
| OAuth issues             | Ensure both `STITCH_ACCESS_TOKEN` and `GOOGLE_CLOUD_PROJECT` are set. |

---

## Tool Name Reference

All tools are available via the MCP server as `mcp__plugin_stitch_stitch__stitch_<tool_name>`:

```
mcp__plugin_stitch_stitch__stitch_list_projects
mcp__plugin_stitch_stitch__stitch_get_project
mcp__plugin_stitch_stitch__stitch_create_project
mcp__plugin_stitch_stitch__stitch_list_screens
mcp__plugin_stitch_stitch__stitch_get_screen
mcp__plugin_stitch_stitch__stitch_generate_screen_from_text
mcp__plugin_stitch_stitch__stitch_edit_screens
mcp__plugin_stitch_stitch__stitch_generate_variants
mcp__plugin_stitch_stitch__stitch_create_design_system
mcp__plugin_stitch_stitch__stitch_update_design_system
mcp__plugin_stitch_stitch__stitch_list_design_systems
mcp__plugin_stitch_stitch__stitch_apply_design_system
mcp__plugin_stitch_stitch__stitch_upload_design_md
mcp__plugin_stitch_stitch__stitch_create_design_system_from_design_md
mcp__plugin_stitch_stitch__stitch_download_assets
mcp__plugin_stitch_stitch__stitch_upload_design_files
mcp__plugin_stitch_stitch__stitch_inspect_sdk
mcp__plugin_stitch_stitch__stitch_build_fife_url
mcp__plugin_stitch_stitch__stitch_parse_stitch_name
```
