import { client } from "@/lib/supabase/config";
import type { ConnectedApp } from "@/features/connected-apps/types";

export const getConnectedApps = async (): Promise<ConnectedApp[]> => {
  const { data, error } = await client
    .from("user_project_link")
    .select<string, ConnectedApp>("*, project:project(*)");
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const disconnectApp = async ({
  projectId,
  ownerId,
}: {
  projectId: string;
  ownerId: string;
}): Promise<void> => {
  await client
    .from("user_project_link")
    .delete()
    .match({ project_id: projectId, owner_id: ownerId });
};
