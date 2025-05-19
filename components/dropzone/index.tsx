"use client";

import { DetailedHTMLProps, InputHTMLAttributes } from "react";

interface DropZoneProps {
  isDragActive: boolean;
  getRootProps: () => HTMLDivElement["attributes"];
  getInputProps: () => DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  children: React.ReactNode;
}

export const DropZone = ({
  isDragActive,
  getRootProps,
  getInputProps,
  children,
}: DropZoneProps) => (
  <div
    {...getRootProps()}
    className={`flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
      isDragActive
        ? "border-primary bg-primary/10"
        : "hover:border-primary border-gray-300"
    }`}
  >
    <input {...getInputProps()} />
    {children}
  </div>
);
