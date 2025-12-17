import { initParticles, updateParticles, switchTemplate, getCurrentShapeName } from "./particles.js";
import { initHandTracking } from "./gestures.js";

let scene, camera, renderer;
let gestureState = {
  pinch: false,
  openness: 0,
  position: { x: 0, y: 0 }
};

let statusElement;

init();
animate();

function init() {
  statusElement = document.getElementById('status');
  
  try {
    scene = new THREE.Scene();
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
      alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    initParticles(scene);
    
    // Initialize hand tracking with status updates
    initHandTracking(gestureState);
    
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
    updateParticles(gestureState);
    renderer.render(scene, camera);
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
