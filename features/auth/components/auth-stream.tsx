"use client";

import { useCallback, useEffect, useState } from "react";
import { useCamera } from "@/features/auth/hooks/use-camera";
import { useSocket } from "@/features/auth/hooks/use-socket";
import { useMutation } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";
import { generatePkce, PKCEPair } from "@/features/auth/services/pkce";
import {
  exchangeCodeForSession,
  updateUserMetadata,
} from "@/features/auth/services/api";
import { client } from "@/lib/supabase/config";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { PauseIcon, PlayIcon } from "lucide-react";
import { cn } from "@/utils/shadcn";

type AuthConfig = {
  auth_type: "login" | "register";
  code_challenge: string | null;
  project_id: string | null;
  redirect_uri: string | null;
  session_id: string | null;
  state: string | null;
};

interface FaceLoginProps {
  streamPurpose: "login" | "register";
  isOAuth: boolean;
}

const socketEvents = {
  start: "start_auth",
  started: "auth_started",
  stream: "stream",
  success: "auth_success",
  error: "auth_error",
} as const;

export const AuthStream = ({
  streamPurpose,
  isOAuth = false,
}: FaceLoginProps) => {
  const [pkcePair, setPkcePair] = useState<PKCEPair>();
  const [isAuthStarted, setIsAuthStarted] = useState(false);
  const {
    videoRef,
    selectedCamera,
    setSelectedCamera,
    cameras,
    captureImage,
    isCameraOpen,
    openCamera,
    closeCamera,
  } = useCamera({ autoOpen: true });
  const { socket, isConnected, cleanUp } = useSocket({ autoConnect: true });
  const searchParams = useSearchParams();

  const { mutateAsync: exchangeCodeForSessionTrigger } = useMutation({
    mutationKey: ["exchange_code"],
    mutationFn: exchangeCodeForSession,
    onSuccess: (session) => {
      client.auth.setSession(session);
    },
    onError() {
      toast.error("Failed to authenticate");
    },
  });

  const constructRedirectUri = useCallback(
    (code: string) => {
      const redirect_uri = searchParams.get("redirect_uri");
      const state = searchParams.get("state");
      if (!redirect_uri || !state) {
        return;
      }

      const url = new URL(redirect_uri);
      url.searchParams.set("state", state);
      url.searchParams.set("code", code);
      return url.toString();
    },
    [searchParams],
  );

  // Auth success callbacks
  const registerSuccessCallback = useCallback(async () => {
    toast.success("Face registered successfully");
    await updateUserMetadata({
      biometric_captured: true,
    });
    window.location.assign(
      process.env.NEXT_PUBLIC_AUTHORIZED_REDIRECT_PATH || "/",
    );
  }, []);

  const oAuthLoginSuccessCallback = useCallback(
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

  const platformLoginSuccessCallback = useCallback(
    async (code: string) => {
      const codeVerifier = pkcePair?.codeVerifier;
      if (!codeVerifier) {
        toast.error("Invalid code verifier");
        return;
      }
      await exchangeCodeForSessionTrigger({
        code,
        code_verifier: codeVerifier,
      });
      setPkcePair(undefined); // Clear the PKCE pair after use
    },
    [exchangeCodeForSessionTrigger, pkcePair?.codeVerifier],
  );

  const successCallback = useCallback(
    async (data: { auth_code: string }) => {
      if (isConnected) cleanUp(); // disconnect the socket

      if (streamPurpose === "register") {
        await registerSuccessCallback();
        return;
      }

      const code = data.auth_code;
      if (isOAuth) {
        await oAuthLoginSuccessCallback(code);
      } else {
        await platformLoginSuccessCallback(code);
      }
    },
    [
      isConnected,
      cleanUp,
      streamPurpose,
      isOAuth,
      registerSuccessCallback,
      oAuthLoginSuccessCallback,
      platformLoginSuccessCallback,
    ],
  );

  const buildAuthConfig = useCallback(async () => {
    const authObject = {
      auth_type: streamPurpose,
    } as AuthConfig;

    if (isOAuth) {
      const keys = [
        "project_id",
        "redirect_uri",
        "session_id",
        "state",
      ] as const;
      // Update the auth object with the values from the URL
      keys.reduce((acc, key) => {
        const value = searchParams.get(key);
        acc[key] = value;
        return acc;
      }, authObject);
      return authObject;
    }

    const pkce = pkcePair ?? (await generatePkce());
    setPkcePair(pkce);
    authObject.code_challenge = pkce.codeChallenge;
    return authObject;
  }, [isOAuth, pkcePair, searchParams, streamPurpose]);

  // init auth flow
  useEffect(() => {
    const initializeAuthFlow = async () => {
      const authObject = await buildAuthConfig();
      if (!authObject || !socket || isAuthStarted) return;

      // Start the socket connection
      socket.emit(socketEvents.start, authObject);

      // Listen for the socket events
      socket.on(socketEvents.started, () => {
        setIsAuthStarted(true);
      });
      socket.on(socketEvents.success, successCallback);
      socket.on(socketEvents.error, toast.error);
    };

    initializeAuthFlow();
  }, [buildAuthConfig, isAuthStarted, socket, successCallback]);

  // stream images when auth process has started
  useEffect(() => {
    if (!isAuthStarted || !socket) return;

    const interval = setInterval(() => {
      captureImage().then((image) => {
        socket.emit(socketEvents.stream, image);
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthStarted, captureImage, socket]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-full w-full overflow-hidden md:h-[490px] md:w-[450px]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          controls={false}
          className={cn("h-full w-full scale-x-[-1] rounded-sm object-cover", {
            "opacity-0": !isCameraOpen,
          })}
        />

        <div
          className={cn(
            "bg-muted absolute inset-0 flex h-full w-full items-center justify-center rounded-sm",
            {
              "opacity-0": isCameraOpen,
            },
          )}
        >
          <p className="text-muted-foreground">Camera is off</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Select
          value={selectedCamera}
          onValueChange={setSelectedCamera}
        >
          <SelectTrigger>
            <SelectValue>
              {selectedCamera
                ? cameras.find((camera) => camera.deviceId === selectedCamera)
                    ?.label
                : "Select Camera"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Cameras</SelectLabel>
              {cameras.map((camera) => (
                <SelectItem
                  key={camera.deviceId}
                  value={camera.deviceId}
                  onClick={() => setSelectedCamera(camera.deviceId)}
                >
                  {camera.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button onClick={isCameraOpen ? closeCamera : openCamera}>
          {isCameraOpen ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
          {isCameraOpen ? "Stop" : "Start"}
        </Button>
      </div>
    </div>
  );
};
