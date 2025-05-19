"use client";

import { Button } from "@/components/ui/button";
import { useUserContext } from "@/contexts/user";
import { Plus, Crown } from "lucide-react";

export const CreateProjectButton = () => {
  const { user } = useUserContext();
  const isPro = user?.subscription.type === "pay-as-you-go";

  const promoButtonHandler = () => {
    if (isPro) {
      // Redirect to create project page
      window.location.href = "/projects/new";
    } else {
      // Redirect to profile settings
      window.location.href = "/profile-settings";
    }
  };

  return (
    <Button
      onClick={promoButtonHandler}
      className="w-full md:w-fit"
    >
      {isPro ? "Create an App" : "Upgrade to Pro"}
      {isPro ? (
        <Plus className="ml-2 h-4 w-4" />
      ) : (
        <Crown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
};
