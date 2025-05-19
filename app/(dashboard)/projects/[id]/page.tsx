"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EditProjectForm } from "@/features/projects/components/project-form/edit-project-form";
import { ProjectConfigSection } from "@/features/projects/components/project-config-section";
import { getProject } from "@/features/projects/services/api";
import { ProjectFormHeader } from "@/features/projects/components/project-form-header";
import { useParams } from "next/navigation";

const ProjectPage = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl py-6">
        <div className="bg-muted h-[500px] animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto max-w-3xl py-6 text-center">
        <p className="text-destructive mb-4">Failed to load project details</p>
        <Link href="/projects">
          <Button>Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-6">
      <ProjectFormHeader
        title="Manage Project"
        description="Modify the project settings and configurations."
      />
      <div className="sticky top-0 z-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <EditProjectForm project={project} />
        <ProjectConfigSection project={project} />
      </div>
    </div>
  );
};

export default ProjectPage;
