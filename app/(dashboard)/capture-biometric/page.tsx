"use client";

import { useCallback } from "react";
import { updateUserMetadata } from "@/features/auth/services/api";
import { toast } from "react-toastify";
import { AuthStream } from "@/features/auth/components/auth-stream";
import { CheckCircle } from "lucide-react";

const CaptureBiometric = () => {
  const successCallback = useCallback(async () => {
    toast.success("Face registered successfully");
    await updateUserMetadata({
      biometric_captured: true,
    });
    window.location.assign(
      process.env.NEXT_PUBLIC_AUTHORIZED_REDIRECT_PATH || "/",
    );
  }, []);

  // Array of biometric data handling information
  const biometricInfoList = [
    {
      title: "End-to-end encryption",
      description:
        "Your biometric data is encrypted from the moment it's captured and throughout its entire lifecycle.",
    },
    {
      title: "Secure storage",
      description:
        "We store only encrypted mathematical representations of your biometric data, never the actual images.",
    },
    {
      title: "No third-party sharing",
      description:
        "Your biometric information is never shared with third parties or used for any purpose other than authentication.",
    },
    {
      title: "Compliance",
      description:
        "Our biometric handling practices comply with global data protection regulations including GDPR and CCPA.",
    },
    {
      title: "Enhanced security",
      description:
        "Biometric authentication provides a significantly higher level of security compared to traditional passwords, protecting your account from unauthorized access.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <div className="bg-card flex w-full flex-col overflow-hidden rounded-md p-10">
        <h1 className="text-2xl font-bold md:text-3xl">Capture Biometric</h1>
        <p className="text-muted-foreground text-lg">
          You are one step away from creating your account. Please look at the
          camera and follow the instructions.{" "}
        </p>
      </div>
      <div className="grid w-full grid-cols-1 items-start gap-5 md:grid-cols-2">
        <div className="bg-card rounded-lg p-10">
          <AuthStream
            streamPurpose="register"
            isOAuth={false}
            onSuccess={successCallback}
          />
        </div>
        <div className="bg-card flex flex-col gap-5 rounded-lg p-10">
          <h2 className="mb-2 text-2xl font-semibold">
            How we handle your biometric data:
          </h2>
          <ul className="flex flex-col gap-4">
            {biometricInfoList.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2"
              >
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>
                  <strong>{item.title}:</strong> {item.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CaptureBiometric;
