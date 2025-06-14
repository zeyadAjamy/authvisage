import { client } from "./config";

export enum StorageBucket {
  AVATARS = "avatars",
  PROJECTS = "projects",
}

export const getPublicUrl = (bucket: StorageBucket, path: string) => {
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  if (!data) {
    throw new Error("Failed to get public URL");
  }
  return data.publicUrl;
};

export const uploadFile = async (
  bucket: StorageBucket,
  path: string,
  file: File,
) => {
  const { data, error } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteFile = async (bucket: StorageBucket, path: string) => {
  const { error } = await client.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(error.message);
  }
};
