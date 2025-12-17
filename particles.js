let particleSystem;
let geometry;
let material;
let currentTemplate = 0;
let switchCooldown = false;
let transitionProgress = 0;
let isTransitioning = false;
let previousPositions = [];
let targetPositions = [];
let currentShapeName = 'Sphere';

const templates = ["sphere", "heart", "ring", "spiral", "cube", "wave", "torus", "star"];

export function initParticles(scene) {
  const count = 2000;

  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  material = new THREE.PointsMaterial({
    size: 0.03,
    color: 0xff66ff,
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
}

export function updateParticles(gesture) {
  const positions = geometry.attributes.position.array;

  // Handle smooth transitions
  if (isTransitioning) {
    transitionProgress += 0.02; // Speed of transition
    if (transitionProgress >= 1) {
      transitionProgress = 1;
      isTransitioning = false;
    }
    
    // Interpolate between previous and target positions
    for (let i = 0; i < positions.length; i += 3) {
      const prevIdx = i;
      const targetIdx = i;
      
      // Smooth easing function
      const easeProgress = 1 - Math.pow(1 - transitionProgress, 3);
      
      positions[i] = previousPositions[prevIdx] + (targetPositions[targetIdx] - previousPositions[prevIdx]) * easeProgress;
      positions[i + 1] = previousPositions[prevIdx + 1] + (targetPositions[targetIdx + 1] - previousPositions[prevIdx + 1]) * easeProgress;
      positions[i + 2] = previousPositions[prevIdx + 2] + (targetPositions[targetIdx + 2] - previousPositions[prevIdx + 2]) * easeProgress;
      
      // Add gesture-based movement
      positions[i] += gesture.position.x * 0.0005;
      positions[i + 1] += gesture.position.y * 0.0005;
    }
  } else {
    // Normal movement when not transitioning
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += gesture.position.x * 0.0005;
      positions[i + 1] += gesture.position.y * 0.0005;
    }
  }

  material.size = 0.02 + gesture.openness * 0.08;
  material.color.setHSL(gesture.openness, 1, 0.6);

  geometry.attributes.position.needsUpdate = true;

  if (gesture.pinch && !switchCooldown && !isTransitioning) {
    switchTemplate();
  }
}

function updateShapeDisplay() {
  const shapeNames = ["Sphere", "Heart", "Ring", "Spiral", "Cube", "Wave", "Torus", "Star"];
  currentShapeName = shapeNames[currentTemplate];
  
  const shapeIndicator = document.getElementById('current-shape');
  const shapeIndicatorContainer = document.getElementById('shape-indicator');
  
  if (shapeIndicator) {
    shapeIndicator.textContent = currentShapeName;
    shapeIndicatorContainer.classList.add('changing');
    
    setTimeout(() => {
      shapeIndicatorContainer.classList.remove('changing');
    }, 300);
  }
}

export function switchTemplate() {
  switchCooldown = true;
  setTimeout(() => (switchCooldown = false), 800);

  currentTemplate = (currentTemplate + 1) % templates.length;
  updateShapeDisplay(); // Update the UI
  
  const positions = geometry.attributes.position.array;
  
  // Store current positions as starting point for transition
  previousPositions = [...positions];
  
  // Calculate target positions for the new shape
  targetPositions = new Array(positions.length);

  for (let i = 0; i < positions.length; i += 3) {
    const idx = i / 3;
    const progress = idx / (positions.length / 3);
    
    switch (templates[currentTemplate]) {
      case "sphere":
        const r = Math.random() * 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        targetPositions[i] = r * Math.sin(phi) * Math.cos(theta);
        targetPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
        targetPositions[i + 2] = r * Math.cos(phi);
        break;
        
      case "ring":
        const angle = Math.random() * Math.PI * 2;
        targetPositions[i] = Math.cos(angle) * 2;
        targetPositions[i + 1] = (Math.random() - 0.5) * 0.2;
        targetPositions[i + 2] = Math.sin(angle) * 2;
        break;
        
      case "heart":
        const t = Math.random() * Math.PI * 2;
        targetPositions[i] = 0.8 * Math.pow(Math.sin(t), 3);
        targetPositions[i + 1] = 0.6 * (Math.cos(t) - Math.cos(2 * t) / 2);
        targetPositions[i + 2] = (Math.random() - 0.5) * 0.2;
        break;
        
      case "spiral":
        const spiralT = progress * Math.PI * 8;
        const spiralR = progress * 2;
        targetPositions[i] = spiralR * Math.cos(spiralT);
        targetPositions[i + 1] = (progress - 0.5) * 2;
        targetPositions[i + 2] = spiralR * Math.sin(spiralT);
        break;
        
      case "cube":
        const cubeSize = 1.5;
        const face = Math.floor(Math.random() * 6);
        const u = (Math.random() - 0.5) * cubeSize;
        const v = (Math.random() - 0.5) * cubeSize;
        
        switch (face) {
          case 0: targetPositions[i] = u; targetPositions[i + 1] = v; targetPositions[i + 2] = cubeSize; break;
          case 1: targetPositions[i] = u; targetPositions[i + 1] = v; targetPositions[i + 2] = -cubeSize; break;
          case 2: targetPositions[i] = u; targetPositions[i + 1] = cubeSize; targetPositions[i + 2] = v; break;
          case 3: targetPositions[i] = u; targetPositions[i + 1] = -cubeSize; targetPositions[i + 2] = v; break;
          case 4: targetPositions[i] = cubeSize; targetPositions[i + 1] = u; targetPositions[i + 2] = v; break;
          case 5: targetPositions[i] = -cubeSize; targetPositions[i + 1] = u; targetPositions[i + 2] = v; break;
        }
        break;
        
      case "wave":
        const waveX = (progress - 0.5) * 4;
        const waveZ = Math.sin(waveX * 2) * 1.5;
        targetPositions[i] = waveX;
        targetPositions[i + 1] = (Math.random() - 0.5) * 0.5;
        targetPositions[i + 2] = waveZ;
        break;
        
      case "torus":
        const torusT = Math.random() * Math.PI * 2;
        const torusP = Math.random() * Math.PI * 2;
        const torusR = 1.5;
        const torusR2 = 0.5;
        targetPositions[i] = (torusR + torusR2 * Math.cos(torusP)) * Math.cos(torusT);
        targetPositions[i + 1] = torusR2 * Math.sin(torusP);
        targetPositions[i + 2] = (torusR + torusR2 * Math.cos(torusP)) * Math.sin(torusT);
        break;
        
      case "star":
        const starT = Math.random() * Math.PI * 2;
        const starR = 1 + 0.5 * Math.sin(starT * 5);
        targetPositions[i] = starR * Math.cos(starT);
        targetPositions[i + 1] = (Math.random() - 0.5) * 0.3;
        targetPositions[i + 2] = starR * Math.sin(starT);
        break;
    }
  }
  
  // Start the transition
  transitionProgress = 0;
  isTransitioning = true;
  
  // Add visual feedback for shape change
  if (material) {
    material.size = 0.1; // Temporarily increase size during transition
    setTimeout(() => {
      if (material) material.size = 0.03;
    }, 500);
  }
}

export function getCurrentShapeName() {
  return currentShapeName;
}
