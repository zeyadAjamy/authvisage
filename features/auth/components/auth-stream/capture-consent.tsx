"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

interface CaptureConsentProps {
  project: { name: string; description: string; logo_url: string | null };
  onCaptureConsent: (approved: boolean) => void;
}

/**
 * Component to capture user consent for OAuth authentication.
 * Displays a message and buttons to either consent or cancel.
 */
export const CaptureConsent = ({
  project,
  onCaptureConsent,
}: CaptureConsentProps) => {
  return (
    <div className="grid w-full grid-cols-1 items-center justify-center gap-10 p-10 md:grid-cols-2 md:p-0">
      <div className="grid grid-cols-1 items-center gap-10 p-10 md:grid-cols-2 md:p-0">
        <Avatar className="h-64 w-full rounded-none">
          <AvatarImage
            src={project.logo_url || undefined}
            alt={project.name}
            width={128}
            height={128}
            className="rounded-none object-cover object-center"
          />
          <AvatarFallback className="bg-muted rounded-none">
            <ImageIcon className="h-1/2 w-1/2 opacity-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex w-full flex-col gap-2">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-600">
            {project.description ||
              "This application requires your consent to access your data."}
          </p>
          <div className="flex gap-2 self-start">
            <Button
              onClick={() => onCaptureConsent(true)}
              className="mt-4"
            >
              Give Consent
            </Button>
            <Button
              variant="secondary"
              onClick={() => onCaptureConsent(false)}
              className="mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
