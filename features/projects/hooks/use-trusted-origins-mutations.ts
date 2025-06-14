"use client";

import {
  addTrustedOrigins,
  deleteTrustedOrigins,
} from "@/features/projects/services/api";
import { useMutation } from "@tanstack/react-query";

export const useTrustedOriginMutations = () => {
  const addTrustedOriginsMutation = useMutation({
    mutationFn: addTrustedOrigins,
  });

  const deleteTrustedOriginsMutation = useMutation({
    mutationFn: deleteTrustedOrigins,
  });

  return {
    addTrustedOriginsMutation,
    deleteTrustedOriginsMutation,
  };
};
