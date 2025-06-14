"use client";

import { NewProjectForm } from "@/features/projects/components/project-form/new-project-form";
import { ProjectFormHeader } from "@/features/projects/components/project-form-header";

const NewProjectPage = () => (
  <div className="flex flex-col gap-6">
    <ProjectFormHeader
      title="Create a New Project"
      description="Configure a new application to seamlessly integrate secure face authentication into your user experience."
    />
    <NewProjectForm />
  </div>
);

export default NewProjectPage;
