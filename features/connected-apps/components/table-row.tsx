"use client";

import { useConnectedApps } from "@/features/connected-apps/contexts/connected-projects";
import { useMutation } from "@tanstack/react-query";

import { format } from "date-fns";
import { disconnectApp } from "@/features/connected-apps/services/api";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";

import { toast } from "react-toastify";
import type { ConnectedApp } from "@/features/connected-apps/types";

export const ConnectedAppRow = ({
  created_at,
  last_sign_in,
  project,
}: ConnectedApp) => {
  const { disconnectAppCallback } = useConnectedApps();

  const { mutateAsync: disconnectAppTrigger, isPending } = useMutation({
    mutationFn: () =>
      disconnectApp({
        projectId: project.id,
        ownerId: project.owner_id,
      }),
    onSuccess: () => {
      toast.success("App disconnected successfully");
      disconnectAppCallback(project.id);
    },
    onError: (error) => {
      toast.error(`Failed to disconnect app: ${error.message}`);
    },
  });

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={project.logo_url ?? ""}
              alt={project.name}
              width={32}
              height={32}
            />
            <AvatarFallback className="bg-muted">
              <span className="text-muted-foreground uppercase">
                {project.name[0] ?? ""}
              </span>
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{project.name}</span>
        </div>
      </TableCell>
      <TableCell>{format(created_at, "MMM d, yyyy")}</TableCell>
      <TableCell>
        {last_sign_in ? format(last_sign_in, "MMM d, yyyy") : "Never"}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={isPending}
              onClick={() => disconnectAppTrigger()}
            >
              {isPending ? "Disconnecting..." : "Disconnect"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
