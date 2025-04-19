import { AuthStream } from "@/features/auth/components/auth-stream";

const CaptureBiometric = () => (
  <div className="flex min-h-[calc(100vh-100px)] flex-col items-center justify-center">
    <div className="grid grid-cols-1 items-start gap-10 p-10 md:grid-cols-2 md:p-0">
      <div className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-3xl font-bold">Capture Biometric</h1>
        <p className="text-gray-600">
          You are one step away from creating your account. Please look at the
          camera and follow the instructions.
        </p>
      </div>
      <AuthStream
        streamPurpose="register"
        isOAuth={false}
      />
    </div>
  </div>
);

export default CaptureBiometric;
