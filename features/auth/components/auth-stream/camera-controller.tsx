"use client";

import { cn } from "@/utils/shadcn";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PauseIcon, PlayIcon } from "lucide-react";
import type { UseCameraReturn } from "@/features/auth/hooks/use-camera";

type CameraControllerProps = Omit<UseCameraReturn, "captureImage"> & {
  onVideoLoadedCallback: (videoElement: HTMLVideoElement) => void;
  onCanvasLoadedCallback: (canvasElement: HTMLCanvasElement) => void;
  label?: string;
};

export const CameraController = ({
  videoRef,
  selectedCamera,
  setSelectedCamera,
  cameras,
  isCameraOpen,
  openCamera,
  closeCamera,
  onVideoLoadedCallback,
  onCanvasLoadedCallback,
  label,
}: CameraControllerProps) => {
  const onBodyLoaded = (e: HTMLDivElement) => {
    const canvas = e.querySelector("canvas");
    if (canvas) {
      onCanvasLoadedCallback(canvas);
    }
    const video = e.querySelector("video");
    if (video) {
      onVideoLoadedCallback(video);
    }
  };
  if (cameras.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No cameras found</p>
      </div>
    );
  }

  return (
    <div className="flex h-fit w-full flex-col gap-2">
      {label && (
        <p className="text-muted-foreground text-center text-xl">{label}</p>
      )}
      <div
        className="relative h-full w-full"
        onLoadedMetadata={(e) => onBodyLoaded(e.currentTarget)}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          controls={false}
          className={cn("h-full w-full scale-x-[-1] rounded-sm object-cover", {
            "opacity-0": !isCameraOpen,
          })}
        />
        <canvas
          className={cn(
            "absolute top-0 h-full w-full scale-x-[-1] rounded-sm object-cover",
            {
              "opacity-0": !isCameraOpen,
            },
          )}
        />
        <div
          className={cn(
            "bg-muted absolute inset-0 flex h-full w-full items-center justify-center rounded-sm",
            {
              "opacity-0": isCameraOpen,
            },
          )}
        >
          <p className="text-muted-foreground">Camera is off</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Select
          value={selectedCamera}
          onValueChange={setSelectedCamera}
        >
          <SelectTrigger>
            <SelectValue>
              {selectedCamera
                ? cameras.find((camera) => camera.deviceId === selectedCamera)
                    ?.label
                : "Select Camera"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Cameras</SelectLabel>
              {cameras.map((camera) => (
                <SelectItem
                  key={camera.deviceId}
                  value={camera.deviceId}
                >
                  {camera.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button onClick={isCameraOpen ? closeCamera : openCamera}>
          {isCameraOpen ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
          {isCameraOpen ? "Stop" : "Start"}
        </Button>
      </div>
    </div>
  );
};
