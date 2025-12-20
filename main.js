import { 
  initParticles, 
  updateParticles, 
  switchTemplate, 
  getCurrentShapeName, 
  setQuality, 
  getPerformanceStats,
  updateGestureDisplay,
  setColorTheme,
  getAvailableThemes,
  toggleAdvancedEffect,
  updatePinchDebug
} from "./particles.js";
import { initHandTracking } from "./gestures.js";
import { DynamicBackground } from "./dynamicBackground.js";
import { DynamicBackgroundUI } from "./dynamicBackgroundUI.js";

let scene, camera, renderer;
let gestureState = {
  pinch: false,
  openness: 0,
  position: { x: 0, y: 0 },
  gestureType: 'none',
  gestureConfidence: 0,
  handVelocity: { x: 0, y: 0 },
  fingerStates: {}
};

let statusElement;
let performanceStats;
let frameCount = 0;
let lastFrameTime = performance.now();
let advancedEffects = {
  pulse: true
};
let dynamicBackground;
let dynamicBackgroundUI;

// Enhanced initialization
init();
animate();

function init() {
  statusElement = document.getElementById('status');
  
  try {
    scene = new THREE.Scene();
    
    // Pure black background
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const canvas = document.getElementById("three-canvas");
    if (!canvas) {
      throw new Error("Canvas element not found");
    }

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

    // Add ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // Initialize dynamic background system
    dynamicBackground = new DynamicBackground(scene, renderer);
    dynamicBackgroundUI = new DynamicBackgroundUI(dynamicBackground);
    
    initParticles(scene);
    
    // Initialize hand tracking with status updates
    initHandTracking(gestureState);
    
    // Add performance controls
    setupPerformanceControls();
    
    updateStatus('System ready! Allow camera access to start.');

    window.addEventListener("resize", onResize);
    
  } catch (error) {
    updateStatus('Error: ' + error.message);
    console.error('Initialization error:', error);
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (renderer && scene && camera) {
    try {
      const deltaTime = 0.016; // ~60fps
      
      // Update dynamic background
      if (dynamicBackground) {
        dynamicBackground.update(deltaTime, gestureState);
      }
      
      updateParticles(gestureState);
      renderer.render(scene, camera);

      // Update gesture display
      updateGestureDisplay(gestureState.gestureType, gestureState.gestureConfidence, { isPinched: gestureState.pinch });
      
      // Update pinch debug info
      if (gestureState.pinchDetails && gestureState.pinchDetails.distance > 0) {
        const { distance, threshold, confidence, isCustomThreshold } = gestureState.pinchDetails;
        updatePinchDebug(distance, threshold, confidence, isCustomThreshold);
        
        // Show persistent calibration indicator when custom threshold is active
        if (isCustomThreshold) {
          const calibrationStatus = document.getElementById('calibration-status');
          if (calibrationStatus) {
            calibrationStatus.style.display = 'block';
            calibrationStatus.textContent = '📏 Custom Threshold';
          }
        }
      }
      
      // Show pinch tutorial on first hand detection
      if (gestureState.gestureType !== 'none' && !window.pinchTutorialShown) {
        const tutorialElement = document.getElementById('pinch-tutorial');
        if (tutorialElement) {
          tutorialElement.style.display = 'block';
          window.pinchTutorialShown = true;
          
          // Auto-hide tutorial after 5 seconds
          setTimeout(() => {
            tutorialElement.style.display = 'none';
          }, 5000);
        }
      }

      // Performance monitoring
      frameCount++;
      const currentTime = performance.now();
      if (currentTime - lastFrameTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFrameTime));
        updatePerformanceDisplay(fps);
        frameCount = 0;
        lastFrameTime = currentTime;
      }
    } catch (error) {
      console.error("Animation error:", error);
      updateStatus('Animation error: ' + error.message);
    }
  }
}

function onResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

function updateStatus(message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

function updatePerformanceDisplay(fps) {
  const performanceElement = document.getElementById('performance');
  if (performanceElement) {
    const stats = getPerformanceStats();
    let backgroundStats = '';
    
    if (dynamicBackground) {
      const bgStats = dynamicBackground.getPerformanceStats();
      backgroundStats = ` | Background: ${bgStats.fps}fps (${bgStats.performanceMode})`;
    }
    
    performanceElement.innerHTML = `
      FPS: ${fps} | Particles: ${stats.particleCount} | Shape: ${stats.currentShape}${backgroundStats}
    `;
  }
}

function setupPerformanceControls() {
  // Add keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    switch(event.key) {
      case '1':
        setQuality('low');
        updateStatus('Performance: Low quality');
        break;
      case '2':
        setQuality('medium');
        updateStatus('Performance: Medium quality');
        break;
      case '3':
        setQuality('high');
        updateStatus('Performance: High quality');
        break;
      case ' ':
        event.preventDefault();
        switchTemplate();
        break;
      case 'r':
      case 'R':
        // Reset particles
        location.reload();
        break;
      case 't':
      case 'T':
        // Cycle through color themes
        const themes = getAvailableThemes();
        const currentIndex = themes.indexOf(performanceStats?.theme || 'cosmic');
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        setColorTheme(nextTheme);
        updateStatus(`Color theme: ${nextTheme}`);
        break;
      case 'p':
      case 'P':
        // Toggle pulse effect
        toggleAdvancedEffect('pulse', !advancedEffects.pulse);
        updateStatus(`Pulse effect: ${advancedEffects.pulse ? 'ON' : 'OFF'}`);
        break;
      case 'd':
      case 'D':
        // Toggle debug mode
        const debugElement = document.getElementById('pinch-debug');
        if (debugElement) {
          debugElement.style.display = debugElement.style.display === 'none' ? 'block' : 'none';
          updateStatus(`Debug mode: ${debugElement.style.display === 'none' ? 'OFF' : 'ON'}`);
        }
        break;
      case 'c':
      case 'C':
        // Calibrate pinch threshold
        if (gestureState.pinchDetails && gestureState.pinchDetails.distance > 0) {
          const currentDistance = gestureState.pinchDetails.distance;
          // Store custom threshold (slightly larger than current distance)
          window.customPinchThreshold = currentDistance * 1.2;
          updateStatus(`Pinch calibrated! New threshold: ${(window.customPinchThreshold * 100).toFixed(1)}%`);
          
          // Show calibration status indicator
          const calibrationStatus = document.getElementById('calibration-status');
          if (calibrationStatus) {
            calibrationStatus.style.display = 'block';
            calibrationStatus.textContent = '📏 Calibrated';
            
            // Hide after 3 seconds
            setTimeout(() => {
              calibrationStatus.style.display = 'none';
            }, 3000);
          }
        } else {
          updateStatus('Hold a pinch position first, then press C to calibrate');
        }
        break;
      case 'b':
      case 'B':
        // Toggle dynamic background effects
        if (dynamicBackground) {
          const currentMode = dynamicBackground.config.performanceMode;
          const modes = ['auto', 'low', 'medium', 'high'];
          const currentIndex = modes.indexOf(currentMode);
          const nextMode = modes[(currentIndex + 1) % modes.length];
          dynamicBackground.setPerformanceMode(nextMode);
          updateStatus(`Background quality: ${nextMode.toUpperCase()}`);
        }
        break;
      case 'n':
      case 'N':
        // Cycle through color palettes
        if (dynamicBackground) {
          const palettes = Object.keys(dynamicBackground.config.colorPalettes);
          const currentIndex = palettes.indexOf(dynamicBackground.config.currentPalette);
          const nextPalette = palettes[(currentIndex + 1) % palettes.length];
          dynamicBackground.setColorPalette(nextPalette);
          updateStatus(`Color palette: ${nextPalette.toUpperCase()}`);
        }
        break;
      case 'm':
      case 'M':
        // Toggle dynamic background UI
        if (dynamicBackgroundUI) {
          dynamicBackgroundUI.toggle();
          updateStatus(`Background UI: ${dynamicBackgroundUI.isVisible ? 'OPEN' : 'CLOSED'}`);
        }
        break;
    }
  });
  
  // Add performance info to UI
  const uiOverlay = document.getElementById('ui-overlay');
  if (uiOverlay) {
    const performanceDiv = document.createElement('div');
    performanceDiv.id = 'performance';
    performanceDiv.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      color: #fff;
      background: rgba(0, 0, 0, 0.7);
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      pointer-events: none;
    `;
    uiOverlay.appendChild(performanceDiv);
  }
}
