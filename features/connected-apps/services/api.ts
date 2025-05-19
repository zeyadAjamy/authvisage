import { client } from "@/lib/supabase/config";
import type { ConnectedApp } from "@/features/connected-apps/types";

export const getConnectedApps = async (): Promise<ConnectedApp[]> => {
  const { data, error } = await client
    .from("user_project_link")
    .select<"*", ConnectedApp>("*");
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const disconnectApp = async (appId: string): Promise<void> => {
  await client.from("user_project_link").delete().match({ id: appId });
};
