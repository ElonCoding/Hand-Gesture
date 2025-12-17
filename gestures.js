export function initHandTracking(state) {
  const video = document.getElementById("video");
  const statusElement = document.getElementById('status');

  const hands = new Hands({
    locateFile: file =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  hands.onResults(results => {
    if (!results.multiHandLandmarks.length) {
      if (statusElement) statusElement.textContent = 'No hand detected - show your hand to camera';
      return;
    }

    if (statusElement) statusElement.textContent = 'Hand detected! Move your hand to control particles';

    const landmarks = results.multiHandLandmarks[0];

    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const pinchDistance = Math.hypot(
      thumbTip.x - indexTip.x,
      thumbTip.y - indexTip.y
    );

    state.pinch = pinchDistance < 0.04;

    // Hand openness (distance between palm & middle finger)
    const palm = landmarks[0];
    const middleTip = landmarks[12];

    state.openness = Math.min(
      1,
      Math.hypot(palm.x - middleTip.x, palm.y - middleTip.y) * 2
    );

    state.position.x = (palm.x - 0.5) * 2;
    state.position.y = -(palm.y - 0.5) * 2;
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
