---
name: threejs-interaction
description: Three.js interaction - raycasting, controls, mouse/touch input, object selection. Use when handling user input, implementing click detection, adding camera controls, or creating interactive 3D experiences.
---

# Three.js Interaction

## Quick Start

```javascript
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Raycasting for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    console.log("Clicked:", intersects[0].object);
  }
}

window.addEventListener("click", onClick);
```

## Raycaster

### Basic Raycasting

```javascript
const raycaster = new THREE.Raycaster();

// From camera (mouse picking)
raycaster.setFromCamera(mousePosition, camera);

// From any origin and direction
raycaster.set(origin, direction); // origin: Vector3, direction: normalized Vector3

// Get intersections
const intersects = raycaster.intersectObjects(objects, recursive);
// Each intersect: { distance, point, face, faceIndex, object, uv, uv1, normal, instanceId }
```

### Mouse Position Conversion

```javascript
const mouse = new THREE.Vector2();

function updateMouse(event) {
  // For full window
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
```

For canvas-specific conversion and detailed intersect structures, see [references/raycaster-details.md](references/raycaster-details.md).

### Touch Support

```javascript
function onTouchStart(event) {
  event.preventDefault();

  if (event.touches.length === 1) {
    const touch = event.touches[0];
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
      handleSelection(intersects[0]);
    }
  }
}

renderer.domElement.addEventListener("touchstart", onTouchStart);
```

### Raycaster Options

```javascript
const raycaster = new THREE.Raycaster();

// Near/far clipping (default: 0, Infinity)
raycaster.near = 0;
raycaster.far = 100;

// Line/Points precision
raycaster.params.Line.threshold = 0.1;
raycaster.params.Points.threshold = 0.1;

// Layers (only intersect objects on specific layers)
raycaster.layers.set(1);
```

### Efficient Raycasting

```javascript
// Only check specific objects
const clickables = [mesh1, mesh2, mesh3];
const intersects = raycaster.intersectObjects(clickables, false);

// Use layers for filtering
mesh1.layers.set(1); // Clickable layer
raycaster.layers.set(1);

// Throttle raycast for hover effects
let lastRaycast = 0;
function onMouseMove(event) {
  const now = Date.now();
  if (now - lastRaycast < 50) return; // 20fps max
  lastRaycast = now;
  // Raycast here
}
```

## Camera Controls

### OrbitControls (Recommended default)

```javascript
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const controls = new OrbitControls(camera, renderer.domElement);

// Damping (smooth movement)
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Rotation limits
controls.minPolarAngle = 0; // Top
controls.maxPolarAngle = Math.PI / 2; // Horizon
controls.minAzimuthAngle = -Math.PI / 4; // Left
controls.maxAzimuthAngle = Math.PI / 4; // Right

// Zoom limits
controls.minDistance = 2;
controls.maxDistance = 50;

// Enable/disable features
controls.enableRotate = true;
controls.enableZoom = true;
controls.enablePan = true;

// Auto-rotate
controls.autoRotate = true;
controls.autoRotateSpeed = 2.0;

// Target (orbit point)
controls.target.set(0, 1, 0);

// Update in animation loop
function animate() {
  controls.update(); // Required for damping and auto-rotate
  renderer.render(scene, camera);
}
```

### Other Control Types

- **FlyControls** - Free-fly camera (flight sim style)
- **FirstPersonControls** - FPS-style look and movement
- **PointerLockControls** - Mouse lock with keyboard movement
- **TrackballControls** - Free rotation with roll
- **MapControls** - Top-down map-style orbit

Full examples for all control types: [examples/camera-controls.md](examples/camera-controls.md)

## TransformControls

Gizmo for moving/rotating/scaling objects.

```javascript
import { TransformControls } from "three/addons/controls/TransformControls.js";

const transformControls = new TransformControls(camera, renderer.domElement);
scene.add(transformControls);

// Attach to object
transformControls.attach(selectedMesh);

// Switch modes
transformControls.setMode("translate"); // 'translate', 'rotate', 'scale'

// Change space
transformControls.setSpace("local"); // 'local', 'world'

// Size
transformControls.setSize(1);

// Events
transformControls.addEventListener("dragging-changed", (event) => {
  // Disable orbit controls while dragging
  orbitControls.enabled = !event.value;
});

transformControls.addEventListener("change", () => {
  renderer.render(scene, camera);
});

// Keyboard shortcuts
window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "g":
      transformControls.setMode("translate");
      break;
    case "r":
      transformControls.setMode("rotate");
      break;
    case "s":
      transformControls.setMode("scale");
      break;
    case "Escape":
      transformControls.detach();
      break;
  }
});
```

## DragControls

Drag objects directly.

```javascript
import { DragControls } from "three/addons/controls/DragControls.js";

const draggableObjects = [mesh1, mesh2, mesh3];
const dragControls = new DragControls(
  draggableObjects,
  camera,
  renderer.domElement,
);

dragControls.addEventListener("dragstart", (event) => {
  orbitControls.enabled = false;
  event.object.material.emissive.set(0xaaaaaa);
});

dragControls.addEventListener("drag", (event) => {
  // Constrain to ground plane
  event.object.position.y = 0;
});

dragControls.addEventListener("dragend", (event) => {
  orbitControls.enabled = true;
  event.object.material.emissive.set(0x000000);
});
```

## Selection System

### Click to Select

```javascript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;

function onMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(selectableObjects);

  // Deselect previous
  if (selectedObject) {
    selectedObject.material.emissive.set(0x000000);
  }

  // Select new
  if (intersects.length > 0) {
    selectedObject = intersects[0].object;
    selectedObject.material.emissive.set(0x444444);
  } else {
    selectedObject = null;
  }
}
```

For Box Selection, Hover Effects, and a full InteractionManager class, see [examples/selection-system.md](examples/selection-system.md).

## Keyboard Input

```javascript
const keys = {};

document.addEventListener("keydown", (event) => {
  keys[event.code] = true;
});

document.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

function update() {
  const speed = 0.1;

  if (keys["KeyW"]) player.position.z -= speed;
  if (keys["KeyS"]) player.position.z += speed;
  if (keys["KeyA"]) player.position.x -= speed;
  if (keys["KeyD"]) player.position.x += speed;
  if (keys["Space"]) player.position.y += speed;
  if (keys["ShiftLeft"]) player.position.y -= speed;
}
```

## World-Screen Coordinate Conversion

See [references/raycaster-details.md](references/raycaster-details.md) for world-to-screen, screen-to-world, and ray-plane intersection functions.

## Performance Tips

1. **Limit raycasts**: Throttle mousemove handlers
2. **Use layers**: Filter raycast targets
3. **Simple collision meshes**: Use invisible simpler geometry for raycasting
4. **Disable controls when not needed**: `controls.enabled = false`
5. **Batch updates**: Group interaction checks

```javascript
// Use simpler geometry for raycasting
const complexMesh = loadedModel;
const collisionMesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ visible: false }),
);
collisionMesh.userData.target = complexMesh;
clickables.push(collisionMesh);
```

## See Also

- `threejs-fundamentals` - Camera and scene setup
- `threejs-animation` - Animating interactions
- `threejs-shaders` - Visual feedback effects
- [Camera Controls Examples](examples/camera-controls.md)
- [Selection System Examples](examples/selection-system.md)
- [Raycaster Reference](references/raycaster-details.md)
