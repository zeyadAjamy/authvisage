import { ProjectList } from "@/features/projects/components/project-list";
import { ProjectHeader } from "@/features/projects/components/project-header";
import { ProjectProvider } from "@/features/projects/contexts/project";

const ProjectsPage = () => (
  <ProjectProvider>
    <div className="flex flex-col gap-6">
      <ProjectHeader />
      <ProjectList />
    </div>
  </ProjectProvider>
);

export default ProjectsPage;
