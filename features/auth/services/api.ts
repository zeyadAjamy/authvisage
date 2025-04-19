import { client } from "@/lib/supabase/config";
import { axiosInstance } from "@/lib/axios";
import { Session } from "@supabase/supabase-js";

type UserCredentials = {
  email: string;
  password: string;
};

export const signInWithEmailPassword = async (credentials: UserCredentials) => {
  const { data, error } = await client.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("User not found");
  }
};

export const signOut = async () => {
  const { error } = await client.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

interface SignUpArgs extends UserCredentials {
  fullname: string;
}

export const signUpWithEmailPassword = async (credentials: SignUpArgs) => {
  const { data, error } = await client.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        fullname: credentials.fullname,
        biometric_captured: false,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("User not found");
  }
};

export const exchangeCodeForSession = async (codeObject: {
  code: string;
  code_verifier: string;
}) => {
  const { data } = await axiosInstance.post<Session>(
    "/oauth/token",
    codeObject,
  );

  if (!data || !data.access_token || !data.refresh_token) {
    throw new Error("Invalid session data");
  }

  return data;
};

export const updateUserMetadata = async (metadata: {
  biometric_captured: boolean;
}) => {
  const { error } = await client.auth.updateUser({
    data: metadata,
  });

  if (error) {
    throw new Error(error.message);
  }
};
