import { client } from "./config";
import { User } from "@/types/user";

export const signOut = async () => {
  const { error } = await client.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const authStateObserver = (
  callback: (user: User | null) => void,
): (() => void) => {
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_, session) => {
    // Avoiding dead-lock based on https://supabase.com/docs/reference/javascript/auth-onauthstatechange
    setTimeout(async () => {
      if (session) {
        const metadata = session.user.user_metadata;
        callback({
          id: session.user.id,
          name: metadata.fullname,
          email: metadata.email,
          avatar: metadata.avatar_url,
          email_verified: !session.user.email_confirmed_at,
          biometric_captured: metadata.biometric_captured,
          subscription: {
            stripe_id: "",
            status: "active",
            type: "pay-as-you-go",
          },
        });
        return;
      }
      callback(null);
    }, 0);
  });

  return subscription.unsubscribe;
};

export const getAccessToken = async () => {
  const session = await client.auth.getSession();
  return session.data.session?.access_token;
};
