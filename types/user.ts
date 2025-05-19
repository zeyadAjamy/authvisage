export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  email_verified: boolean;
  biometric_captured: boolean;
  subscription: {
    stripe_id: string;
    status: "active" | "inactive";
    type: "free" | "pay-as-you-go";
  };
};
