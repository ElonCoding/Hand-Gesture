class DynamicBackgroundUI {
  constructor(dynamicBackground) {
    this.dynamicBackground = dynamicBackground;
    this.container = null;
    this.isVisible = false;
    this.createUI();
  }
  
  createUI() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'dynamic-background-ui';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      width: 280px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: none;
      z-index: 1000;
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    // Create title
    const title = document.createElement('h3');
    title.textContent = '🌌 Dynamic Background Controls';
    title.style.cssText = `
      margin: 0 0 15px 0;
      font-size: 14px;
      color: #4ecdc4;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 10px;
    `;
    this.container.appendChild(title);
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.onclick = () => this.hide();
    this.container.appendChild(closeBtn);
    
    // Create controls sections
    this.createPerformanceControls();
    this.createParticleControls();
    this.createColorControls();
    this.createRingControls();
    this.createStatsDisplay();
    
    document.body.appendChild(this.container);
    
    // Add toggle hotkey
    document.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        this.toggle();
      }
    });
  }
  
  createPerformanceControls() {
    const section = this.createSection('Performance');
    
    // Performance mode dropdown
    const modeLabel = document.createElement('label');
    modeLabel.textContent = 'Quality Mode:';
    modeLabel.style.cssText = 'display: block; margin-bottom: 5px;';
    section.appendChild(modeLabel);
    
    const modeSelect = document.createElement('select');
    modeSelect.style.cssText = `
      width: 100%;
      padding: 5px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      margin-bottom: 10px;
    `;
    
    const modes = ['auto', 'low', 'medium', 'high'];
    modes.forEach(mode => {
      const option = document.createElement('option');
      option.value = mode;
      option.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
      if (mode === this.dynamicBackground.config.performanceMode) {
        option.selected = true;
      }
      modeSelect.appendChild(option);
    });
    
    modeSelect.onchange = (e) => {
      this.dynamicBackground.setPerformanceMode(e.target.value);
      this.updateStats();
    };
    
    section.appendChild(modeSelect);
    
    // Target FPS slider
    const fpsLabel = document.createElement('label');
    fpsLabel.textContent = 'Target FPS:';
    fpsLabel.style.cssText = 'display: block; margin-bottom: 5px;';
    section.appendChild(fpsLabel);
    
    const fpsSlider = this.createSlider(30, 120, this.dynamicBackground.config.targetFPS, 5, (value) => {
      this.dynamicBackground.config.targetFPS = value;
      this.updateStats();
    });
    section.appendChild(fpsSlider);
    
    this.container.appendChild(section);
  }
  
  createParticleControls() {
    const section = this.createSection('Particles');
    
    // Particle density slider
    const densityLabel = document.createElement('label');
    densityLabel.textContent = 'Particle Density:';
    densityLabel.style.cssText = 'display: block; margin-bottom: 5px;';
    section.appendChild(densityLabel);
    
    const densitySlider = this.createSlider(100, 2000, this.dynamicBackground.config.particleCount, 50, (value) => {
      this.dynamicBackground.setParticleDensity(value);
      this.updateStats();
    });
    section.appendChild(densitySlider);
    
    // Particle size slider
    const sizeLabel = document.createElement('label');
    sizeLabel.textContent = 'Particle Size:';
    sizeLabel.style.cssText = 'display: block; margin-bottom: 5px;';
    section.appendChild(sizeLabel);
    
    const sizeSlider = this.createSlider(0.005, 0.1, this.dynamicBackground.config.particleSize, 0.005, (value) => {
      this.dynamicBackground.config.particleSize = value;
      this.dynamicBackground.recreateParticleSystem();
    });
    section.appendChild(sizeSlider);
    
    // Transformation speed slider
    const transformLabel = document.createElement('label');
    transformLabel.textContent = 'Transformation Speed:';
    transformLabel.style.cssText = 'display: block; margin-bottom: 5px;';
    section.appendChild(transformLabel);
    
    const transformSlider = this.createSlider(0.5, 10, this.dynamicBackground.config.transformationSpeed, 0.5, (value) => {
      this.dynamicBackground.setTransformationSpeed(value);
    });
    section.appendChild(transformSlider);
    
    this.container.appendChild(section);
  }
  
  createColorControls() {
    const section = this.createSection('Colors');
    
    // Color palette dropdown
    const paletteLabel = document.createElement('label');
    paletteLabel.textContent = 'Color Palette:';
    paletteLabel.style.cssText = 'display: block; margin-bottom: 5px;';
    section.appendChild(paletteLabel);
    
    const paletteSelect = document.createElement('select');
    paletteSelect.style.cssText = `
      width: 100%;
      padding: 5px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      margin-bottom: 10px;
    `;
    
    const palettes = Object.keys(this.dynamicBackground.config.colorPalettes);
    palettes.forEach(palette => {
      const option = document.createElement('option');
      option.value = palette;
      option.textContent = palette.charAt(0).toUpperCase() + palette.slice(1);
      if (palette === this.dynamicBackground.config.currentPalette) {
        option.selected = true;
      }
      paletteSelect.appendChild(option);
    });
    
    paletteSelect.onchange = (e) => {
      this.dynamicBackground.setColorPalette(e.target.value);
    };
    
    section.appendChild(paletteSelect);
    
    // Color transition speed slider
    const transitionLabel = document.createElement('label');
    transitionLabel.textContent = 'Color Transition Speed:';
    transitionLabel.style.cssText = 'display: block; margin-bottom: 5px;';
    section.appendChild(transitionLabel);
    
    const transitionSlider = this.createSlider(1, 10, this.dynamicBackground.config.colorTransitionSpeed, 0.5, (value) => {
      this.dynamicBackground.config.colorTransitionSpeed = value;
    });
    section.appendChild(transitionSlider);
    
    this.container.appendChild(section);
  }
  
  createRingControls() {
    const section = this.createSection('Saturn Rings');
    
    // Ring count slider
    const countLabel = document.createElement('label');
    countLabel.textContent = 'Ring Count:';
    countLabel.style.cssText = 'display: block; margin-bottom: 5px;';
    section.appendChild(countLabel);
    
    const countSlider = this.createSlider(1, 10, this.dynamicBackground.config.ringCount, 1, (value) => {
      this.dynamicBackground.config.ringCount = value;
      // Recreate rings with new count
      this.dynamicBackground.ringGroup.clear();
      this.dynamicBackground.rings = [];
      this.dynamicBackground.createSaturnRings();
    });
    section.appendChild(countSlider);
    
    // Ring opacity slider
    const opacityLabel = document.createElement('label');
    opacityLabel.textContent = 'Ring Opacity:';
    opacityLabel.style.cssText = 'display: block; margin-bottom: 5px;';
    section.appendChild(opacityLabel);
    
    const opacitySlider = this.createSlider(0.1, 1, 0.6, 0.1, (value) => {
      this.dynamicBackground.rings.forEach(ring => {
        ring.material.uniforms.opacity.value = value;
      });
    });
    section.appendChild(opacitySlider);
    
    this.container.appendChild(section);
  }
  
  createStatsDisplay() {
    const section = this.createSection('Statistics');
    
    this.statsDisplay = document.createElement('div');
    this.statsDisplay.style.cssText = `
      font-family: monospace;
      font-size: 10px;
      line-height: 1.4;
      background: rgba(0, 0, 0, 0.3);
      padding: 8px;
      border-radius: 4px;
    `;
    
    section.appendChild(this.statsDisplay);
    this.container.appendChild(section);
    
    this.updateStats();
  }
  
  createSection(title) {
    const section = document.createElement('div');
    section.style.cssText = 'margin-bottom: 15px;';
    
    const header = document.createElement('h4');
    header.textContent = title;
    header.style.cssText = `
      margin: 0 0 10px 0;
      font-size: 12px;
      color: #96ceb4;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 5px;
    `;
    section.appendChild(header);
    
    return section;
  }
  
  createSlider(min, max, value, step, onChange) {
    const container = document.createElement('div');
    container.style.cssText = 'margin-bottom: 10px;';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;
    slider.style.cssText = `
      width: 100%;
      margin-bottom: 5px;
    `;
    
    const valueDisplay = document.createElement('div');
    valueDisplay.textContent = value;
    valueDisplay.style.cssText = `
      text-align: center;
      font-size: 10px;
      color: #ccc;
    `;
    
    slider.oninput = (e) => {
      const val = parseFloat(e.target.value);
      valueDisplay.textContent = val;
      onChange(val);
    };
    
    container.appendChild(slider);
    container.appendChild(valueDisplay);
    
    return container;
  }
  
  updateStats() {
    if (!this.statsDisplay) return;
    
    const stats = this.dynamicBackground.getPerformanceStats();
    const config = this.dynamicBackground.config;
    
    this.statsDisplay.innerHTML = `
      <div>FPS: ${stats.fps}</div>
      <div>Particles: ${config.particleCount}</div>
      <div>Quality: ${config.performanceMode.toUpperCase()}</div>
      <div>Palette: ${config.currentPalette.toUpperCase()}</div>
      <div>Rings: ${config.ringCount}</div>
      <div>Adaptive: ${stats.adaptiveQuality ? 'ON' : 'OFF'}</div>
    `;
  }
  
  show() {
    this.container.style.display = 'block';
    this.isVisible = true;
    this.updateStats();
  }
  
  hide() {
    this.container.style.display = 'none';
    this.isVisible = false;
  }
  
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}

export { DynamicBackgroundUI };