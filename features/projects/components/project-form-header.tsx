import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ProjectFormHeaderProps {
  title: string;
  description: string;
}

export const ProjectFormHeader = ({
  title,
  description,
}: ProjectFormHeaderProps) => (
  <div className="bg-card flex flex-col items-end justify-between gap-4 rounded-lg border p-18 px-6 pb-16 md:flex-row">
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
    <Link href="/projects">
      <Button className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Button>
    </Link>
  </div>
);
