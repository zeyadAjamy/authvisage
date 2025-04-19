export type User = {
  name: string;
  email: string;
  avatar: string;
  email_verified: boolean;
  biometric_captured: boolean;
  subscription: {
    stripe_id: string;
    status: string;
    type: string;
  };
};
