import { ProjectList } from "@/features/projects/components/project-list";
import { ProjectHeader } from "@/features/projects/components/project-header";

const ProjectsPage = () => (
  <div className="flex flex-col gap-6">
    <ProjectHeader />
    <ProjectList />
  </div>
);

export default ProjectsPage;
