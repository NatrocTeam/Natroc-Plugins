# Human Context Writer

A context-first writing plugin for Claude Code and Codex.

It tells the active agent how to work as a human-style editor: understand the user's situation, audit the draft for common AI-writing patterns, preserve the original meaning, match the intended voice, and produce text that sounds specific, natural, and useful.

This plugin is skill-only. It does not ship separate subagent files. When installed, it guides the current agent's writing behavior through `skills/human-context-writer/SKILL.md`.

---

## What it does

- Reads the user's goal, audience, medium, tone, language, and constraints before writing
- Audits drafts for AI-like patterns such as generic openings, inflated importance, corporate filler, fake balance, vague attribution, repetitive structure, and formulaic endings
- Rewrites AI-sounding text into natural human writing without deleting the original meaning
- Writes from scratch when the user gives enough context
- Matches the user's existing writing style when a sample is provided
- Adapts tone based on the task: casual, professional, technical, firm, social, summary, or article-style
- Works in any language by matching the rhythm and vocabulary of that language instead of translating English writing habits directly

## What it does not do

- Bypass AI detectors
- Fabricate personal experiences or fake citations
- Impersonate real people
- Make false claims sound more believable

---

## What the agent does

When this skill is active, the agent follows an editorial loop:

1. Identify the writing job: rewrite, draft, summarize, explain, respond, document, or make a message firmer.
2. Build a context profile: purpose, reader, medium, tone, language, emotional temperature, technical depth, details to keep, and details to avoid.
3. Ask only the missing questions that materially affect the output. If the user wants speed, make reasonable assumptions and say them briefly.
4. Audit the text for AI-writing patterns, using the humanizer-style cleanup approach as the baseline.
5. Rewrite with natural rhythm, specific detail, plain wording, and the user's intent intact.
6. Run a final pass for remaining generic phrasing, over-polish, non-keyboard symbols, fake enthusiasm, and meaning drift.
7. Return either the final text only or a short "what changed" note when useful.

The agent should not blindly make text casual. Human writing can be formal, technical, neutral, emotional, direct, or polished. The point is to fit the situation.

---

## Reference baseline

The AI-pattern audit is based on the same cleanup direction as `humanizer`:

```txt
https://raw.githubusercontent.com/blader/humanizer/refs/heads/main/SKILL.md
```

Human Context Writer expands that baseline with context intake, voice matching,
multilingual writing behavior, medium-specific modes, and clearer output contracts
for agents.

---

## When to use it

Use this skill when the user needs writing that fits the actual situation, not a generic template.

Good use cases:

- Rewriting a paragraph that sounds too robotic
- Writing a README, commit message, or PR description
- Drafting an email or Slack message
- Writing a social post with a real point of view
- Summarizing text without losing the meaning
- Converting formal writing into something more readable
- Writing product copy without corporate filler
- Writing an article or blog post with a clear stance

---

## Writing modes

The skill selects the right mode based on the user's task.

| Mode                      | When to use                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| Direct answer             | Technical or factual questions that need a clear, immediate answer |
| Casual explanation        | "What is this", "why", or "how does it work" questions             |
| Professional rewrite      | Email, proposal, README, or business writing                       |
| Technical documentation   | CLI docs, API docs, GitHub issues, code explanations               |
| Emotional or firm writing | When the user needs a stronger or more direct tone                 |
| Social post               | LinkedIn, X, Instagram, community posts                            |
| Summary                   | Condensing longer text while keeping what matters                  |

---

## Presets

Six presets are available for quick tone selection.

| Preset         | Tone                                           |
| -------------- | ---------------------------------------------- |
| `casual`       | Natural, warm, conversational                  |
| `direct`       | Clear, practical, straight to the point        |
| `professional` | Polished but not stiff                         |
| `technical`    | Precise, example-driven, no marketing language |
| `emotional`    | Firm and direct without softening the message  |
| `summary`      | Concise and faithful to the original           |

---

## How context works

Before writing, the skill identifies:

- What the text is for
- Who will read it
- What tone fits the situation
- What language the user is writing in
- What must stay and what should change
- Whether the text needs an audit, a rewrite, a fresh draft, a summary, or multiple tone options
- Whether the user has a writing sample that should be matched

If important context is missing, the skill asks a small number of focused questions. If the user wants fast output, it makes reasonable assumptions and states them briefly before writing.

---

## Supported runtimes

| Runtime     | Manifest path                |
| ----------- | ---------------------------- |
| Claude Code | `.claude-plugin/plugin.json` |
| Codex       | `.codex-plugin/plugin.json`  |

The plugin is skill-only: it does not ship MCP servers, commands, hooks, or
runtime scripts.

## Install/Use

### Claude Code CLI

- Add marketplace

  ```
  claude plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  claude plugin install human-context-writer@natroc-plugins
  ```

### Claude Desktop & Claude Web (claude.ai)

Open `Customize` in the left panel and click `+` icon, then select `Create
plugin` > `Add marketplace`.

- Add marketplace from a repository

  ```
  NatrocTeam/Natroc-Plugins
  ```

### Codex CLI

- Add marketplace

  ```
  codex plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin
  ```
  codex plugin add human-context-writer@natroc-plugins
  ```

### Codex Desktop

- Add marketplace

  Source

  ```
  NatrocTeam/Natroc-Plugins
  ```

  Git ref (optional)

  ```
  main
  ```

---

## Files

```text
human-context-writer/
├── .codex-plugin/plugin.json
├── .claude-plugin/plugin.json
├── assets/
└── skills/
    └── human-context-writer/
        ├── SKILL.md              # Core skill instructions
        ├── examples/             # Writing examples by use case
        │   ├── casual-explanation.md
        │   ├── direct-answer.md
        │   ├── email-writing.md
        │   ├── emotional-firm-writing.md
        │   ├── essay-article.md
        │   ├── github-writing.md
        │   ├── product-copy.md
        │   ├── professional-rewrite.md
        │   ├── social-post.md
        │   ├── summary.md
        │   └── technical-documentation.md
        └── presets/              # Tone presets for quick selection
            ├── casual.json
            ├── direct.json
            ├── emotional.json
            ├── professional.json
            ├── summary.json
            └── technical.json
```

---

## License

MIT
