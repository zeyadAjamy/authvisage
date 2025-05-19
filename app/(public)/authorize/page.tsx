"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { LoginForm } from "@/features/auth/components/login-form";
import { AuthStream } from "@/features/auth/components/auth-stream";
import { Button } from "@/components/ui/button";
import type { Socket } from "socket.io-client";
import type { Project } from "@/features/projects/types";

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
    async (code: string) => {
      const url = constructRedirectUri(code);
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
      {projectData && socket ? (
        <div className="grid grid-cols-1 items-center gap-10 p-10 md:grid-cols-2 md:p-0">
          <div>
            <h1 className="text-3xl font-bold">{projectData.name}</h1>
            <p className="text-gray-600">
              {projectData.description ||
                "This application requires your consent to access your data."}
            </p>
          </div>
          <div className="flex flex-col gap-2 self-end">
            <Button
              className="mt-4"
              onClick={sendConsentConfirmation}
            >
              Give Consent
            </Button>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-center gap-10 p-10 md:grid-cols-2 md:p-0">
          <AuthStream
            streamPurpose="login"
            isOAuth={true}
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
            captureConsent={handleConsentRequest}
          />
          <LoginForm />
        </div>
      )}
    </div>
  );
};

export default OAuthPage;
