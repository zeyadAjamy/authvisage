"use client";

import {
  addTrustedOrigin,
  deleteTrustedOrigin,
} from "@/features/projects/services/api";
import { useMutation } from "@tanstack/react-query";

export const useTrustedOrigins = () => {
  const addTrustedOriginMutation = useMutation({
    mutationFn: addTrustedOrigin,
  });

  const deleteTrustedOriginMutation = useMutation({
    mutationFn: deleteTrustedOrigin,
  });

  return {
    addTrustedOriginMutation,
    deleteTrustedOriginMutation,
  };
};
