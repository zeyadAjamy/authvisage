"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { LoginForm } from "@/features/auth/components/login-form";
import { AuthStream } from "@/features/auth/components/auth-stream";
import { CaptureConsent } from "@/features/auth/components/auth-stream/capture-consent";
import { cn } from "@/utils/shadcn";
import type { Socket } from "socket.io-client";
import type { Project } from "@/types/project";

const OAuthPage = () => {
  const [socket, setSocket] = useState<Socket>();
  const [projectData, setProjectData] = useState<Project>();
  const searchParams = useSearchParams();

  /**
   * Constructs a redirect URI with state and code attached.
   * Returns undefined if redirect_uri or state is missing from the query.
   */
  const constructRedirectUri = useCallback(
    (code: string) => {
      const redirect_uri = searchParams.get("redirect_uri");
      const state = searchParams.get("state");
      if (!redirect_uri || !state) return;

      const url = new URL(redirect_uri);
      url.searchParams.set("state", state);
      url.searchParams.set("code", code);
      return url.toString();
    },
    [searchParams],
  );

  /**
   * Called when the login is successful and a code is received.
   * Constructs the final redirect URL and navigates to it.
   */
  const handleAuthSuccess = useCallback(
    async ({ auth_code }: { auth_code: string }) => {
      const url = constructRedirectUri(auth_code);
      if (!url) {
        toast.error("Invalid redirect URL");
        return;
      }
      window.location.assign(url);
    },
    [constructRedirectUri],
  );

  /**
   * Called when the authentication fails.
   */
  const handleAuthError = useCallback(() => {
    toast.error("Authentication failed");
  }, []);

  /**
   * AuthStream manages the socket connection for login and authentication.
   * When consent is required, it passes the active socket and project data
   * up to this component through `handleConsentRequest`. This allows
   * the parent to take control over the connection and present the consent UI.
   *
   * Socket management is kept inside AuthStream unless this specific OAuth flow
   * requires user consent. Other components using AuthStream won’t be affected.
   */
  const handleConsentRequest = useCallback(
    (incomingSocket: Socket, project: Project) => {
      setSocket(incomingSocket);
      setProjectData(project);

      incomingSocket.on("auth_success", handleAuthSuccess);
      incomingSocket.on("auth_error", handleAuthError);
    },
    [handleAuthSuccess, handleAuthError],
  );

  /**
   * Emits a signal to the server that the user has given consent.
   */
  const sendConsentConfirmation = useCallback(() => {
    if (!socket || !projectData) return;
    socket.emit("consent_captured");
  }, [socket, projectData]);

  /**
   * Disconnect and clean up socket when user cancels consent.
   */
  const handleCancel = () => {
    if (!socket) return;
    socket.off("auth_success");
    socket.off("auth_error");
    socket.disconnect();
    setSocket(undefined);
    setProjectData(undefined);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {projectData && socket && (
        <div className="col-span-2">
          <CaptureConsent
            project={projectData}
            onCaptureConsent={(approved: boolean) => {
              if (approved) {
                sendConsentConfirmation();
              } else {
                handleCancel();
              }
            }}
          />
        </div>
      )}

      <div
        className={cn(
          "grid grid-cols-1 items-center gap-10 p-10 md:grid-cols-2 md:p-0",
          {
            "pointer-events-none opacity-0": projectData && socket,
          },
        )}
      >
        <AuthStream
          streamPurpose="oauth"
          onSuccess={handleAuthSuccess}
          captureConsent={handleConsentRequest}
        />
        <LoginForm />
      </div>
    </div>
  );
};

export default OAuthPage;
