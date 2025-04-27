import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";

interface CameraDevice {
  deviceId: string;
  label: string;
}

interface UseCameraReturn {
  cameras: CameraDevice[];
  selectedCamera?: string;
  setSelectedCamera: (deviceId: string) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  captureImage: () => Promise<Blob | null>;
  openCamera: () => void;
  closeCamera: () => void;
  isCameraOpen: boolean;
}

interface UseCameraProps {
  autoOpen?: boolean;
}

export const useCamera = ({ autoOpen }: UseCameraProps): UseCameraReturn => {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>();
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(autoOpen || false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const getCameras = useCallback(async () => {
    try {
      // Getting user media is required to enumerate devices
      await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      const formattedDevices = videoDevices.map((device) => ({
        deviceId: device.deviceId,
        label: device.label,
      }));

      return formattedDevices;
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);

  const openCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      console.warn("Camera is already open, you may ignore this.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: { deviceId: { exact: selectedCamera } },
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraOpen(true);
        }
      })
      .catch((err) => {
        toast.error("Failed to access camera: " + err.message);
        setIsCameraOpen(false);
      });
  }, [selectedCamera]);

  const closeCamera = useCallback(() => {
    if (!videoRef.current) {
      console.warn(
        "Camera is not open or videoRef is not set, you may ignore this.",
      );
      return;
    }
    const stream = videoRef.current.srcObject as MediaStream;
    if (!stream) {
      console.warn(
        "Attempted to close camera, but no stream found, you may ignore this.",
      );
      return;
    }
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    setIsCameraOpen(false);
  }, []);

  const captureImage = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current) {
        return resolve(null);
      }

      const canvas = document.createElement("canvas");
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return resolve(null);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    });
  }, []);

  useEffect(() => {
    const cameras = getCameras();

    cameras.then((devices) => {
      setCameras(devices);
      setSelectedCamera(devices[0]?.deviceId);
    });

    // Listen for device changes
    navigator.mediaDevices.addEventListener("devicechange", getCameras);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getCameras);
    };
  }, [getCameras]);

  useEffect(() => {
    if (!autoOpen) {
      return;
    }

    openCamera();

    return () => {
      closeCamera();
    };
  }, [autoOpen, selectedCamera, openCamera, closeCamera]);

  return {
    cameras,
    selectedCamera,
    setSelectedCamera,
    videoRef,
    captureImage,
    openCamera,
    closeCamera,
    isCameraOpen,
  };
};
