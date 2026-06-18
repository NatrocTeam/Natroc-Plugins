# Plugin Categories

Only the categories listed below are **allowed** in the Natroc-Plugins marketplace.
Plugin authors must choose from this list. Categories not listed here will be
rejected during review.

Categories describe **what domain the plugin serves**, not what technology it uses.
Framework, language, and tool names belong in `keywords`, not in `category`.

> [!IMPORTANT]
> Claude Code marketplace (`.claude-plugin/marketplace.json`) uses
> **lowercase kebab-case**. Codex marketplace (`.agents/plugins/marketplace.json`
> and `.codex-plugin/plugin.json`) uses **Title Case**.

---

## Allowed Categories

| #   | Claude Code          | Codex                | Description                                                                                                               |
| --- | -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | `ai`                 | `AI`                 | AI/ML model usage, inference, embeddings, prompt engineering, agent orchestration, model routing, fine-tuning, evaluation |
| 2   | `analytics`          | `Analytics`          | Product analytics, business intelligence, metrics, dashboards, event tracking, funnel analysis, reporting                 |
| 3   | `automation`         | `Automation`         | Workflow automation, task scheduling, ETL pipelines, data syncing, batch processing, cron jobs                            |
| 4   | `cloud`              | `Cloud`              | Cloud provider SDKs, resource provisioning, cost management, serverless, edge computing, cloud architecture               |
| 5   | `communication`      | `Communication`      | Email, SMS, push notifications, in-app messaging, chat platforms, video conferencing                                      |
| 6   | `content`            | `Content`            | CMS, headless CMS, content modeling, digital asset management, publishing workflows, localization                         |
| 7   | `data`               | `Data`               | Databases, data warehouses, data lakes, query builders, ORMs, migrations, indexing, data modeling                         |
| 8   | `design`             | `Design`             | Design tools, design-to-code, design systems, component libraries, prototyping, theme management                          |
| 9   | `development`        | `Development`        | General software development, languages, frameworks, SDKs, APIs, architecture, code patterns                              |
| 10  | `devops`             | `DevOps`             | CI/CD, infrastructure-as-code, containerization, orchestration, deployment, release management                            |
| 11  | `documentation`      | `Documentation`      | API docs, README generation, changelogs, knowledge bases, technical writing, code comments                                |
| 12  | `ecommerce`          | `Ecommerce`          | Online stores, shopping carts, product catalogs, inventory, order management, marketplaces                                |
| 13  | `finance`            | `Finance`            | Payments, billing, invoicing, accounting, banking, cryptocurrency, trading, financial data                                |
| 14  | `identity`           | `Identity`           | Authentication, authorization, OAuth/OIDC, SSO, MFA, RBAC, directory services, user management                            |
| 15  | `infrastructure`     | `Infrastructure`     | Servers, networking, DNS, CDN, load balancing, proxies, storage, system administration                                    |
| 16  | `integration`        | `Integration`        | Third-party API connectors, webhooks, iPaaS, service bridges, data connectors, middleware                                 |
| 17  | `mobile`             | `Mobile`             | Mobile app development, cross-platform frameworks, native modules, app store deployment                                   |
| 18  | `monitoring`         | `Monitoring`         | Observability, logging, tracing, alerting, incident management, status pages, uptime                                      |
| 19  | `productivity`       | `Productivity`       | Task management, note-taking, time tracking, personal automation, knowledge management                                    |
| 20  | `project-management` | `Project Management` | Issue tracking, boards, sprints, roadmaps, estimation, agile workflows, team planning                                     |
| 21  | `security`           | `Security`           | Vulnerability scanning, secret detection, SAST/DAST, compliance, dependency auditing, pen testing                         |
| 22  | `social`             | `Social`             | Social media APIs, content scheduling, engagement analytics, community management, feeds                                  |
| 23  | `testing`            | `Testing`            | Unit tests, integration tests, E2E tests, contract testing, coverage analysis, test data generation                       |
| 24  | `web`                | `Web`                | Web development, frontend, backend, browser APIs, SEO, performance, accessibility, PWA                                    |

---

## How to Choose

Ask these questions in order:

1. **What domain does the plugin serve?** Not what tech it uses. A Next.js plugin
   serves the `web` domain. A Stripe plugin serves the `finance` domain.
2. **Is there a more specific category?** If the plugin handles payments, choose
   `finance`, not `integration`.
3. **When in doubt, use `development`.** It is the general fallback.

### Common Mistakes

| Wrong                | Right             | Why                                       |
| -------------------- | ----------------- | ----------------------------------------- |
| `nextjs`             | `web`             | Next.js is a framework, not a category    |
| `react`              | `web`             | React is a library, not a category        |
| `midtrans`           | `finance`         | Midtrans is a product, not a category     |
| `claude-code`        | `development`     | Claude Code is a platform, not a category |
| `plugin-development` | `development`     | Plugin dev is still software development  |
| `payments`           | `finance`         | Payments fall under finance               |
| `containerization`   | `devops`          | Containers are part of DevOps             |
| `css`                | `web` or `design` | CSS serves web or design domains          |
| `animation`          | `design` or `web` | Animation serves design or web domains    |
| `meta`               | `development`     | Meta plugins are still development tools  |

---

## Usage Per File

### `.claude-plugin/marketplace.json` (kebab-case)

```json
{ "category": "finance" }
```

### `.agents/plugins/marketplace.json` (Title Case)

```json
{ "category": "Finance" }
```

### `.codex-plugin/plugin.json` → `interface.category` (Title Case)

```json
{ "interface": { "category": "Finance" } }
```

### `.claude-plugin/plugin.json`

Does not have a `category` field. Categories only exist in marketplace entries.

---

## Rules

1. **Pick from this list only.** Unlisted categories are rejected during review.
2. **One plugin, one category.** Pick the domain the plugin primarily serves.
3. **Categories are domains, not technologies.** React, Docker, Stripe, WordPress
   are not categories - they are `keywords`. Use the `keywords` field for those.
4. **Match the casing per file.** See table above.
5. **To add a new category,** open a PR against `rules/category.md` justifying why
   the new category is needed. The category must be broad enough to serve multiple
   unrelated plugins in the future.
6. **When in doubt,** use `development` / `Development`.
