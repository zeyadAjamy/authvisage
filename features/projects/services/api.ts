import { client } from "@/lib/supabase/config";
import type {
  NewProject,
  TrustedOrigin,
  ProjectWithTrustedOrigins,
  NewTrustedOrigin,
} from "@/features/projects/types";

export const getProjects = async (): Promise<ProjectWithTrustedOrigins[]> => {
  const { data, error } = await client
    .from("project")
    .select<
      string,
      ProjectWithTrustedOrigins
    >("*, trusted_origins:trusted_origin(*)");
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const getProject = async (id: string) => {
  const { data, error } = await client
    .from("project")
    .select<
      string,
      ProjectWithTrustedOrigins
    >("*, trusted_origins:trusted_origin(*)")
    .eq("id", id)
    .single<ProjectWithTrustedOrigins>();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const createProject = async (projectData: NewProject) => {
  const { data, error } = await client
    .from("project")
    .insert(projectData)
    .select<
      string,
      ProjectWithTrustedOrigins
    >("*, trusted_origins:trusted_origin(*)")
    .single();

  if (error) {
    throw error;
  }
  return data;
};

export const updateProject = async (
  projectData: NewProject & { id: string },
) => {
  const { data, error } = await client
    .from("project")
    .update(projectData)
    .eq("id", projectData.id)
    .select<
      string,
      ProjectWithTrustedOrigins
    >("*, trusted_origins:trusted_origin(*)")
    .single();
  if (error) {
    throw error;
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

export const addTrustedOrigins = async (
  origins: NewTrustedOrigin[],
): Promise<TrustedOrigin[]> => {
  const { data, error } = await client
    .from("trusted_origin")
    .insert(origins)
    .select<string, TrustedOrigin>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteTrustedOrigins = async (
  originIds: string[],
): Promise<boolean> => {
  const { error } = await client
    .from("trusted_origin")
    .delete()
    .in("id", originIds);
  if (error) {
    throw new Error(error.message);
  }
  return true;
};
