import Image from "next/image";
import { useState, useEffect } from "react";
import { MediaTypeDetector } from "@/utils/media-type";
import { FullScreenView } from "@/components/full-screen";
import { FileIcon, FullscreenIcon } from "lucide-react";

interface RenderMediaProps {
  media: string | File | undefined;
  allowFullScreen?: boolean;
  videoSettings?: {
    muted: boolean;
    loop: boolean;
    autoPlay: boolean;
    controls: boolean;
  };
  dimensions?: {
    width: string | number;
    height: string | number;
  };
}

export const RenderMedia: React.FC<RenderMediaProps> = ({
  media,
  videoSettings,
  allowFullScreen = true,
  dimensions,
}) => {
  const [mediaType, setMediaType] = useState<string>();
  const [openFullScreen, setOpenFullScreen] = useState(false);

  // Full screen handlers [open, close]
  const openInFullScreen = () => {
    if (!allowFullScreen) return;
    setOpenFullScreen(true);
  };
  const closeFullScreen = () => {
    setOpenFullScreen(false);
  };

  useEffect(() => {
    if (!media) return;
    if (typeof media === "string") {
      MediaTypeDetector.fromUrl(media).then((result) => {
        setMediaType(result.type);
      });
    } else if (media instanceof File) {
      MediaTypeDetector.fromFile(media).then((result) => {
        setMediaType(result.type);
      });
    } else {
      setMediaType("unsupported");
    }
  }, [media]);

  if (!media) return <p>No media available</p>;
  if (!mediaType) return <p>Loading media...</p>;

  const mediaUrl =
    typeof media === "string" ? media : URL.createObjectURL(media);

  switch (mediaType) {
    case "image":
      return (
        <div className="group relative h-full w-full cursor-pointer overflow-clip">
          <Image
            src={mediaUrl}
            width={400}
            height={400}
            alt="media"
            loading="lazy"
            priority={false}
            style={{
              objectFit: "cover",
              width: dimensions?.width ?? "100%",
              height: dimensions?.height ?? "100%",
            }}
          />
          {allowFullScreen && (
            <div className="w-full">
              <div
                className="bg-bg-background-medium bg-opacity-80 absolute top-0 bottom-0 z-5 hidden w-full flex-col items-center justify-center gap-2 text-gray-800 backdrop-blur-md group-hover:flex"
                onClick={openInFullScreen}
              >
                <FullscreenIcon fontSize="large" />
                <p>View Full Screen</p>
              </div>
              <FullScreenView
                open={openFullScreen}
                url={mediaUrl}
                close={closeFullScreen}
              />
            </div>
          )}
        </div>
      );
    case "video":
      return (
        <div className="group relative h-full w-full cursor-pointer overflow-clip">
          <video
            controls={videoSettings?.controls ?? true}
            muted={videoSettings?.muted ?? true}
            loop={videoSettings?.loop ?? true}
            autoPlay={videoSettings?.autoPlay ?? true}
            style={{
              objectFit: "cover",
              width: dimensions?.width ?? "100%",
              height: dimensions?.height ?? "100%",
            }}
          >
            Your browser does not support the video tag.
            <source
              src={mediaUrl}
              type="video/mp4"
            />
          </video>

          {allowFullScreen && (
            <div>
              <div
                className="bg-bg-background-medium bg-opacity-80 absolute top-0 bottom-0 z-5 hidden w-full flex-col items-center justify-center gap-2 text-gray-800 backdrop-blur-md group-hover:flex"
                onClick={openInFullScreen}
              >
                <FullscreenIcon fontSize="large" />
                <p>View Full Screen</p>
              </div>
              <FullScreenView
                open={openFullScreen}
                url={mediaUrl}
                close={closeFullScreen}
              />
            </div>
          )}
        </div>
      );
    case "document":
      return (
        <div className="flex flex-col items-center justify-center gap-5 rounded-lg p-10">
          <FileIcon className="text-primary h-20 w-20" />
          {media instanceof File && "name" in media ? (
            <span className="text-lg font-medium">{media.name}</span>
          ) : (
            <span className="text-lg font-medium">Document</span>
          )}
        </div>
      );
    default:
      return <p>Unsupported media type</p>;
  }
};
