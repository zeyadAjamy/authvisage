"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import type { Project } from "@/types/project";

interface ProjectConfigSectionProps {
  project: Project;
}

export const ProjectConfigSection = ({
  project,
}: ProjectConfigSectionProps) => {
  const [copiedConfig, setCopiedConfig] = useState(false);

  // In a real app, these would come from the project data
  // For this example, we'll generate them based on the project ID
  const sdkConfig = {
    projectId: project.id,
    backendUrl: process.env.NEXT_PUBLIC_API_URL,
    platformUrl: process.env.NEXT_PUBLIC_PLATFORM_URL,
    redirectUrl: "<YOUR_REDIRECT_URL>",
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(sdkConfig, null, 2));
    setCopiedConfig(true);
    toast.success("SDK config copied to clipboard");
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SDK Configuration</CardTitle>
          <CardDescription>
            Use this configuration with our client SDK to integrate face
            authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-muted overflow-x-auto rounded-md p-4">
              <code className="text-sm">
                {JSON.stringify(sdkConfig, null, 2)}
              </code>
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={handleCopyConfig}
            >
              {copiedConfig ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy config</span>
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Import this configuration in your frontend application to initialize
            the Face Auth SDK.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
          <CardDescription>
            How to use the AuthVisage SDK in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <pre className="bg-muted overflow-x-auto rounded-md p-4">
                <code className="text-sm">{`
import { AuthVisageClient } from 'authvisage-sdk';

// Initialize the client with your project configuration
const authClient = new AuthVisageClient({
  platformUrl: ${process.env.NEXT_PUBLIC_PLATFORM_URL},
  backendUrl: ${process.env.NEXT_PUBLIC_API_URL},
  projectId: '${project.id}',
  redirectUrl: 'https://yourapp.com/callback',
});

// Start the face authentication process
const startAuth = async () => {
  try {
    // This will redirect the user to the AuthVisage platform
    await authClient.faceLogin();
    // The user will be redirected back to your app after authentication
  } catch (error) {
    console.error('Authentication failed:', error);
  }
};
          `}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
