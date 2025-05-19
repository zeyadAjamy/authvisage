"use client";

import { useCallback, useEffect, useState } from "react";
import { useCamera } from "@/features/auth/hooks/use-camera";
import { useSocket } from "@/features/auth/hooks/use-socket";
import { useSearchParams } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { CameraController } from "./camera-controller";
import { Socket } from "socket.io-client";
import { throttle } from "lodash";
import {
  FaceOrientation,
  useFaceOrientationDetector,
} from "@/features/auth/hooks/use-face-orientation-detector";
import type { Project } from "@/features/projects/types";

/**
 * Represents the payload needed for authentication.
 * When using OAuth, it includes parameters from the URL query.
 */
type AuthConfig = {
  auth_type: "login" | "register";
  code_challenge: string | null;
  project_id: string | null;
  redirect_uri: string | null;
  session_id: string | null;
  state: string | null;
};

/**
 * Props for AuthStream support three distinct modes:
 * - Non-OAuth login
 * - OAuth login (includes a consent-capture callback)
 * - Registration
 */
type FaceLoginProps =
  | {
      streamPurpose: "login";
      isOAuth: false;
      onSuccess: (session: Session) => void;
      onError: (error: string) => void;
    }
  | {
      streamPurpose: "login";
      isOAuth: true;
      onSuccess: (code: string) => void;
      onError: (error: string) => void;
      captureConsent: (socket: Socket, projectData: Project) => void;
    }
  | {
      streamPurpose: "register";
      isOAuth: false;
      onSuccess: () => void;
      onError: (error: string) => void;
    };

/**
 * Standardized socket event names used by the server and client.
 */

const socketEvents = {
  start: "start_auth",
  started: "auth_started",
  stream: "stream",
  success: "auth_success",
  error: "auth_error",
  capture_consent: "capture_consent",
  set_orientation: "set_orientation",
} as const;

const faceActions = {
  initializing: "Initializing, please wait ...",
  face_not_found: "Please look at the camera",
  left: "Please look left",
  right: "Please look right",
  center: "Please look at the camera",
  get_closer: "Please get closer",
  perfect: "Perfect! Please wait ...",
} as const;

/**
 * The main authentication component using face recognition and socket streaming.
 * It handles login, registration, and optional OAuth consent flows.
 */
export const AuthStream = (props: FaceLoginProps) => {
  const [isAuthStarted, setIsAuthStarted] = useState(false);
  const [cameraLabel, setCameraLabel] = useState<string>();
  const [requiredOrientation, setRequiredOrientation] =
    useState<FaceOrientation>("center");

  // Access camera-related state and methods via a custom hook
  const {
    videoRef,
    selectedCamera,
    setSelectedCamera,
    cameras,
    captureImage,
    isCameraOpen,
    openCamera,
    closeCamera,
  } = useCamera({ autoOpen: true });

  // Use a custom hook to detect face orientation
  const { detectFaceOrientation, setVideoElement, setCanvasElement } =
    useFaceOrientationDetector();

  // Initialize a socket connection with autoConnect
  const { socket } = useSocket({ autoConnect: true });

  // Retrieve URL query parameters (used in OAuth)
  const searchParams = useSearchParams();

  const { streamPurpose, isOAuth, onSuccess, onError } = props;

  /**
   * Constructs the authentication config to send via socket.
   * For OAuth, includes redirect URI, project ID, session, and state.
   */
  const buildAuthConfig = useCallback(async () => {
    const authObject = {
      auth_type: streamPurpose,
      code_challenge: null,
      project_id: null,
      redirect_uri: null,
      session_id: null,
      state: null,
    } as AuthConfig;

    if (isOAuth) {
      const keys = [
        "project_id",
        "redirect_uri",
        "session_id",
        "state",
      ] as const;

      // Populate authObject with values from URL
      keys.forEach((key) => {
        const value = searchParams.get(key);
        authObject[key] = value;
      });
    }

    return authObject;
  }, [isOAuth, searchParams, streamPurpose]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledFrameEmitter = useCallback(
    throttle((image: Blob | null, socket: Socket) => {
      socket.emit(socketEvents.stream, image);
    }, 1000), // 1 FPS
    [socket],
  );
  /**
   * Initializes the authentication flow by sending `start_auth` via socket,
   * listening to socket events for success, error, and consent (if OAuth).
   */
  useEffect(() => {
    const initializeAuthFlow = async () => {
      const authConfig = await buildAuthConfig();
      if (!authConfig || !socket || isAuthStarted) {
        setCameraLabel(faceActions.initializing);
        return;
      }

      socket.emit(socketEvents.start, authConfig);

      const handleStart = () => setIsAuthStarted(true);
      const handleConsent = (data: Project) => {
        if (streamPurpose === "login" && isOAuth && "captureConsent" in props) {
          props.captureConsent(socket, data);
        }
      };
      const handleOrientation = (orientation: FaceOrientation) => {
        setRequiredOrientation(orientation);
      };

      socket.on(socketEvents.started, handleStart);
      socket.on(socketEvents.success, onSuccess);
      socket.on(socketEvents.error, onError);
      socket.on(socketEvents.capture_consent, handleConsent);
      socket.on(socketEvents.set_orientation, handleOrientation);

      // Clean up listeners on unmount or re-run
      return () => {
        socket.off(socketEvents.started, handleStart);
        socket.off(socketEvents.success, onSuccess);
        socket.off(socketEvents.error, onError);
        socket.off(socketEvents.capture_consent, handleConsent);
        socket.off(socketEvents.set_orientation, handleOrientation);
      };
    };

    initializeAuthFlow();
  }, [
    buildAuthConfig,
    isAuthStarted,
    socket,
    onSuccess,
    onError,
    streamPurpose,
    isOAuth,
    props,
  ]);

  /**
   * When the auth flow has started, begin streaming images to the server.
   * Emits a `stream` event every second with the current image frame.
   */
  useEffect(() => {
    if (!isAuthStarted || !socket) return;
    const interval = setInterval(async () => {
      const liveDetectionResults = await detectFaceOrientation({
        enableDrawing: true,
      });
      if (!liveDetectionResults) {
        setCameraLabel(faceActions.initializing);
        return;
      }
      const { faceCount, orientation, isLargeEnough } = liveDetectionResults;
      console.log(`Face Orientation: ${orientation}`);
      if (faceCount <= 0 || !orientation) {
        setCameraLabel(faceActions.face_not_found);
        return;
      }
      if (!isLargeEnough) {
        setCameraLabel(faceActions.get_closer);
        return;
      }
      if (orientation !== requiredOrientation) {
        setCameraLabel(faceActions[requiredOrientation]);
        return;
      }

      setCameraLabel(faceActions.perfect);
      captureImage().then((data) => throttledFrameEmitter(data, socket));
    }, 1000 / 10); // 20 FPS

    // Cleanup interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, [
    isAuthStarted,
    captureImage,
    socket,
    detectFaceOrientation,
    requiredOrientation,
    throttledFrameEmitter,
  ]);

  /**
   * Updates the video reference when the camera is opened or closed.
   * This ensures that the face orientation detector has the correct video stream.
   */
  const onVideoLoadedCallback = useCallback(
    (videoElement: HTMLVideoElement) => {
      setVideoElement(videoElement);
    },
    [setVideoElement],
  );

  /**
   * Updates the canvas reference when the camera is opened or closed.
   * This ensures that the face orientation detector has the correct canvas stream.
   */

  const onCanvasLoadedCallback = useCallback(
    (canvasElement: HTMLCanvasElement) => {
      setCanvasElement(canvasElement);
    },
    [setCanvasElement],
  );

  /**
   * Renders the camera controller UI which manages camera selection and preview.
   */
  return (
    <CameraController
      videoRef={videoRef}
      cameras={cameras}
      selectedCamera={selectedCamera}
      setSelectedCamera={setSelectedCamera}
      isCameraOpen={isCameraOpen}
      openCamera={openCamera}
      closeCamera={closeCamera}
      onVideoLoadedCallback={onVideoLoadedCallback}
      onCanvasLoadedCallback={onCanvasLoadedCallback}
      label={cameraLabel}
    />
  );
};
