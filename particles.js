// Enhanced Particle System with Performance Optimizations
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
let animationFrame = 0;
let lastPinchTime = 0;
let pinchChargeLevel = 0;
let isPinchingLastFrame = false;
let shapeSwitchBurst = 0; // For burst effect on shape switch

// Performance optimizer - optimized for 5000 particles
let performanceOptimizer = {
  lastUpdate: 0,
  updateInterval: 16, // ~60fps
  particleCount: 5000, // Increased to 5000 particles
  useInstancedRendering: false,
  quality: 'high',
  batchSize: 1000, // Process particles in batches for better performance
  useWorker: false // Disable workers for simplicity
};

// Easing function for smooth transitions
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Templates and cache
const templates = ["sphere", "heart", "ring", "spiral", "cube", "wave", "torus", "star"];
const shapeCache = new Map();

// Visual effects
let colorThemes = {
  cosmic: { hue: 0.8, saturation: 1.0, lightness: 0.6 },
  neon: { hue: 0.9, saturation: 1.0, lightness: 0.7 },
  ocean: { hue: 0.6, saturation: 0.8, lightness: 0.5 },
  fire: { hue: 0.05, saturation: 1.0, lightness: 0.6 },
  forest: { hue: 0.3, saturation: 0.7, lightness: 0.4 }
};
let currentTheme = 'cosmic';
let advancedEffects = { pulse: true };

// Initialize particles
export function initParticles(scene) {
  if (typeof THREE === 'undefined') {
    console.error('THREE.js is not loaded. Please ensure Three.js is loaded via CDN.');
    return null;
  }
  
  const count = performanceOptimizer.particleCount;
  
  // Initialize geometry and attributes
  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const velocities = new Float32Array(count * 3);
  
  // Initialize particles with random positions
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 2;
    positions[i3 + 1] = (Math.random() - 0.5) * 2;
    positions[i3 + 2] = (Math.random() - 0.5) * 2;
    
    colors[i3] = Math.random();
    colors[i3 + 1] = Math.random();
    colors[i3 + 2] = Math.random();
    
    sizes[i] = Math.random() * 0.02 + 0.01;
    velocities[i3] = 0;
    velocities[i3 + 1] = 0;
    velocities[i3 + 2] = 0;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // Create material
  material = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });
  
  // Create particle system
  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
  
  // Pre-cache shape data for performance
  cacheShapeData(count);
  
  return particleSystem;
}

// Cache shape positions for better performance - optimized for 5000 particles
function cacheShapeData(count) {
  for (const template of templates) {
    const positions = [];
    
    // Pre-calculate common values for optimization
    const invCount = 1 / count;
    const twoPi = Math.PI * 2;
    
    for (let i = 0; i < count; i++) {
      const progress = i * invCount;
      let x, y, z;
      
      switch (template) {
        case "sphere":
          // Optimized sphere calculation
          const phi = Math.random() * twoPi;
          const theta = Math.random() * Math.PI;
          const sinTheta = Math.sin(theta);
          const radius = 1.5;
          x = radius * sinTheta * Math.cos(phi);
          y = radius * sinTheta * Math.sin(phi);
          z = radius * Math.cos(theta);
          break;
          
        case "heart":
          // Optimized heart calculation
          const t = progress * twoPi;
          const sinT = Math.sin(t);
          const cosT = Math.cos(t);
          const cos2T = Math.cos(2 * t);
          const cos3T = Math.cos(3 * t);
          const cos4T = Math.cos(4 * t);
          x = 16 * sinT * sinT * sinT;
          y = 13 * cosT - 5 * cos2T - 2 * cos3T - cos4T;
          z = (Math.random() - 0.5) * 0.5;
          x *= 0.1;
          y *= 0.1;
          break;
          
        case "ring":
          // Optimized ring calculation
          const ringAngle = progress * twoPi;
          const ringRadius = 1.5;
          const cosRing = Math.cos(ringAngle);
          const sinRing = Math.sin(ringAngle);
          x = ringRadius * cosRing;
          y = ringRadius * sinRing;
          z = 0;
          break;
          
        case "spiral":
          // Optimized spiral calculation
          const spiralT = progress * twoPi * 2; // * 4 / 2
          const spiralRadius = progress * 2;
          const cosSpiral = Math.cos(spiralT);
          const sinSpiral = Math.sin(spiralT);
          x = spiralRadius * cosSpiral;
          y = (progress - 0.5) * 3;
          z = spiralRadius * sinSpiral;
          break;
          
        case "cube":
          // Optimized cube calculation
          const cubeSize = 1.5;
          const face = Math.floor(Math.random() * 6);
          const u = (Math.random() - 0.5) * cubeSize;
          const v = (Math.random() - 0.5) * cubeSize;
          
          // Optimized face assignment
          if (face === 0) { x = u; y = v; z = cubeSize; }
          else if (face === 1) { x = u; y = v; z = -cubeSize; }
          else if (face === 2) { x = u; y = cubeSize; z = v; }
          else if (face === 3) { x = u; y = -cubeSize; z = v; }
          else if (face === 4) { x = cubeSize; y = u; z = v; }
          else { x = -cubeSize; y = u; z = v; }
          break;
          
        case "wave":
          // Optimized wave calculation
          const waveX = (progress - 0.5) * 4;
          const waveZ = Math.sin(waveX * 2) * 1.5;
          x = waveX;
          y = (Math.random() - 0.5) * 0.5;
          z = waveZ;
          break;
          
        case "torus":
          // Optimized torus calculation
          const torusT = Math.random() * twoPi;
          const torusP = Math.random() * twoPi;
          const torusR = 1.5;
          const torusR2 = 0.5;
          const cosTorusP = Math.cos(torusP);
          const sinTorusP = Math.sin(torusP);
          const cosTorusT = Math.cos(torusT);
          const sinTorusT = Math.sin(torusT);
          x = (torusR + torusR2 * cosTorusP) * cosTorusT;
          y = torusR2 * sinTorusP;
          z = (torusR + torusR2 * cosTorusP) * sinTorusT;
          break;
          
        case "star":
          // Optimized star calculation
          const starT = Math.random() * twoPi;
          const starR = 1 + 0.5 * Math.sin(starT * 5);
          const cosStar = Math.cos(starT);
          const sinStar = Math.sin(starT);
          x = starR * cosStar;
          y = (Math.random() - 0.5) * 0.3;
          z = starR * sinStar;
          break;
      }
      
      positions.push({ x, y, z });
    }
    
    shapeCache.set(template, positions);
  }
}

// Update particles with gesture control
export function updateParticles(gestureState) {
  const currentTime = performance.now();
  
  // Performance optimization: limit update frequency
  if (currentTime - performanceOptimizer.lastUpdate < performanceOptimizer.updateInterval) {
    return;
  }
  
  performanceOptimizer.lastUpdate = currentTime;
  
  // Enhanced pinch detection with shape switching and charge effect
  if (gestureState.pinch && currentTime - lastPinchTime > 800) {
    // Build up charge level while pinching
    pinchChargeLevel = Math.min(1, pinchChargeLevel + 0.02);
    
    // Trigger shape switch when charge reaches threshold
    if (pinchChargeLevel >= 0.8 && !isPinchingLastFrame) {
      lastPinchTime = currentTime;
      switchTemplate();
      showPinchIndicator();
      shapeSwitchBurst = 1; // Trigger burst effect
      pinchChargeLevel = 0; // Reset charge
    }
    isPinchingLastFrame = true;
  } else {
    // Gradually decrease charge when not pinching
    pinchChargeLevel = Math.max(0, pinchChargeLevel - 0.01);
    isPinchingLastFrame = false;
  }
  
  // Update pinch meter visualization
  updatePinchMeter(pinchChargeLevel);
  
  // Gradually decrease burst effect
  if (shapeSwitchBurst > 0) {
    shapeSwitchBurst *= 0.95; // Decay burst effect
    if (shapeSwitchBurst < 0.01) shapeSwitchBurst = 0;
  }
  
  if (!particleSystem || !geometry) return;
  
  const time = currentTime * 0.001;
  const positions = geometry.attributes.position;
  const colors = geometry.attributes.color;
  const sizes = geometry.attributes.size;
  
  if (!positions || !colors || !sizes) return;
  
  const positionsArray = positions.array;
  const colorsArray = colors.array;
  const sizesArray = sizes.array;
  
  const { x: handX, y: handY } = gestureState.position;
  const openness = gestureState.openness || 0;
  const gestureType = gestureState.gestureType || 'none';
  
  // Handle smooth transitions
  if (isTransitioning) {
    transitionProgress += 0.015; // Smooth transition speed
    if (transitionProgress >= 1) {
      transitionProgress = 1;
      isTransitioning = false;
    }
  }
  
  // Pre-calculate common values for optimization
  const handInfluenceX = handX * 0.5;
  const handInfluenceY = handY * 0.5;
  const scale = 0.5 + openness * 1.5;
  const hasTransition = isTransitioning && previousPositions.length > 0 && targetPositions.length > 0;
  const easedProgress = hasTransition ? easeInOutCubic(transitionProgress) : 0;
  
  // Cache current template data
  const templateData = shapeCache.get(templates[currentTemplate]) || [];
  
  // Optimized particle update loop
  for (let i = 0; i < performanceOptimizer.particleCount; i++) {
    const i3 = i * 3;
    
    // Get cached shape position
    const shapePos = templateData[i] || { x: 0, y: 0, z: 0 };
    
    let targetX, targetY, targetZ;
    
    // Handle smooth transition interpolation
    if (hasTransition) {
      targetX = previousPositions[i3] + (targetPositions[i3] - previousPositions[i3]) * easedProgress;
      targetY = previousPositions[i3 + 1] + (targetPositions[i3 + 1] - previousPositions[i3 + 1]) * easedProgress;
      targetZ = previousPositions[i3 + 2] + (targetPositions[i3 + 2] - previousPositions[i3 + 2]) * easedProgress;
    } else {
      // Normal position (no transition)
      targetX = shapePos.x;
      targetY = shapePos.y;
      targetZ = shapePos.z;
    }
    
    // Update positions with shape and hand influence
    positionsArray[i3] = (targetX + handInfluenceX) * scale;
    positionsArray[i3 + 1] = (targetY + handInfluenceY) * scale;
    positionsArray[i3 + 2] = targetZ * scale;
    
    // Optimized color calculations - pre-calculate gesture effects
    const theme = colorThemes[currentTheme];
    let hue = theme.hue;
    let saturation = theme.saturation;
    let lightness = theme.lightness;
    
    // Pre-calculate gesture modifiers (outside loop for batch processing)
    switch (gestureType) {
      case 'fist':
        hue = (hue + 0.1) % 1;
        saturation = Math.min(1, saturation * 1.2);
        break;
      case 'pointing':
        hue = (hue + 0.3) % 1;
        lightness = Math.min(1, lightness * 1.3);
        break;
      case 'peace':
        hue = (hue + 0.6) % 1;
        saturation = Math.min(1, saturation * 0.8);
        break;
    }
    
    // Add time-based variation and openness
    hue = (hue + time * 0.1 + i * 0.01) % 1;
    saturation = Math.min(1, saturation + openness * 0.3);
    
    // Apply pulse effect
    if (advancedEffects.pulse) {
      lightness = Math.min(1, lightness + Math.sin(time * 3 + i * 0.1) * 0.2);
    }
    
    // Pinch effect
    if (gestureState.pinch) {
      saturation = Math.min(1, saturation * 1.5);
      lightness = Math.min(1, lightness * 1.3);
      hue = (hue + 0.15) % 1;
      
      if (pinchChargeLevel > 0) {
        const chargeIntensity = pinchChargeLevel * 0.5;
        lightness = Math.min(1, lightness + chargeIntensity);
        saturation = Math.min(1, saturation + chargeIntensity * 0.3);
      }
    }
    
    // Shape switch burst effect
    if (shapeSwitchBurst > 0) {
      const burstIntensity = shapeSwitchBurst * 0.8;
      lightness = Math.min(1, lightness + burstIntensity);
      saturation = Math.min(1, saturation + burstIntensity * 0.5);
      hue = (hue + shapeSwitchBurst * 0.3) % 1;
    }
    
    // Optimized color setting
    if (typeof THREE !== 'undefined' && THREE.Color) {
      colorsArray[i3] = hue * 0.95; // Approximate HSL to RGB conversion
      colorsArray[i3 + 1] = saturation * 0.8;
      colorsArray[i3 + 2] = lightness;
    }
    
    // Optimized size calculation
    let sizeMultiplier = 1;
    switch (gestureType) {
      case 'fist': sizeMultiplier = 0.7; break;
      case 'pointing': sizeMultiplier = 1.3; break;
      case 'peace': sizeMultiplier = 1.1; break;
    }
    
    sizesArray[i] = (0.02 + openness * 0.03 + Math.sin(time * 2 + i * 0.1) * 0.01) * sizeMultiplier;
    
    if (gestureState.pinch) {
      sizesArray[i] *= 1.2;
      if (pinchChargeLevel > 0) {
        sizesArray[i] *= (1 + pinchChargeLevel * 0.3);
      }
    }
    
    if (shapeSwitchBurst > 0) {
      sizesArray[i] *= (1 + shapeSwitchBurst * 0.5);
    }
    
    // Optimized boundary constraints - only check every 5th particle for performance
    if (i % 5 === 0) {
      const maxDistance = 3;
      const distance = Math.sqrt(
        positionsArray[i3] ** 2 + positionsArray[i3 + 1] ** 2 + positionsArray[i3 + 2] ** 2
      );
      
      if (distance > maxDistance) {
        const factor = maxDistance / distance;
        positionsArray[i3] *= factor;
        positionsArray[i3 + 1] *= factor;
        positionsArray[i3 + 2] *= factor;
      }
    }
  }
  
  // Batch update attributes for better performance
  if (animationFrame % 3 === 0) { // Update every 3rd frame for performance
    if (positions) positions.needsUpdate = true;
    if (colors) colors.needsUpdate = true;
    if (sizes) sizes.needsUpdate = true;
  }
  
  animationFrame++;
}

// Switch between shapes
export function switchTemplate() {
  if (switchCooldown) return;
  
  switchCooldown = true;
  setTimeout(() => (switchCooldown = false), 1200); // Extended cooldown for smooth transition

  // Store current positions as starting point for transition
  if (geometry && geometry.attributes && geometry.attributes.position) {
    const positions = geometry.attributes.position.array;
    previousPositions = [...positions];
  }
  
  currentTemplate = (currentTemplate + 1) % templates.length;
  updateShapeDisplay();
  
  // Get target positions for the new shape
  const templateData = shapeCache.get(templates[currentTemplate]) || [];
  targetPositions = [];
  for (let i = 0; i < performanceOptimizer.particleCount; i++) {
    const shapePos = templateData[i] || { x: 0, y: 0, z: 0 };
    targetPositions.push(shapePos.x, shapePos.y, shapePos.z);
  }
  
  transitionProgress = 0;
  isTransitioning = true;
}

// Update shape display
function updateShapeDisplay() {
  const shapeNames = ["Sphere", "Heart", "Ring", "Spiral", "Cube", "Wave", "Torus", "Star"];
  currentShapeName = shapeNames[currentTemplate];
  
  const shapeIndicator = document.getElementById('current-shape');
  const shapeIndicatorContainer = document.getElementById('shape-indicator');
  
  if (shapeIndicator) {
    shapeIndicator.textContent = currentShapeName;
    if (shapeIndicatorContainer) {
      shapeIndicatorContainer.classList.add('changing');
      setTimeout(() => {
        shapeIndicatorContainer.classList.remove('changing');
      }, 300);
    }
  }
}

// Update gesture display
export function updateGestureDisplay(gestureType, confidence, pinchState = null) {
  const gestureElement = document.getElementById('current-gesture');
  if (gestureElement) {
    const gestureNames = {
      'open_hand': 'Open Hand ✋',
      'fist': 'Fist ✊',
      'pointing': 'Pointing 👆',
      'peace': 'Peace ✌️',
      'three': 'Three 🤟',
      'none': 'No Gesture'
    };
    
    let displayText = `${gestureNames[gestureType] || gestureType} (${Math.round(confidence * 100)}%)`;
    if (pinchState) {
      displayText += pinchState.isPinched ? ' 📌' : '';
    }
    gestureElement.textContent = displayText;
  }
}

// Show pinch indicator
function showPinchIndicator() {
  const pinchIndicator = document.getElementById('pinch-indicator');
  if (pinchIndicator) {
    pinchIndicator.style.display = 'block';
    setTimeout(() => {
      pinchIndicator.style.display = 'none';
    }, 1500);
  }
}

// Update pinch meter
function updatePinchMeter(chargeLevel) {
  const pinchMeter = document.getElementById('pinch-meter');
  const pinchCharge = document.getElementById('pinch-charge');
  
  if (pinchMeter && pinchCharge) {
    if (chargeLevel > 0) {
      pinchMeter.style.display = 'block';
      pinchCharge.style.width = `${chargeLevel * 100}%`;
      
      // Change color based on charge level
      if (chargeLevel < 0.5) {
        pinchCharge.style.background = 'linear-gradient(90deg, #4caf50, #8bc34a)';
      } else if (chargeLevel < 0.8) {
        pinchCharge.style.background = 'linear-gradient(90deg, #ffeb3b, #ffc107)';
      } else {
        pinchCharge.style.background = 'linear-gradient(90deg, #ff9800, #f44336)';
      }
    } else {
      pinchMeter.style.display = 'none';
    }
  }
}

// Debug function for pinch calibration
export function updatePinchDebug(distance, threshold, confidence, isCustomThreshold = false) {
  const debugElement = document.getElementById('pinch-debug');
  if (debugElement) {
    const thresholdType = isCustomThreshold ? 'Custom' : 'Auto';
    debugElement.innerHTML = `
      Pinch Distance: ${(distance * 100).toFixed(1)}%<br>
      Threshold: ${(threshold * 100).toFixed(1)}% (${thresholdType})<br>
      Confidence: ${(confidence * 100).toFixed(0)}%
    `;
  }
}

// Performance control functions
export function setParticleCount(count) {
  performanceOptimizer.particleCount = Math.max(500, Math.min(5000, count));
}

export function setQuality(quality) {
  performanceOptimizer.quality = quality;
  switch(quality) {
    case 'low':
      performanceOptimizer.updateInterval = 32; // ~30fps
      performanceOptimizer.particleCount = 2000; // Reduced for performance
      break;
    case 'medium':
      performanceOptimizer.updateInterval = 24; // ~42fps
      performanceOptimizer.particleCount = 3500; // Medium particle count
      break;
    case 'high':
      performanceOptimizer.updateInterval = 16; // ~60fps
      performanceOptimizer.particleCount = 5000; // Full 5000 particles
      break;
  }
}

export function getPerformanceStats() {
  return {
    particleCount: performanceOptimizer.particleCount,
    quality: performanceOptimizer.quality,
    currentShape: currentShapeName,
    theme: currentTheme
  };
}

export function setColorTheme(theme) {
  if (colorThemes[theme]) {
    currentTheme = theme;
    return true;
  }
  return false;
}

export function getAvailableThemes() {
  return Object.keys(colorThemes);
}

export function toggleAdvancedEffect(effect, enabled) {
  if (advancedEffects.hasOwnProperty(effect)) {
    advancedEffects[effect] = enabled;
    return true;
  }
  return false;
}

export function getCurrentShapeName() {
  return currentShapeName;
}