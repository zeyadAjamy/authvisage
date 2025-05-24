import { ProjectProvider } from "@/features/projects/contexts/project";

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <div className="flex flex-col gap-6">{children}</div>
    </ProjectProvider>
  );
}
