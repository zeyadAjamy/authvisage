"use client";

import { useUserContext } from "@/contexts/user";
import { LoadingPage } from "@/components/loading-page";
import { usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useUserContext();
  const pathname = usePathname();

  if (user === undefined) {
    return <LoadingPage />;
  }

  if (user === null) {
    window.location.assign("/login");
    return null;
  }

  if (user.biometric_captured === false && pathname !== "/capture-biometric") {
    window.location.assign("/capture-biometric");
    return null;
  }

  if (user) return children;
};
