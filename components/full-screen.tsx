"use client";

import { RenderMedia } from "@/components/render-media";

interface FullScreenViewProps {
  open: boolean;
  url: string | undefined;
  close: () => void;
}

export const FullScreenView = ({ open, url, close }: FullScreenViewProps) => {
  if (!url) return <p>No media available</p>;
  return (
    <div
      className="fixed top-0 left-0 z-[9999] flex h-full w-full items-center justify-center backdrop-blur backdrop:bg-black/70"
      onClick={close}
      style={{
        display: open ? "flex" : "none",
      }}
    >
      <div
        className="h-fit w-fit overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <RenderMedia
          media={url}
          allowFullScreen={false}
        />
      </div>
    </div>
  );
};
