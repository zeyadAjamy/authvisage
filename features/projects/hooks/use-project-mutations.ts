"use client";

import { createProject, deleteProject, updateProject } from "../services/api";
import { useMutation } from "@tanstack/react-query";

export const useProjectMutations = () => {
  const createProjectMutation = useMutation({
    mutationFn: createProject,
  });
  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
  });
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
  });

  return {
    createProjectMutation,
    updateProjectMutation,
    deleteProjectMutation,
  };
};
