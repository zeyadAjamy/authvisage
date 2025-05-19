"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import type { Project } from "@/features/projects/types";

interface ProjectConfigSectionProps {
  project: Project;
}

export const ProjectConfigSection = ({
  project,
}: ProjectConfigSectionProps) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);

  // In a real app, these would come from the project data
  // For this example, we'll generate them based on the project ID
  const sdkConfig = {
    projectId: project.id,
    apiUrl: `https://api.faceauth.com/v1/${project.id}`,
    region: "us-east-1",
  };

  const apiKey = `sk_${project.id}_${Math.random().toString(36).substring(2, 15)}`;

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(sdkConfig, null, 2));
    setCopiedConfig(true);
    toast.success("SDK config copied to clipboard");
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedApiKey(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopiedApiKey(false), 2000);
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
          <CardTitle>API Key</CardTitle>
          <CardDescription>
            Use this secret key to verify authentication tokens in your backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="bg-muted flex items-center justify-between rounded-md p-4 font-mono text-sm">
              <div className="overflow-x-auto">
                {showApiKey ? apiKey : "•".repeat(apiKey.length)}
              </div>
              <div className="ml-4 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showApiKey ? "Hide API key" : "Show API key"}
                  </span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyApiKey}
                >
                  {copiedApiKey ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy API key</span>
                </Button>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Keep this key secret! Use it in your backend to verify
            authentication tokens.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
          <CardDescription>
            How to use the Face Auth SDK in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-semibold">
                Frontend (Client SDK)
              </h4>
              <pre className="bg-muted overflow-x-auto rounded-md p-4">
                <code className="text-sm">{`
import { FaceAuthClient } from '@face-auth/client';

// Initialize the client with your project configuration
const faceAuth = new FaceAuthClient({
  projectId: '${project.id}',
  apiUrl: '${sdkConfig.apiUrl}',
  region: '${sdkConfig.region}'
});

// Authenticate a user
const startAuth = async () => {
  try {
    const result = await faceAuth.authenticate();
    if (result.success) {
      // User authenticated successfully
      console.log('Authentication token:', result.token);
    }
  } catch (error) {
    console.error('Authentication failed:', error);
  }
};
                `}</code>
              </pre>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">
                Backend (Token Verification)
              </h4>
              <pre className="bg-muted overflow-x-auto rounded-md p-4">
                <code className="text-sm">{`
import { verifyToken } from '@face-auth/server';

// Verify the authentication token
app.post('/verify-auth', async (req, res) => {
  const { token } = req.body;
  
  try {
    // Verify the token using your API key
    const result = await verifyToken(token, '${apiKey}');
    
    if (result.valid) {
      // Token is valid, user is authenticated
      return res.json({
        authenticated: true,
        userId: result.userId
      });
    } else {
      return res.status(401).json({
        authenticated: false,
        message: 'Invalid authentication token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      authenticated: false,
      message: 'Failed to verify token'
    });
  }
});
                `}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
