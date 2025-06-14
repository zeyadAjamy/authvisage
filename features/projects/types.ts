import type { Project } from "@/types/project";

export type NewProject = Omit<Project, "id" | "created_at" | "owner_id">;

export interface TrustedOrigin {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  project_id: string;
}

export type NewTrustedOrigin = Omit<
  TrustedOrigin,
  "id" | "created_at" | "created_by"
>;

export interface ProjectWithTrustedOrigins extends Project {
  trusted_origins: TrustedOrigin[];
}
