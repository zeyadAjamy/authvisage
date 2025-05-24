"use client";

import Link from "next/link";
import { useProject } from "../contexts/project";
import { useConfirm } from "@/hooks/use-confirm";
import { useMutation } from "@tanstack/react-query";
import { Edit, MoreVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { deleteProject } from "@/features/projects/services/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ImageIcon } from "lucide-react";
import type { Project } from "@/features/projects/types";
import { Fragment } from "react";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { refreshProjects } = useProject();
  const { ConfirmDialog, askForConfirmation } = useConfirm();

  const { mutateAsync, isPending: isDeleting } = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success("Project deleted successfully");
      refreshProjects();
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleDelete = async () => {
    const confirmed = await askForConfirmation({
      title: "Delete Project",
      message: "Are you sure you want to delete this project?",
    });
    if (!confirmed) return;
    await mutateAsync(project.id);
  };

  return (
    <Fragment>
      <Card className="bg-background f-full flex flex-col overflow-hidden rounded-md shadow-none">
        <Avatar className="h-64 w-full rounded-none">
          <AvatarImage
            src={project.logo_url || undefined}
            alt={project.name}
            width={128}
            height={128}
            className="rounded-none object-cover object-center"
          />
          <AvatarFallback className="bg-muted rounded-none">
            <ImageIcon className="h-1/2 w-1/2 opacity-5" />
          </AvatarFallback>
        </Avatar>
        <CardHeader className="flex w-full flex-row items-center justify-between">
          <CardTitle className="line-clamp-1 text-xl">
            {project.name}
            <p className="text-muted-foreground text-light truncate text-sm">
              {format(new Date(project.created_at), "PPP")}
            </p>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/projects/${project.id}`}>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                <Trash className="text-destructive mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="h-full">
          <p className="text-muted-foreground text-light text-md line-clamp-2">
            {project.description}
          </p>
        </CardContent>
        <CardFooter className="flex h-fit grow-0 justify-end self-end">
          <Link
            href={`/projects/${project.id}`}
            className="w-fit cursor-pointer self-end"
          >
            <Button
              variant="outline"
              className="w-fit cursor-pointer"
              disabled={isDeleting}
            >
              Manage Project
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <ConfirmDialog />
    </Fragment>
  );
};
