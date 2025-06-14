import { Project } from "@/types/project";

export interface ConnectedApp {
  project_id: string;
  owner_id: string;
  project: Project;
  created_at: string;
  last_sign_in: string | null;
}
