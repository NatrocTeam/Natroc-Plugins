# Additional Post-Processing Effects

## Selective Bloom

Apply bloom only to specific objects.

```javascript
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// Layer setup
const BLOOM_LAYER = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_LAYER);

// Mark objects to bloom
glowingMesh.layers.enable(BLOOM_LAYER);

// Dark material for non-blooming objects
const darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const materials = {};

function darkenNonBloomed(obj) {
  if (obj.isMesh && !bloomLayer.test(obj.layers)) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
}

function restoreMaterial(obj) {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}

// Custom render loop
function render() {
  scene.traverse(darkenNonBloomed);
  composer.render();
  scene.traverse(restoreMaterial);
  renderer.render(scene, camera);
}
```

## Depth of Field (DOF)

```javascript
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";

const bokehPass = new BokehPass(scene, camera, {
  focus: 10.0, // Focus distance
  aperture: 0.025, // Aperture (smaller = more DOF)
  maxblur: 0.01, // Max blur amount
});

composer.addPass(bokehPass);

// Update focus dynamically
bokehPass.uniforms["focus"].value = distanceToTarget;
```

## Film Grain

```javascript
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";

const filmPass = new FilmPass(
  0.35, // noise intensity
  0.5, // scanline intensity
  648, // scanline count
  false, // grayscale
);

composer.addPass(filmPass);
```

## Glitch Effect

```javascript
import { GlitchPass } from "three/addons/postprocessing/GlitchPass.js";

const glitchPass = new GlitchPass();
glitchPass.goWild = false; // Continuous glitching

composer.addPass(glitchPass);
```

## Halftone

```javascript
import { HalftonePass } from "three/addons/postprocessing/HalftonePass.js";

const halftonePass = new HalftonePass(window.innerWidth, window.innerHeight, {
  shape: 1, // 1 = dot, 2 = ellipse, 3 = line, 4 = square
  radius: 4,
  rotateR: Math.PI / 12,
  rotateB: (Math.PI / 12) * 2,
  rotateG: (Math.PI / 12) * 3,
  scatter: 0,
  blending: 1,
  blendingMode: 1,
  greyscale: false,
});

composer.addPass(halftonePass);
```

## Multi-Pass Rendering

```javascript
// Multiple composers for different scenes/layers
const bgComposer = new EffectComposer(renderer);
bgComposer.addPass(new RenderPass(bgScene, camera));

const fgComposer = new EffectComposer(renderer);
fgComposer.addPass(new RenderPass(fgScene, camera));
fgComposer.addPass(bloomPass);

// Combine in render loop
function animate() {
  renderer.autoClear = false;
  renderer.clear();

  bgComposer.render();
  renderer.clearDepth();
  fgComposer.render();
}
```
