"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProject } from "../contexts/project";

export const ProjectHeader = () => {
  const { filterProjectsBasedOnName } = useProject();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    filterProjectsBasedOnName(query);
  };

  return (
    <div className="bg-card flex flex-col items-start gap-4 rounded-lg border p-10 px-6 md:flex-row md:items-end">
      <div className="flex w-full flex-col overflow-hidden rounded-md">
        <h1 className="text-2xl font-bold md:text-3xl">Your Projects</h1>
        <p className="text-muted-foreground max-w-xl text-lg">
          Manage your face authentication projects and their settings.
        </p>
      </div>
      <div className="xs:flex-col flex w-full items-center gap-2 md:w-fit">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search projects..."
            onChange={handleSearch}
            className="w-full pl-8 sm:w-[250px]"
          />
        </div>
        <Link href="/projects/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>
    </div>
  );
};
