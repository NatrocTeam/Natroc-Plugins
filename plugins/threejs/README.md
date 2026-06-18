# Three.js

`threejs` is a skill-only Claude Code and Codex plugin for Three.js 3D
graphics development on the web.

Agents use this plugin for scene setup, geometry creation, material authoring,
shader programming, lighting, animation, user interaction, model loading,
texture management, and post-processing - all grounded against the official
Three.js documentation and API reference.

## What It Includes

- 10 bundled skills covering the full Three.js pipeline
- Public docs reference: `https://threejs.org/docs/`
- Official repository: `https://github.com/mrdoob/three.js`

### Skills

| Skill                    | Domain                                                           |
| ------------------------ | ---------------------------------------------------------------- |
| `threejs-fundamentals`   | Scene, camera, renderer, Object3D hierarchy, transforms          |
| `threejs-geometry`       | BufferGeometry, primitives, custom shapes, modifiers             |
| `threejs-materials`      | PBR (MeshStandard, MeshPhysical), basic, phong, shader materials |
| `threejs-shaders`        | GLSL vertex/fragment shaders, ShaderMaterial, uniforms, WGSL     |
| `threejs-lighting`       | Ambient, directional, point, spot, hemisphere lights, shadows    |
| `threejs-animation`      | AnimationMixer, keyframes, skeletal animation, morph targets     |
| `threejs-interaction`    | Raycasting, orbit controls, pointer events, drag-and-drop        |
| `threejs-loaders`        | glTF, FBX, OBJ, DRACO, TextureLoader, loading progress           |
| `threejs-textures`       | Texture mapping, UVs, mipmaps, texture filtering, compression    |
| `threejs-postprocessing` | EffectComposer, bloom, SSAO, DOF, custom passes                  |

## Agent Usage Contract

Agents using this plugin should:

1. Read the user's 3D scene goal before choosing a skill.
2. Use the official Three.js docs (`https://threejs.org/docs/`) as source truth.
3. Prefer `MeshStandardMaterial` or `MeshPhysicalMaterial` for realistic rendering.
4. Prefer `glTF` (`.glb`/`.gltf`) as the recommended 3D model format.
5. Keep shaders minimal - use built-in materials when possible.
6. Never invent API methods, parameters, or behavior that do not exist in the official Three.js source.
7. Verify generated code examples match the Three.js version the user's project uses.

## Install/Use

### Claude

- Claude Code CLI

  ```
  # Add marketplace
  claude plugin marketplace add NatrocTeam/Natroc-Plugins

  # Install plugin
  claude plugin install threejs@natroc-plugins
  ```

- Claude Desktop (macOS & Windows)

  ```
  # Repository
  NatrocTeam/Natroc-Plugins
  ```

### Codex

- Codex CLI

  ```
  # Add marketplace
  codex plugin marketplace add NatrocTeam/Natroc-Plugins

  # Install plugin from natroc marketplace
  codex plugin add threejs@natroc-plugins
  ```

- Codex Desktop (macOS and Windows)

  ```
  # Source
  NatrocTeam/Natroc-Plugins

  # git ref
  main
  ```

## References

- Docs: `https://threejs.org/docs/`
- Source: `https://github.com/mrdoob/three.js`
- Examples: `https://threejs.org/examples/`
