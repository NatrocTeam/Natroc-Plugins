# motion

Local Motion documentation plugin for AI coding agents.

This plugin gives Claude Code and Codex a self-contained reference for the
`motion` animation library. It is meant for agents that need to build, refactor,
debug, or explain animation code without leaving the workspace to fetch docs
from the web.

The plugin currently ships two skills:

| Skill               | Use it for                                                                |
| ------------------- | ------------------------------------------------------------------------- |
| `motion-react`      | React, Next.js, Remix, Vite React, and other React-based Motion work.     |
| `motion-javascript` | Framework-neutral JavaScript, DOM/SVG animation, gestures, and utilities. |

It also ships focused Claude and Codex subagents for React animation work and
framework-neutral JavaScript animation work.

## Supported agents

| Agent       | Manifest path                |
| ----------- | ---------------------------- |
| Claude Code | `.claude-plugin/plugin.json` |
| Codex       | `.codex-plugin/plugin.json`  |

Both manifests point at the same local skill directory:

```json
"skills": "./skills/"
```

Codex also exposes UI-facing metadata such as display name, description,
category, capabilities, tags, and default prompts.

## Install/Use

### Claude Code CLI

- Add marketplace

  ```
  claude plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  claude plugin install motion@natroc-plugins
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
  codex plugin add motion@natroc-plugins
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

## What is included

```text
plugins/motion/
├── README.md
├── .claude-plugin/
│   └── plugin.json
├── .codex-plugin/
│   └── plugin.json
├── agents/
│   ├── motion-javascript-animator.md
│   ├── motion-javascript-animator.toml
│   ├── motion-react-animator.md
│   └── motion-react-animator.toml
├── assets/
└── skills/
    ├── motion-react/
    │   ├── SKILL.md
    │   └── docs/
    │       ├── animation/
    │       ├── components/
    │       ├── gestures/
    │       ├── guides/
    │       ├── hooks/
    │       └── motion-value/
    └── motion-javascript/
        ├── SKILL.md
        └── docs/
            ├── animations/
            ├── effects/
            ├── gestures/
            ├── guides/
            ├── integrations/
            ├── motion-value/
            └── utils/
```

This plugin does not ship `hooks/`, `monitors/`, `bin/`, `.mcp.json`,
`.lsp.json`, or `settings.json`. It is a documentation, skill, and subagent
plugin, not a runtime automation plugin.

## `motion-react`

`motion-react` is the skill for React animation work using Motion's modern
React entry points:

```ts
import { motion } from "motion/react";
import * as motionClient from "motion/react-client";
```

Use this skill when an agent needs to:

- create or refactor React UI animations
- migrate `framer-motion` imports to `motion/react`
- use `AnimatePresence`, `LayoutGroup`, `LazyMotion`, `MotionConfig`, or
  `Reorder`
- build layout animations, shared element transitions, SVG animations, and
  scroll-linked effects
- use React hooks such as `useAnimate`, `useScroll`, `useInView`,
  `useReducedMotion`, and `useDragControls`
- work with motion values through `useSpring`, `useTransform`,
  `useMotionTemplate`, `useMotionValueEvent`, `useTime`, and `useVelocity`
- add reduced-motion handling and bundle-size improvements

The bundled React docs are organized like this:

| Folder               | Files | Covers                                                                              |
| -------------------- | ----- | ----------------------------------------------------------------------------------- |
| `docs/animation/`    | 5     | animation overview, transitions, layout animation, scroll animation, SVG animation  |
| `docs/components/`   | 7     | `motion`, `AnimatePresence`, `LayoutGroup`, `LazyMotion`, `MotionConfig`, `Reorder` |
| `docs/gestures/`     | 3     | hover, drag, tap/pan/focus/inView overview, gesture event propagation               |
| `docs/guides/`       | 3     | installation, accessibility, bundle-size reduction                                  |
| `docs/hooks/`        | 7     | React hooks for animation control, scroll, visibility, drag, and reduced motion     |
| `docs/motion-value/` | 8     | motion values and React motion-value hooks                                          |

Example prompts:

```text
Use $motion-react to add an AnimatePresence exit animation to this modal.
Use $motion-react to migrate this component from framer-motion to motion/react.
Use $motion-react to build a scroll-linked reading progress bar.
Use $motion-react to reduce our animation bundle size with LazyMotion and m.
```

## `motion-javascript`

`motion-javascript` is the skill for using Motion without React. It covers the
`motion` package's JavaScript APIs for DOM elements, SVG, plain objects,
motion values, gestures, CSS generation, and small utilities.

Use this skill when an agent needs to:

- animate HTML, CSS, SVG, JavaScript objects, or WebGL-related objects
- use `animate()` for keyframes, timelines, sequences, controls, and staggered
  animations
- use `scroll()` for scroll-linked animation and scroll progress tracking
- use gesture helpers such as `hover()`, `press()`, `inView()`, and `resize()`
- render motion values to styles, attributes, object properties, or SVG
  attributes with effect helpers
- use JavaScript motion values such as `motionValue`, `springValue`,
  `mapValue`, and `transformValue`
- use utilities such as `delay`, `frame`, `mix`, `spring`, `stagger`,
  `transform`, and `wrap`
- generate CSS spring animations or reason about animation performance

The bundled JavaScript docs are organized like this:

| Folder               | Files | Covers                                                                  |
| -------------------- | ----- | ----------------------------------------------------------------------- |
| `docs/animations/`   | 3     | `animate`, `scroll`, easing functions                                   |
| `docs/effects/`      | 4     | `attrEffect`, `propEffect`, `styleEffect`, `svgEffect`                  |
| `docs/gestures/`     | 4     | `hover`, `inView`, `press`, `resize`                                    |
| `docs/guides/`       | 1     | animation performance                                                   |
| `docs/integrations/` | 1     | CSS spring generation and CSS integration patterns                      |
| `docs/motion-value/` | 4     | JavaScript motion values, mapping, transforms, and spring motion values |
| `docs/utils/`        | 8     | delay, frame loop, mixing, springs, stagger, transform, wrap, examples  |

Example prompts:

```text
Use $motion-javascript to animate this SVG path with animate().
Use $motion-javascript to build a scroll-linked animation without React.
Use $motion-javascript to wire hover() and press() gestures on plain DOM nodes.
Use $motion-javascript to generate a CSS spring animation.
```

## Local docs contract

The plugin is designed to be useful offline:

- skills point to local markdown files under `skills/*/docs/`
- examples and API notes are kept inside the plugin folder
- live example URLs may appear in the docs, but they are informational only
- no web fetch is required for the agent to use the bundled reference material

## Notes for maintainers

- Keep the Claude Code and Codex manifests aligned on `name`, `version`,
  `description`, `author`, `repository`, `license`, and `skills`.
- Add new Motion reference material under the matching skill's `docs/` folder.
- If a new skill is added under `skills/`, update this README and make sure the
  plugin manifests still point at `./skills/`.
- Prefer local links between docs. The validator should be able to check them
  without network access.

## License

MIT, matching the repository license.
