"use client";

import { useUserContext } from "@/contexts/user";
import {
  uploadFile,
  deleteFile,
  StorageBucket,
  getPublicUrl,
} from "@/lib/supabase/storage";
import { useMutation } from "@tanstack/react-query";

export const useMedia = (bucketName: StorageBucket) => {
  const { user } = useUserContext();

  const uploadMediaMutation = useMutation({
    mutationFn: async (file: File) =>
      await uploadFile(bucketName, `${user?.id}/${file.name}`, file),
  });

  const deleteMediaMutation = useMutation({
    mutationFn: async (path: string) => await deleteFile(bucketName, path),
  });

  const getPublicUrlMutation = useMutation({
    mutationFn: async (path: string) => getPublicUrl(bucketName, path),
  });

  return {
    uploadMediaMutation,
    deleteMediaMutation,
    getPublicUrlMutation,
  };
};
