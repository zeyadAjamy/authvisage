"use client";

import { useEffect, useState, useRef } from "react"; // Added useRef
import {
  FilesetResolver,
  FaceLandmarker,
  DrawingUtils,
  FaceLandmarkerResult,
  NormalizedLandmark,
  Category, // Added Category for blendshapes
} from "@mediapipe/tasks-vision";

export type FaceOrientation = "right" | "left" | "center";

// Define a type for individual landmark points (already in user's code, kept for consistency)
export type LandmarkPoint = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
};

export type MicroMovementResult = {
  eyeBlink?: {
    left: boolean;
    right: boolean;
    detected: boolean;
  };
  // mouthOpen?: number;
  // headNod?: boolean;
};

export type FaceDetectionResult = {
  faceCount: number;
  orientation: FaceOrientation | null;
  isLargeEnough: boolean;
  microMovements?: MicroMovementResult;
  landmarks?: NormalizedLandmark[];
  blendshapes?: Category[]; // To store blendshape data
};

export const useFaceOrientationDetector = () => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement>();
  const [landmarker, setLandmarker] = useState<FaceLandmarker>();
  const prevLandmarksRef = useRef<NormalizedLandmark[] | null>(null); // For comparing frames for movements

  useEffect(() => {
    const createFaceLandmarker = async () => {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm",
      );
      const faceLandmarker = await FaceLandmarker.createFromOptions(
        filesetResolver,
        {
          baseOptions: {
            modelAssetPath: `/models/face_landmarker.task`,
            delegate: "GPU",
          },
          outputFaceBlendshapes: true, // Enable blendshapes
          outputFacialTransformationMatrixes: true, // Useful for head pose, if needed later
          runningMode: "VIDEO",
          numFaces: 1, // Process one face for performance, adjust if multiple faces needed
        },
      );
      setLandmarker(faceLandmarker);
    };

    createFaceLandmarker();
  }, []);

  const drawResults = (results: FaceLandmarkerResult) => {
    if (!videoElement || !canvasElement) return;

    const canvas = canvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas to video dimensions
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Clear the entire canvas before drawing new landmarks
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save the context state
    ctx.save();

    // Draw the video frame as background (optional)
    // ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const drawingUtils = new DrawingUtils(ctx);

    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: "#FF3030" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: "#FF3030" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: "#30FF30" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: "#30FF30" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        {
          color: "#E0E0E0",
        },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30" },
      );
    }
  };

  const detectFaceOrientation = async ({ enableDrawing = false }) => {
    if (!videoElement || !landmarker) {
      return {
        faceCount: 0,
        orientation: null,
        isLargeEnough: false,
      } as FaceDetectionResult;
    }

    if (!videoElement.videoWidth || !videoElement.videoHeight) {
      return {
        faceCount: 0,
        orientation: null,
        isLargeEnough: false,
      } as FaceDetectionResult;
    }

    try {
      const nowInMs = performance.now();
      const results = landmarker.detectForVideo(videoElement, nowInMs);

      if (enableDrawing) {
        drawResults(results);
      }

      const faceCount = results.faceLandmarks.length;
      let orientation: FaceOrientation | null = null;
      let isLargeEnough = false;
      const microMovements: MicroMovementResult = {}; // Changed to const as only its properties are modified
      let currentLandmarks: NormalizedLandmark[] | undefined = undefined;
      let currentBlendshapes: Category[] | undefined = undefined;

      if (faceCount > 0 && results.faceLandmarks[0]) {
        currentLandmarks = results.faceLandmarks[0];

        // Extract specific facial landmarks
        const leftEye = currentLandmarks[33];
        const rightEye = currentLandmarks[263];
        const noseTip = currentLandmarks[4];
        const leftEar = currentLandmarks[234];
        const rightEar = currentLandmarks[454];
        const chin = currentLandmarks[152];
        const forehead = currentLandmarks[10];

        if (leftEye && rightEye && noseTip && leftEar && rightEar) {
          const eyeMidpointX = (leftEye.x + rightEye.x) / 2;
          const noseOffsetX = noseTip.x - eyeMidpointX;
          const earWidthRatio = Math.abs(rightEar.x - leftEar.x);

          if (noseOffsetX < -0.02 && earWidthRatio < 0.3) {
            orientation = "right";
          } else if (noseOffsetX > 0.02 && earWidthRatio < 0.3) {
            orientation = "left";
          } else {
            orientation = "center";
          }

          if (chin && forehead) {
            const faceWidth = Math.abs(rightEar.x - leftEar.x);
            const faceHeight = Math.abs(chin.y - forehead.y);
            isLargeEnough = faceWidth > 0.2 && faceHeight > 0.2;
          }
        }

        // Process Blendshapes for micro-movements
        if (
          results.faceBlendshapes &&
          results.faceBlendshapes.length > 0 &&
          results.faceBlendshapes[0].categories
        ) {
          currentBlendshapes = results.faceBlendshapes[0].categories;
          const eyeBlinkLeftScore =
            currentBlendshapes.find(
              (shape) => shape.categoryName === "eyeBlinkLeft",
            )?.score ?? 0;
          const eyeBlinkRightScore =
            currentBlendshapes.find(
              (shape) => shape.categoryName === "eyeBlinkRight",
            )?.score ?? 0;

          const blinkThreshold = 0.5; // Adjust as needed
          const leftBlinking = eyeBlinkLeftScore > blinkThreshold;
          const rightBlinking = eyeBlinkRightScore > blinkThreshold;

          microMovements.eyeBlink = {
            left: leftBlinking,
            right: rightBlinking,
            detected: leftBlinking || rightBlinking,
          };
        }

        // Store current landmarks for next frame comparison (if needed for other micro-movements)
        prevLandmarksRef.current = currentLandmarks;
      } else {
        // No face detected, clear previous landmarks
        prevLandmarksRef.current = null;
      }

      return {
        faceCount,
        orientation,
        isLargeEnough,
        microMovements: faceCount > 0 ? microMovements : undefined,
        landmarks: faceCount > 0 ? currentLandmarks : undefined,
        blendshapes: faceCount > 0 ? currentBlendshapes : undefined,
      } as FaceDetectionResult;
    } catch (error) {
      console.warn("Face detection error:", error);
      prevLandmarksRef.current = null; // Clear on error
      return {
        faceCount: 0,
        orientation: null,
        isLargeEnough: false,
      } as FaceDetectionResult;
    }
  };

  return {
    setVideoElement,
    setCanvasElement,
    detectFaceOrientation,
    drawResults, // Expose drawResults if it's to be used externally or for debugging
  };
};
