"use client";

import { Button } from "@/components/ui/button";
import { CircleXIcon } from "lucide-react";
import { RenderMedia } from "@/components/render-media";
import { Accept, useDropzone } from "react-dropzone";
import { DropZone } from "@/components//dropzone";
import { UploadPrompt } from "@/components/dropzone/upload-prompt";
import { cn } from "@/utils/shadcn";

type FileType = "image" | "video" | "excel" | "pdf";
interface UploadMediaProps {
  media: string | File | undefined | null;
  acceptList: Array<FileType>;
  required?: boolean;
  setMedia: (media: File | null) => void;
  setMediaHasChanged?: () => void;
  setMediaDuration?: (duration: number) => void;
  allowFullScreen?: boolean;
  maxFiles?: number;
  className?: string;
}

const acceptMap: Record<FileType, Accept> = {
  image: {
    "image/*": [".jpg", ".jpeg", ".png"],
  },
  video: { "video/*": [".mp4", ".webm", ".ogg"] },
  excel: {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx",
    ],
  },
  pdf: {
    "application/pdf": [".pdf"],
  },
};

export const UploadMedia = ({
  media,
  acceptList,
  required,
  setMedia,
  setMediaDuration,
  setMediaHasChanged,
  allowFullScreen = false,
  maxFiles = 1,
  className,
}: UploadMediaProps) => {
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = function () {
        reject("Invalid video. Please select a valid video file.");
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setMedia(file);

    // Media has changed flag
    if (setMediaHasChanged) setMediaHasChanged();

    // Media Duration
    if (!setMediaDuration || !file) return;

    try {
      const duration = await getVideoDuration(file);
      setMediaDuration(duration);
    } catch {
      setMediaDuration(3);
    }
  };

  const accept = acceptList.reduce(
    (acc, type) => ({ ...acc, ...acceptMap[type] }),
    {} as Accept,
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
  });

  if (media) {
    return (
      <div
        className={cn(
          "bg-card relative flex w-full items-center justify-center rounded-lg border border-dashed p-3",
          className,
        )}
      >
        <RenderMedia
          media={media}
          dimensions={{ width: "100%", height: "400px" }}
          allowFullScreen={allowFullScreen}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMedia(null)}
          className="absolute top-2 right-2 z-10"
        >
          <CircleXIcon className="h-10 w-10" />
        </Button>
      </div>
    );
  }

  return (
    <DropZone
      isDragActive={isDragActive}
      getRootProps={getRootProps}
      getInputProps={getInputProps}
    >
      <UploadPrompt
        message="Drag & drop your media here, or click to select one"
        subMessage={`(Only ${acceptList.join(" and ")} files are accepted)`}
        required={required}
      />
    </DropZone>
  );
};
