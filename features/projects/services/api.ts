import { client } from "@/lib/supabase/config";
import type {
  NewProject,
  Project,
  TrustedOrigin,
} from "@/features/projects/types";

export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await client.from("project").select<"", Project>();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const getProject = async (id: string): Promise<Project> => {
  const { data, error } = await client
    .from("project")
    .select<"", Project>()
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const createProject = async (
  projectData: NewProject,
): Promise<Project> => {
  const { data } = await client
    .from("project")
    .insert(projectData)
    .select<"", Project>()
    .single();
  if (!data) {
    throw new Error("Failed to create project");
  }
  return data;
};

export const updateProject = async (
  projectData: NewProject & { id: string },
): Promise<Project> => {
  const { data, error } = await client
    .from("project")
    .update(projectData)
    .eq("id", projectData.id)
    .select<"", Project>()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const deleteProject = async (id: string): Promise<boolean> => {
  const { error } = await client.from("project").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  return true;
};

export const getTrustedOrigins = async (
  projectId: string,
): Promise<TrustedOrigin[]> => {
  const { data, error } = await client
    .from("trusted_origin")
    .select<"", TrustedOrigin>()
    .eq("project_id", projectId);
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export async function addTrustedOrigin({
  projectId,
  name,
}: {
  projectId: string;
  name: string;
}): Promise<TrustedOrigin> {
  const { data, error } = await client
    .from("trusted_origin")
    .insert({ project_id: projectId, name })
    .select<"", TrustedOrigin>()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function deleteTrustedOrigin(domainId: string): Promise<boolean> {
  const { error } = await client
    .from("trusted_origin")
    .delete()
    .eq("id", domainId);
  if (error) {
    throw new Error(error.message);
  }
  return true;
}
