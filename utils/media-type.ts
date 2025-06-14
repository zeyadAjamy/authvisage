import { fileTypeFromBlob } from "file-type";

export type MediaType = "image" | "video" | "document" | "unsupported";

interface MediaTypeResult {
  type: MediaType;
  mimeType: string | null;
  error?: string;
}

export class MediaTypeDetector {
  private static readonly supportedTypes = {
    image: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/xml",
    ],
    video: ["video/mp4", "video/webm", "video/ogg"],
    document: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  };

  private static determineType(mimeType: string): MediaType {
    for (const [type, mimeTypes] of Object.entries(this.supportedTypes)) {
      if (mimeTypes.includes(mimeType)) {
        return type as MediaType;
      }
    }
    return "unsupported";
  }

  static async fromFile(file: File): Promise<MediaTypeResult> {
    try {
      const fileType = await fileTypeFromBlob(file);
      const mimeType = fileType?.mime || file.type;
      console.log("File type detected:", this.determineType(mimeType));
      return {
        type: this.determineType(mimeType),
        mimeType,
      };
    } catch (error) {
      return {
        type: "unsupported",
        mimeType: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async fromUrl(url: string): Promise<MediaTypeResult> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileType = await fileTypeFromBlob(blob);

      return {
        type: this.determineType(fileType?.mime || blob.type),
        mimeType: fileType?.mime || blob.type,
      };
    } catch (error) {
      return {
        type: "unsupported",
        mimeType: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async fromBase64(base64String: string): Promise<MediaTypeResult> {
    try {
      // Remove data URL prefix if present
      const base64Data = base64String.split(",")[1] || base64String;
      const byteString = Buffer.from(base64Data, "base64").toString("binary");
      const byteArray = new Uint8Array(byteString.length);

      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([byteArray]);
      const fileType = await fileTypeFromBlob(blob);

      return {
        type: this.determineType(fileType?.mime || "application/octet-stream"),
        mimeType: fileType?.mime || null,
      };
    } catch (error) {
      return {
        type: "unsupported",
        mimeType: null,
        error: error instanceof Error ? error.message : "Invalid base64 string",
      };
    }
  }
}
