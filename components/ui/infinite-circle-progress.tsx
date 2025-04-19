"use client";
import { LoaderCircle } from "lucide-react";

export const InfiniteCircleProgress = () => (
  <div
    className="flex h-16 w-16 animate-spin items-center justify-center text-teal-500"
    role="progressbar"
    aria-valuetext="Loading"
  >
    <LoaderCircle className="h-14 w-14 text-teal-500" />
  </div>
);
