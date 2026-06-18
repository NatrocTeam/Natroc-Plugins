# Procedural Texture & Memory Management Examples

## Noise Texture

```javascript
function generateNoiseTexture(size = 256) {
  const data = new Uint8Array(size * size * 4);

  for (let i = 0; i < size * size; i++) {
    const value = Math.random() * 255;
    data[i * 4] = value;
    data[i * 4 + 1] = value;
    data[i * 4 + 2] = value;
    data[i * 4 + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, size, size);
  texture.needsUpdate = true;
  return texture;
}
```

## Gradient Texture

```javascript
function generateGradientTexture(color1, color2, size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, size, 0);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, 1);

  return new THREE.CanvasTexture(canvas);
}
```

## Texture Memory Management

### Dispose Textures

```javascript
// Single texture
texture.dispose();

// Material textures
function disposeMaterial(material) {
  const maps = [
    "map",
    "normalMap",
    "roughnessMap",
    "metalnessMap",
    "aoMap",
    "emissiveMap",
    "displacementMap",
    "alphaMap",
    "envMap",
    "lightMap",
    "bumpMap",
    "specularMap",
  ];

  maps.forEach((mapName) => {
    if (material[mapName]) {
      material[mapName].dispose();
    }
  });

  material.dispose();
}
```

### Texture Pooling

```javascript
class TexturePool {
  constructor() {
    this.textures = new Map();
    this.loader = new THREE.TextureLoader();
  }

  async get(url) {
    if (this.textures.has(url)) {
      return this.textures.get(url);
    }

    const texture = await new Promise((resolve, reject) => {
      this.loader.load(url, resolve, undefined, reject);
    });

    this.textures.set(url, texture);
    return texture;
  }

  dispose(url) {
    const texture = this.textures.get(url);
    if (texture) {
      texture.dispose();
      this.textures.delete(url);
    }
  }

  disposeAll() {
    this.textures.forEach((t) => t.dispose());
    this.textures.clear();
  }
}
```
