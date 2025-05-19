"use client";

import { TrustedOrigins } from "@/features/projects/components/trusted-origins";
import { ProjectMetaData, type ProjectFormValues } from "./metadata";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from "@/features/projects/types";

interface ProjectFormProps {
  project: Project;
}

export const EditProjectForm = ({ project }: ProjectFormProps) => {
  const onSubmit = (data: ProjectFormValues) => {
    console.log(data);
  };

  return (
    <div>
      <Tabs
        defaultValue="metadata"
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="trusted-domains">Trusted Domains</TabsTrigger>
        </TabsList>
        <TabsContent value="metadata">
          <ProjectMetaData
            project={project}
            submitLabel={"Update Project"}
            onSubmit={onSubmit}
          />
        </TabsContent>
        <TabsContent value="trusted-domains">
          <TrustedOrigins projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
