"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/features/projects/components/project-card";
import { useProject } from "../contexts/project";

export const ProjectList = () => {
  const { projects, isLoadingProjects: isLoading } = useProject();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-full"
          >
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="mt-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="mt-2 h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-2 text-xl font-semibold">No projects found</h3>
        <p className="text-muted-foreground mb-6">
          Get started by creating your first project
        </p>
        <Link href="/projects/new">
          <Button>Create Project</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
        />
      ))}
    </div>
  );
};
