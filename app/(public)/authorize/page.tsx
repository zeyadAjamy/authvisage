import { LoginForm } from "@/features/auth/components/login-form";
import { AuthStream } from "@/features/auth/components/auth-stream";

const OAuthPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center">
    <div className="grid grid-cols-1 items-center gap-10 p-10 md:grid-cols-2 md:p-0">
      <AuthStream
        streamPurpose="login"
        isOAuth={true}
      />
      <LoginForm />
    </div>
  </div>
);

export default OAuthPage;
