// Simplified particles.js for testing
let particleSystem;
let geometry;
let material;
let currentTemplate = 0;
let currentShapeName = 'Sphere';

const templates = ["sphere", "heart", "ring", "spiral", "cube", "wave", "torus", "star"];

export function initParticles(scene) {
  if (typeof THREE === 'undefined') {
    console.error('THREE.js is not loaded.');
    return null;
  }
  
  const count = 1000;
  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 2;
    positions[i3 + 1] = (Math.random() - 0.5) * 2;
    positions[i3 + 2] = (Math.random() - 0.5) * 2;
    
    colors[i3] = Math.random();
    colors[i3 + 1] = Math.random();
    colors[i3 + 2] = Math.random();
    
    sizes[i] = Math.random() * 0.02 + 0.01;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  material = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });
  
  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
  
  return particleSystem;
}

export function updateParticles(gestureState) {
  if (!particleSystem || !geometry) return;
  
  const positions = geometry.attributes.position.array;
  const colors = geometry.attributes.color.array;
  const time = Date.now() * 0.001;
  
  const { x: handX, y: handY } = gestureState.position;
  const openness = gestureState.openness;
  
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += (Math.random() - 0.5) * 0.01 + handX * 0.001;
    positions[i + 1] += (Math.random() - 0.5) * 0.01 + handY * 0.001;
    positions[i + 2] += (Math.random() - 0.5) * 0.01;
    
    const scale = 0.5 + openness * 1.5;
    positions[i] *= scale;
    positions[i + 1] *= scale;
    positions[i + 2] *= scale;
    
    const hue = (time * 0.1 + i * 0.01) % 1;
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }
  
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
}

export function switchTemplate() {
  currentTemplate = (currentTemplate + 1) % templates.length;
  const shapeNames = ["Sphere", "Heart", "Ring", "Spiral", "Cube", "Wave", "Torus", "Star"];
  currentShapeName = shapeNames[currentTemplate];
  
  const shapeIndicator = document.getElementById('current-shape');
  if (shapeIndicator) {
    shapeIndicator.textContent = currentShapeName;
  }
}

export function getCurrentShapeName() {
  return currentShapeName;
}