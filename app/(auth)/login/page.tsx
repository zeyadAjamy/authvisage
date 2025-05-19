"use client";

import { LoginForm } from "@/features/auth/components/login-form";
import { AuthStream } from "@/features/auth/components/auth-stream";
import { client } from "@/lib/supabase/config";
import { Session } from "@supabase/supabase-js";
import { toast } from "react-toastify";

const LoginPage = () => {
  const successCallback = async (session: Session) => {
    client.auth.setSession(session);
  };
  const errorCallback = () => {
    toast.error("Authentication failed");
  };
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="grid grid-cols-1 items-center gap-10 p-10 md:grid-cols-2 md:p-0">
        <AuthStream
          streamPurpose="login"
          isOAuth={false}
          onSuccess={successCallback}
          onError={errorCallback}
        />
        <LoginForm />
      </div>
    </div>
  );
};
export default LoginPage;
