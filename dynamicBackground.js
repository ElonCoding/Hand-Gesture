class DynamicBackground {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.particles = [];
    this.rings = [];
    this.backgroundGroup = new THREE.Group();
    this.particleGroup = new THREE.Group();
    this.ringGroup = new THREE.Group();
    
    // Configuration
    this.config = {
      particleCount: 800,
      particleSize: 0.02,
      particleSpeed: 0.5,
      transformationSpeed: 2.0,
      colorTransitionSpeed: 3.0,
      ringCount: 5,
      ringRadius: [3, 4, 5, 6, 7],
      ringThickness: [0.1, 0.08, 0.06, 0.04, 0.02],
      performanceMode: 'auto', // auto, high, medium, low
      targetFPS: 60,
      colorPalettes: {
        cosmic: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'],
        nebula: ['#a29bfe', '#fd79a8', '#fdcb6e', '#6c5ce7', '#74b9ff'],
        aurora: ['#00b894', '#00cec9', '#55efc4', '#81ecec', '#74b9ff'],
        sunset: ['#fd79a8', '#fdcb6e', '#e17055', '#d63031', '#a29bfe']
      },
      currentPalette: 'cosmic'
    };
    
    // Performance monitoring
    this.performance = {
      lastFrameTime: performance.now(),
      frameCount: 0,
      currentFPS: 60,
      adaptiveQuality: true
    };
    
    this.init();
  }
  
  init() {
    this.setupBackground();
    this.createParticleSystem();
    this.createSaturnRings();
    this.setupPerformanceMonitoring();
    
    this.scene.add(this.backgroundGroup);
    this.scene.add(this.particleGroup);
    this.scene.add(this.ringGroup);
  }
  
  setupBackground() {
    // Create pure black background
    const bgGeometry = new THREE.PlaneGeometry(100, 100);
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: false
    });
    
    const background = new THREE.Mesh(bgGeometry, bgMaterial);
    background.position.z = -50;
    this.backgroundGroup.add(background);
  }
  
  createParticleSystem() {
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.config.particleCount * 3);
    const colors = new Float32Array(this.config.particleCount * 3);
    const sizes = new Float32Array(this.config.particleCount);
    const shapes = new Float32Array(this.config.particleCount);
    const velocities = new Float32Array(this.config.particleCount * 3);
    const rotationSpeeds = new Float32Array(this.config.particleCount);
    
    const palette = this.config.colorPalettes[this.config.currentPalette];
    
    for (let i = 0; i < this.config.particleCount; i++) {
      // Random position within a sphere
      const radius = Math.random() * 15 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Random color from palette
      const colorIndex = Math.floor(Math.random() * palette.length);
      const color = new THREE.Color(palette[colorIndex]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Random size
      sizes[i] = Math.random() * this.config.particleSize + this.config.particleSize * 0.5;
      
      // Random shape (0=circle, 1=triangle, 2=square)
      shapes[i] = Math.floor(Math.random() * 3);
      
      // Random velocity
      velocities[i * 3] = (Math.random() - 0.5) * this.config.particleSpeed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * this.config.particleSpeed;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * this.config.particleSpeed;
      
      // Random rotation speed
      rotationSpeeds[i] = (Math.random() - 0.5) * 0.02;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute('shape', new THREE.BufferAttribute(shapes, 1));
    particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    particleGeometry.setAttribute('rotationSpeed', new THREE.BufferAttribute(rotationSpeeds, 1));
    
    // Create custom shader material for morphing shapes
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        transformationProgress: { value: 0 },
        targetShape: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute float shape;
        attribute vec3 velocity;
        attribute float rotationSpeed;
        attribute vec3 color;
        
        varying vec3 vColor;
        varying float vShape;
        varying float vRotation;
        
        uniform float time;
        uniform float transformationProgress;
        uniform float targetShape;
        
        void main() {
          vColor = color;
          vShape = shape;
          vRotation = rotationSpeed * time;
          
          vec3 pos = position;
          
          // Apply velocity-based movement
          pos += velocity * time * 0.1;
          
          // Apply orbital motion for floating effect
          pos.x += sin(time * 0.5 + position.x) * 0.1;
          pos.y += cos(time * 0.3 + position.y) * 0.1;
          pos.z += sin(time * 0.7 + position.z) * 0.05;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vShape;
        varying float vRotation;
        
        uniform float transformationProgress;
        uniform float targetShape;
        
        float circle(vec2 coord, float radius) {
          return 1.0 - smoothstep(radius - 0.01, radius + 0.01, length(coord));
        }
        
        float triangle(vec2 coord, float size) {
          vec2 centered = coord * 2.0 - 1.0;
          float edge1 = step(centered.y, -centered.x * 0.866 + 0.5);
          float edge2 = step(centered.y, centered.x * 0.866 + 0.5);
          float edge3 = step(centered.y, -0.5);
          return edge1 * edge2 * edge3;
        }
        
        float square(vec2 coord, float size) {
          vec2 centered = abs(coord * 2.0 - 1.0);
          return step(max(centered.x, centered.y), 0.7);
        }
        
        void main() {
          vec2 coord = gl_PointCoord;
          
          // Apply rotation
          float s = sin(vRotation);
          float c = cos(vRotation);
          coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);
          
          float shapeMask = 0.0;
          
          // Morph between shapes based on transformation progress
          float currentShape = mix(vShape, targetShape, transformationProgress);
          
          if (currentShape < 0.5) {
            shapeMask = circle(coord, 0.5);
          } else if (currentShape < 1.5) {
            shapeMask = triangle(coord, 0.5);
          } else {
            shapeMask = square(coord, 0.5);
          }
          
          // Soft edges
          shapeMask *= smoothstep(0.0, 0.5, 1.0 - length(coord - 0.5));
          
          if (shapeMask < 0.1) discard;
          
          gl_FragColor = vec4(vColor, shapeMask * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.particleGroup.add(this.particleSystem);
    
    // Store particle data for updates
    this.particleData = {
      positions,
      colors,
      sizes,
      shapes,
      velocities,
      rotationSpeeds
    };
  }
  
  createSaturnRings() {
    const palette = this.config.colorPalettes[this.config.currentPalette];
    
    for (let i = 0; i < this.config.ringCount; i++) {
      const radius = this.config.ringRadius[i];
      const thickness = this.config.ringThickness[i];
      
      // Create ring geometry
      const ringGeometry = new THREE.RingGeometry(
        radius - thickness,
        radius + thickness,
        64
      );
      
      // Create material with realistic shading
      const ringMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          innerRadius: { value: radius - thickness },
          outerRadius: { value: radius + thickness },
          color: { value: new THREE.Color(palette[i % palette.length]) },
          opacity: { value: 0.6 - i * 0.1 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform float innerRadius;
          uniform float outerRadius;
          uniform vec3 color;
          uniform float opacity;
          
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            float dist = length(vPosition.xy);
            float normalizedDist = (dist - innerRadius) / (outerRadius - innerRadius);
            
            // Create thickness variation
            float thickness = 1.0 - abs(normalizedDist - 0.5) * 2.0;
            thickness = pow(thickness, 2.0);
            
            // Add subtle animation
            float wave = sin(time * 0.5 + dist * 2.0) * 0.1 + 0.9;
            
            // Realistic shading
            vec3 finalColor = color * wave;
            float alpha = thickness * opacity * wave;
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.2;
      ring.rotation.z = Math.random() * Math.PI * 2;
      
      this.ringGroup.add(ring);
      this.rings.push({
        mesh: ring,
        material: ringMaterial,
        radius: radius,
        rotationSpeed: 0.001 + Math.random() * 0.002
      });
    }
    
    // Add orbiting particles around rings
    this.createOrbitingParticles();
  }
  
  createOrbitingParticles() {
    const orbitingGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(200 * 3);
    const colors = new Float32Array(200 * 3);
    
    const palette = this.config.colorPalettes[this.config.currentPalette];
    
    for (let i = 0; i < 200; i++) {
      // Position particles around rings
      const ringIndex = Math.floor(Math.random() * this.config.ringCount);
      const radius = this.config.ringRadius[ringIndex] + (Math.random() - 0.5) * 0.5;
      const angle = Math.random() * Math.PI * 2;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      const color = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    orbitingGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    orbitingGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const orbitingMaterial = new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    this.orbitingParticles = new THREE.Points(orbitingGeometry, orbitingMaterial);
    this.ringGroup.add(this.orbitingParticles);
  }
  
  setupPerformanceMonitoring() {
    this.performance.lastFrameTime = performance.now();
    this.performance.frameCount = 0;
    this.performance.currentFPS = 60;
  }
  
  update(deltaTime, gestureState) {
    const time = performance.now() * 0.001;
    
    // Update performance monitoring
    this.updatePerformance(deltaTime);
    
    // Skip updates if in low quality mode
    if (this.performance.updateInterval > 1 && this.performance.frameCount % this.performance.updateInterval !== 0) {
      return;
    }
    
    // Update particle system
    this.updateParticles(time, gestureState);
    
    // Update Saturn rings
    this.updateRings(time);
    
    // Update orbiting particles
    this.updateOrbitingParticles(time);
    
    // Handle shape transformations based on gesture state
    this.handleShapeTransformations(gestureState);
  }
  
  updatePerformance(deltaTime) {
    this.performance.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.performance.lastFrameTime >= 1000) {
      this.performance.currentFPS = Math.round(
        (this.performance.frameCount * 1000) / (currentTime - this.performance.lastFrameTime)
      );
      
      // Adaptive quality based on FPS
      if (this.config.performanceMode === 'auto' && this.performance.adaptiveQuality) {
        this.adaptQuality();
      }
      
      this.performance.frameCount = 0;
      this.performance.lastFrameTime = currentTime;
    }
  }
  
  adaptQuality() {
    const fps = this.performance.currentFPS;
    
    if (fps < 30 && this.config.particleCount > 200) {
      this.reduceQuality();
    } else if (fps > 55 && this.config.particleCount < 1200) {
      this.increaseQuality();
    }
    
    // Adjust update frequency based on FPS
    if (fps < 25) {
      this.performance.updateInterval = 2; // Update every 2nd frame
    } else if (fps < 40) {
      this.performance.updateInterval = 1; // Update every frame but reduce complexity
      this.reduceComplexity();
    } else {
      this.performance.updateInterval = 1;
      this.restoreComplexity();
    }
  }
  
  reduceComplexity() {
    // Reduce shader complexity
    if (this.particleSystem && this.particleSystem.material) {
      this.particleSystem.material.defines.LOW_QUALITY = true;
      this.particleSystem.material.needsUpdate = true;
    }
    
    // Reduce ring update frequency
    this.rings.forEach(ring => {
      ring.lowQualityUpdate = true;
    });
  }
  
  restoreComplexity() {
    // Restore shader complexity
    if (this.particleSystem && this.particleSystem.material) {
      delete this.particleSystem.material.defines.LOW_QUALITY;
      this.particleSystem.material.needsUpdate = true;
    }
    
    // Restore ring update frequency
    this.rings.forEach(ring => {
      ring.lowQualityUpdate = false;
    });
  }
  
  reduceQuality() {
    this.config.particleCount = Math.max(200, this.config.particleCount - 100);
    this.recreateParticleSystem();
  }
  
  increaseQuality() {
    this.config.particleCount = Math.min(1200, this.config.particleCount + 50);
    this.recreateParticleSystem();
  }
  
  recreateParticleSystem() {
    // Remove existing particle system
    this.particleGroup.remove(this.particleSystem);
    
    // Recreate with new particle count
    this.createParticleSystem();
  }
  
  updateParticles(time, gestureState) {
    if (!this.particleSystem) return;
    
    const material = this.particleSystem.material;
    material.uniforms.time.value = time;
    
    // Update particle positions based on velocities
    const positions = this.particleData.positions;
    const velocities = this.particleData.velocities;
    
    for (let i = 0; i < this.config.particleCount; i++) {
      // Apply velocity
      positions[i * 3] += velocities[i * 3] * 0.016;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * 0.016;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.016;
      
      // Boundary wrapping
      const boundary = 20;
      if (Math.abs(positions[i * 3]) > boundary) {
        positions[i * 3] = -Math.sign(positions[i * 3]) * boundary;
      }
      if (Math.abs(positions[i * 3 + 1]) > boundary) {
        positions[i * 3 + 1] = -Math.sign(positions[i * 3 + 1]) * boundary;
      }
      if (Math.abs(positions[i * 3 + 2]) > boundary) {
        positions[i * 3 + 2] = -Math.sign(positions[i * 3 + 2]) * boundary;
      }
    }
    
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
  }
  
  updateRings(time) {
    this.rings.forEach((ring, index) => {
      if (!ring.lowQualityUpdate || this.performance.frameCount % 3 === 0) {
        ring.material.uniforms.time.value = time;
        ring.mesh.rotation.z += ring.rotationSpeed;
      }
    });
  }
  
  updateOrbitingParticles(time) {
    if (!this.orbitingParticles) return;
    
    const positions = this.orbitingParticles.geometry.attributes.position.array;
    
    for (let i = 0; i < 200; i++) {
      const angle = time * 0.5 + i * 0.1;
      const radius = 4 + (i % 5) * 1;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    
    this.orbitingParticles.geometry.attributes.position.needsUpdate = true;
  }
  
  handleShapeTransformations(gestureState) {
    if (!gestureState || gestureState.gestureType === 'none') return;
    
    const material = this.particleSystem.material;
    
    // Trigger shape transformation on pinch
    if (gestureState.pinch) {
      material.uniforms.transformationProgress.value = 
        Math.min(1.0, material.uniforms.transformationProgress.value + this.config.transformationSpeed * 0.016);
      
      // Cycle through shapes
      if (material.uniforms.transformationProgress.value >= 1.0) {
        material.uniforms.targetShape.value = (material.uniforms.targetShape.value + 1) % 3;
        material.uniforms.transformationProgress.value = 0;
        
        // Update colors during transformation
        this.updateParticleColors();
      }
    }
  }
  
  updateParticleColors() {
    const colors = this.particleData.colors;
    const palette = this.config.colorPalettes[this.config.currentPalette];
    
    for (let i = 0; i < this.config.particleCount; i++) {
      const colorIndex = Math.floor(Math.random() * palette.length);
      const color = new THREE.Color(palette[colorIndex]);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    this.particleSystem.geometry.attributes.color.needsUpdate = true;
  }
  
  // Public API methods
  setColorPalette(paletteName) {
    if (this.config.colorPalettes[paletteName]) {
      this.config.currentPalette = paletteName;
      this.updateParticleColors();
      this.updateRingColors();
    }
  }
  
  updateRingColors() {
    const palette = this.config.colorPalettes[this.config.currentPalette];
    this.rings.forEach((ring, index) => {
      ring.material.uniforms.color.value = new THREE.Color(palette[index % palette.length]);
    });
  }
  
  setParticleDensity(density) {
    this.config.particleCount = Math.max(100, Math.min(2000, density));
    this.recreateParticleSystem();
  }
  
  setTransformationSpeed(speed) {
    this.config.transformationSpeed = Math.max(0.1, Math.min(10, speed));
  }
  
  setPerformanceMode(mode) {
    this.config.performanceMode = mode;
    
    switch (mode) {
      case 'low':
        this.config.particleCount = 200;
        this.adaptiveQuality = false;
        break;
      case 'medium':
        this.config.particleCount = 500;
        this.adaptiveQuality = true;
        break;
      case 'high':
        this.config.particleCount = 1000;
        this.adaptiveQuality = false;
        break;
      case 'auto':
        this.adaptiveQuality = true;
        break;
    }
    
    this.recreateParticleSystem();
  }
  
  getPerformanceStats() {
    return {
      fps: this.performance.currentFPS,
      particleCount: this.config.particleCount,
      performanceMode: this.config.performanceMode,
      adaptiveQuality: this.performance.adaptiveQuality
    };
  }
  
  dispose() {
    this.scene.remove(this.backgroundGroup);
    this.scene.remove(this.particleGroup);
    this.scene.remove(this.ringGroup);
    
    // Dispose of geometries and materials
    this.particleSystem.geometry.dispose();
    this.particleSystem.material.dispose();
    
    this.rings.forEach(ring => {
      ring.mesh.geometry.dispose();
      ring.material.dispose();
    });
    
    if (this.orbitingParticles) {
      this.orbitingParticles.geometry.dispose();
      this.orbitingParticles.material.dispose();
    }
  }
}

export { DynamicBackground };