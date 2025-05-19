import { UploadIcon } from "lucide-react";

interface UploadPromptProps {
  message: string;
  subMessage: string;
  required?: boolean;
}

export const UploadPrompt = ({
  message,
  subMessage,
  required = false,
}: UploadPromptProps) => (
  <div className="flex h-56 w-full flex-col items-center justify-center">
    <UploadIcon
      fontSize="large"
      className="mx-auto mb-4 h-12 w-12 text-gray-400"
    />
    <h3 className="text-sm text-gray-600">
      {message} {required && <span className="text-red-500">*</span>}
    </h3>
    <p className="mt-2 text-xs text-gray-400">{subMessage}</p>
  </div>
);
