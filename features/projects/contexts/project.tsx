"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../services/api";
import { toast } from "react-toastify";
import { useQueryClient } from "@/contexts/react-query";
import { Project } from "../types";

interface ProjectContextType {
  projects: Project[];
  filteredProjects: Project[];
  isLoadingProjects: boolean;
  filterProjectsBasedOnName: (name: string) => void;
  refreshProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider = ({ children }: ProjectProviderProps) => {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const {
    data: projects = [],
    isLoading: isLoadingProjects,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });
  const queryClient = useQueryClient();

  const filterProjectsBasedOnName = useCallback(
    (name: string) => {
      const filtered = projects.filter((project) =>
        project.name.toLowerCase().includes(name.toLowerCase()),
      );
      setFilteredProjects(filtered);
    },
    [projects],
  );
  const refreshProjects = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  useEffect(() => {
    if (!error) return;
    toast.error(error.message || "Something went wrong. Please try again.");
  }, [error]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        filteredProjects,
        isLoadingProjects,
        filterProjectsBasedOnName,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
