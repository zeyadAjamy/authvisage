export interface Project {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  created_at: string;
  owner_id: string;
}

export type NewProject = Omit<Project, "id" | "created_at" | "owner_id">;

export interface TrustedOrigin {
  id: string;
  name: string;
}

export type NewTrustedOrigin = Omit<TrustedOrigin, "id">;
