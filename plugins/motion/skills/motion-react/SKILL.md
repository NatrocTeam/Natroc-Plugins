---
name: motion-react
description: React animation guidance using Motion for React.
version: 1.0.0
allowed_tools: Read Write Edit Glep Glob
---

# Motion in React

## Purpose

This skill helps an AI agent understand, implement, refactor, and troubleshoot animations in React applications using Motion for React. It covers declarative animation patterns, motion components, transitions, variants, gestures, layout animations, scroll-based effects, exit animations, Motion values, accessibility considerations, and performance-aware animation decisions.

Use this skill to produce React animation code that feels smooth, maintainable, idiomatic, and production-ready while following the current Motion import style from `motion/react`.

## When to Use This Skill

Use this skill when the user is working with Motion in a React, Next.js, Remix, Vite React, or other React-based project.

Use it for tasks such as creating UI animations, improving existing animations, migrating from `framer-motion` to `motion/react`, debugging animation behavior, adding `AnimatePresence`, building layout transitions, implementing hover/tap/drag gestures, creating scroll-linked effects, using Motion hooks, reducing animation bundle size, or improving animation accessibility with reduced-motion support.

Do not use this skill for plain CSS-only transitions unless the user specifically wants Motion-based implementation, or when the animation can be solved more simply with native CSS.

## Overview

React gives you the power to build dynamic user interfaces, but orchestrating complex, performant animations can be a challenge. Motion is a production-ready React animation library designed to solve this problem, making it simple to create everything from beautiful micro-interactions to complex, gesture-driven animations.

```
import { motion } from "motion/react"

function Component() {
  return <motion.button animate={{ opacity: 1 }} />
}
```

### Key advantages

Here’s when it’s the right choice for your project.

- **Built for React.** While other animation libraries like **GSAP** are messy to integrate with React, Motion's declarative API is a natural fit. Animations can be linked directly to state and props.
- **Hardware-acceleration.** Motion leverages the same high-performance browser animations as CSS, ensuring your UIs stay smooth and snappy. 120fps animations with a much simpler and more expressive API.
- **Animate anything.** CSS has hard limits. Values you can't animate, keyframes you can't interrupt, staggers that must be hardcoded. Motion provides a single, consistent API that scales from simple to complex.
- **App-like gestures.** Standard CSS `:hover` events are unreliable on touch devices. Motion provides robust, cross-device gesture recognisers for tap, drag, and hover that feel native and intuitive on any device.
- **Production ready.** Built on TypeScript, surrounded by an extensive test suite, and fully tree-shakable so you only include what you import.

### When is CSS a better choice?

For simple, self-contained effects (like a color change on hover) a standard CSS transition is a lightweight solution. The strength of Motion is that it can do these simple kinds of animations but also scale to anything you can imagine. All with the same easy to write and maintain API.

## Install

Motion is available via [npm](https://www.npmjs.com/package/motion):

```
npm install motion
```

Features can now be imported via `"motion/react"`:

```
import { motion } from "motion/react"
```

Prefer to install via CDN, or looking for framework-specific instructions? Check out our [full installation guide](./docs/guides/installation.md).

## Create your first animation

The `<motion />` component is the foundation of Motion for React. Prefix any HTML or SVG tag with `motion.` to unlock animation props like `animate`, `whileHover`, and `exit`:

```
<motion.ul animate={{ rotate: 360 }} />
```

When values in `animate` change, Motion automatically transitions between them.

Physical properties like `x` and `scale` use spring physics by default; visual properties like `opacity` use tween easing. Override the animation type, duration, easing, or delay via [the](./docs/animation/Transitions.md)`transition`[prop](./docs/animation/Transitions.md):

```
<motion.div
  animate={{
    scale: 2,
    transition: { duration: 2 }
  }}
/>
```

[Learn more about React animation](./docs/animation/README.md)

## Enter animation

When a component enters the page, it will automatically animate to the values defined in the `animate` prop.

You can provide values to animate from via the `initial` prop (otherwise these will be read from the DOM).

```
<motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} />
```

_Live example:_ https://examples.motion.dev/react/enter-animation?utm_source=embed

Or disable this initial animation entirely by setting `initial` to `false`.

```
<motion.button initial={false} animate={{ scale: 1 }} />
```

## Hover & tap animation

`<motion />` extends React's event system with powerful [gesture animations](./docs/gestures/README.md). It currently supports hover, tap, focus, and drag.

```
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  onHoverStart={() => console.log('hover started!')}
/>
```

Motion's gestures are designed to feel better than using CSS or JavaScript events alone.

## Scroll animation

Motion supports both types of [scroll animations](./docs/animation/Scroll.md): **Scroll-triggered**and **scroll-linked**.

To trigger an animation on scroll, the `whileInView` prop defines a state to animate to/from when an element enters/leaves the viewport:

```
<motion.div
  initial={{ backgroundColor: "rgb(0, 255, 0)", opacity: 0 }}
  whileInView={{ backgroundColor: "rgb(255, 0, 0)", opacity: 1 }}
/>
```

_Live example:_ https://examples.motion.dev/react/scroll-triggered?utm_source=embed

Whereas to link a value directly to scroll position, it's possible to use `MotionValue`s via `useScroll`.

```
const { scrollYProgress } = useScroll()

return <motion.div style={{ scaleX: scrollYProgress }} />
```

_Live example:_ https://examples.motion.dev/react/scroll-linked?utm_source=embed

## Layout animation

Motion's [layout animation](./docs/animation/Layout.md) engine detects layout changes (size, position, reorder) and smoothly animates between states using transforms. Unlike basic "FLIP" implementations, it does so while correcting for scale-distortion.

It's as easy as applying the `layout` prop.

```
<motion.div layout />
```

Or to animate between completely different elements, a `layoutId`:

```
<motion.div layoutId="underline" />
```

## Exit animations

By wrapping `motion` components with `<AnimatePresence>` we gain access to [exit animations](./docs/components/AnimatePresence.md). This allows us to animate elements as they're removed from the DOM.

```
<AnimatePresence>
  {show ? <motion.div key="box" exit={{ opacity: 0 }} /> : null}
</AnimatePresence>
```

## SVG animations

Motion has full support for [SVG animations](./docs/animation/SVG.md), including support for animating `viewBox` and special values for simple path drawing effects.

```
<motion.circle animate={{ pathLength: 1 }} />
```

## Learn next

That covers the core building blocks. Here's where to go next based on what you want to build and your learning style.

The [React animation](./docs/animation/README.md) guide will teach you more about the different types of animations you can build with this React animation library.
