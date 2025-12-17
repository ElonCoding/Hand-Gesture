export function initHandTracking(state) {
  const video = document.getElementById("video");
  const statusElement = document.getElementById('status');

  // Enhanced gesture recognition
  const gestureHistory = [];
  const GESTURE_HISTORY_LENGTH = 5;
  let gestureSmoothing = 0.8;
  let lastPinchTime = 0;
  let lastGestureTime = 0;
  
  // Advanced gesture states
  state.gestureType = 'none';
  state.gestureConfidence = 0;
  state.handVelocity = { x: 0, y: 0 };
  state.fingerStates = {
    thumb: false,
    index: false,
    middle: false,
    ring: false,
    pinky: false
  };
  state.pinchDetails = {
    distance: 0,
    threshold: 0,
    confidence: 0
  };

  const hands = new Hands({
    locateFile: file =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 2, // Support for two hands
    modelComplexity: 1,
    minDetectionConfidence: 0.75, // Higher confidence
    minTrackingConfidence: 0.75
  });

  hands.onResults(results => {
    const currentTime = performance.now();
    
    if (!results.multiHandLandmarks.length) {
      if (statusElement) statusElement.textContent = 'No hand detected - show your hand to camera';
      state.gestureType = 'none';
      state.gestureConfidence = 0;
      return;
    }

    if (statusElement) statusElement.textContent = 'Hand detected! Move your hand to control particles';

    // Support for multiple hands - use the first hand with highest confidence
    let bestHandIndex = 0;
    let bestHandConfidence = 0;
    
    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
      const handConfidence = results.multiHandedness[i]?.score || 0.5;
      if (handConfidence > bestHandConfidence) {
        bestHandConfidence = handConfidence;
        bestHandIndex = i;
      }
    }

    const landmarks = results.multiHandLandmarks[bestHandIndex];
    const handedness = results.multiHandedness[bestHandIndex];
    
    // Validate landmarks before processing
    if (!landmarks || landmarks.length < 21) {
      return;
    }
    
    // Store previous position for velocity calculation
    const prevPosition = { ...state.position };
    
    // Enhanced finger detection
    updateFingerStates(landmarks, state.fingerStates);
    
    // Advanced gesture recognition
    const gestureData = recognizeAdvancedGestures(landmarks, state.fingerStates);
    
    // Smooth gesture transitions
    state.gestureType = gestureData.type;
    state.gestureConfidence = lerp(state.gestureConfidence, gestureData.confidence, 0.1);
    
    // Enhanced pinch detection with history
    const pinchData = detectEnhancedPinch(landmarks, gestureHistory);
    state.pinch = pinchData.isPinching;
    state.pinchDetails = {
      distance: pinchData.distance,
      threshold: pinchData.threshold,
      confidence: pinchData.confidence,
      handedness: handedness?.label || 'Unknown'
    };
    
    // Add cooldown to prevent rapid switching
    if (state.pinch && currentTime - lastPinchTime > 800) {
      lastPinchTime = currentTime;
    }
    
    // Enhanced hand openness calculation
    state.openness = calculateHandOpenness(landmarks, state.fingerStates);
    
    // Smooth position tracking with velocity
    const rawPosition = {
      x: (landmarks[0].x - 0.5) * 2,
      y: -(landmarks[0].y - 0.5) * 2
    };
    
    // Apply smoothing to position
    state.position.x = lerp(state.position.x, rawPosition.x, gestureSmoothing);
    state.position.y = lerp(state.position.y, rawPosition.y, gestureSmoothing);
    
    // Calculate velocity
    const deltaTime = Math.max(1, currentTime - lastGestureTime);
    state.handVelocity.x = (state.position.x - prevPosition.x) / deltaTime * 1000;
    state.handVelocity.y = (state.position.y - prevPosition.y) / deltaTime * 1000;
    
    // Store gesture in history
    gestureHistory.push({
      position: { ...state.position },
      openness: state.openness,
      pinch: state.pinch,
      timestamp: currentTime
    });
    
    if (gestureHistory.length > GESTURE_HISTORY_LENGTH) {
      gestureHistory.shift();
    }
    
    lastGestureTime = currentTime;
    
    // Update status with gesture info
    if (statusElement) {
      const handType = handedness.label || 'Hand';
      const pinchStatus = state.pinch ? ' 📌 PINCH' : '';
      statusElement.textContent = `${handType} detected - ${state.gestureType} (${Math.round(state.gestureConfidence * 100)}%)${pinchStatus}`;
    }
  });

  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480
  });

  camera.start().then(() => {
    if (statusElement) statusElement.textContent = 'Camera started! Show your hand to begin';
  }).catch(error => {
    if (statusElement) statusElement.textContent = 'Camera error: ' + error.message;
    console.error('Camera error:', error);
  });
}

// Helper functions for enhanced gesture recognition
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

function updateFingerStates(landmarks, fingerStates) {
  // Thumb detection
  const thumbTip = landmarks[4];
  const thumbBase = landmarks[2];
  fingerStates.thumb = Math.hypot(thumbTip.x - thumbBase.x, thumbTip.y - thumbBase.y) > 0.1;
  
  // Index finger
  const indexTip = landmarks[8];
  const indexBase = landmarks[5];
  fingerStates.index = Math.hypot(indexTip.x - indexBase.x, indexTip.y - indexBase.y) > 0.15;
  
  // Middle finger
  const middleTip = landmarks[12];
  const middleBase = landmarks[9];
  fingerStates.middle = Math.hypot(middleTip.x - middleBase.x, middleTip.y - middleBase.y) > 0.15;
  
  // Ring finger
  const ringTip = landmarks[16];
  const ringBase = landmarks[13];
  fingerStates.ring = Math.hypot(ringTip.x - ringBase.x, ringTip.y - ringBase.y) > 0.15;
  
  // Pinky
  const pinkyTip = landmarks[20];
  const pinkyBase = landmarks[17];
  fingerStates.pinky = Math.hypot(pinkyTip.x - pinkyBase.x, pinkyTip.y - pinkyBase.y) > 0.15;
}

function recognizeAdvancedGestures(landmarks, fingerStates) {
  let gestureType = 'open_hand';
  let confidence = 0.8;
  
  const extendedFingers = Object.values(fingerStates).filter(state => state).length;
  
  if (extendedFingers === 0) {
    gestureType = 'fist';
    confidence = 0.9;
  } else if (extendedFingers === 1 && fingerStates.index) {
    gestureType = 'pointing';
    confidence = 0.95;
  } else if (extendedFingers === 2 && fingerStates.index && fingerStates.middle) {
    gestureType = 'peace';
    confidence = 0.9;
  } else if (extendedFingers === 5) {
    gestureType = 'open_hand';
    confidence = 0.85;
  } else if (extendedFingers === 3 && fingerStates.index && fingerStates.middle && fingerStates.ring) {
    gestureType = 'three';
    confidence = 0.85;
  }
  
  return { type: gestureType, confidence };
}

function detectEnhancedPinch(landmarks, gestureHistory) {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  
  if (!thumbTip || !indexTip) {
    return { isPinching: false, distance: 1, threshold: 0.045, confidence: 0 };
  }
  
  // Calculate distance between thumb and index finger tips
  const distance = Math.sqrt(
    (thumbTip.x - indexTip.x) ** 2 + 
    (thumbTip.y - indexTip.y) ** 2
  );
  
  // Calculate adaptive threshold based on palm width
  const palmWidth = Math.hypot(
    landmarks[5].x - landmarks[17].x,
    landmarks[5].y - landmarks[17].y
  );
  
  const baseThreshold = 0.045;
  const handSizeFactor = Math.max(0.8, Math.min(1.2, palmWidth * 3));
  const adaptiveThreshold = baseThreshold * handSizeFactor;
  
  // Use custom threshold if available from calibration
  const finalThreshold = window.customPinchThreshold || adaptiveThreshold;
  
  // Check if fingers are touching (distance < threshold)
  const isTouching = distance < finalThreshold;
  
  // Calculate confidence based on distance and threshold
  const confidence = Math.max(0, 1 - (distance / (finalThreshold * 2)));
  
  // Add gesture history weighting for stability
  const recentPinches = gestureHistory.filter(g => g.pinch).length;
  const stabilityWeight = Math.min(0.3, recentPinches * 0.1);
  
  // Enhanced confidence for sustained pinches
  const sustainedPinch = gestureHistory.length >= 3 && 
    gestureHistory.slice(-3).every(g => g.pinch);
  const sustainedWeight = sustainedPinch ? 0.2 : 0;
  
  return { 
    isPinching: isTouching, 
    distance, 
    threshold: finalThreshold, 
    confidence: Math.min(1, confidence + stabilityWeight + sustainedWeight),
    isCustomThreshold: !!window.customPinchThreshold
  };
}

function calculateHandOpenness(landmarks, fingerStates) {
  const palm = landmarks[0];
  const middleTip = landmarks[12];
  
  const baseOpenness = Math.min(1, Math.hypot(palm.x - middleTip.x, palm.y - middleTip.y) * 2);
  
  // Factor in finger states for more accurate openness
  const extendedFingers = Object.values(fingerStates).filter(state => state).length;
  const fingerFactor = extendedFingers / 5;
  
  return Math.min(1, (baseOpenness + fingerFactor) / 2);
}
