"use client";

import { useQueryClient } from "@/contexts/react-query";
import { toast } from "react-toastify";
import { Globe, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrustedOrigins } from "../../hooks/use-trusted-origins";
import type { TrustedOrigin } from "@/features/projects/types";

type TrustedOriginsListProps = {
  origins: TrustedOrigin[];
  onDeleteOrigin: (originId: string, url: string) => void;
  projectId?: string;
  isControlledMode: boolean;
};

export const TrustedOriginsList = ({
  origins,
  onDeleteOrigin,
  projectId,
  isControlledMode,
}: TrustedOriginsListProps) => {
  const queryClient = useQueryClient();
  const { deleteTrustedOriginMutation } = useTrustedOrigins();

  // Handle deleting a origin
  const handleDeleteOrigin = (originId: string, url: string) => {
    if (!isControlledMode && projectId) {
      deleteTrustedOriginMutation.mutateAsync(originId, {
        onSuccess: () => {
          toast.success("Origin removed successfully.");
          queryClient.invalidateQueries({
            queryKey: ["trusted-origins", projectId],
          });
          onDeleteOrigin(originId, url);
        },
        onError: (error) => {
          toast.error(`Error removing origin: ${error.message}`);
        },
      });
    } else {
      onDeleteOrigin(originId, url);
    }
  };

  if (origins.length === 0) {
    return (
      <p className="text-muted-foreground my-4 text-center">
        No trusted origins configured
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-md border">
      {origins.map((origin) => (
        <div
          key={origin.id}
          className="flex items-center space-x-3 border-b px-4 py-3 last:border-b-0"
        >
          <Globe className="text-muted-foreground h-4 w-4" />
          <span className="flex-1 truncate font-mono text-sm">
            {origin.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteOrigin(origin.id, origin.name)}
            className="h-8 w-8"
          >
            <Trash2 className="text-muted-foreground hover:text-destructive h-4 w-4" />
            <span className="sr-only">Delete origin</span>
          </Button>
        </div>
      ))}
      <div className="text-muted-foreground px-4 py-2 text-sm">
        Total URLs: {origins.length}
      </div>
    </div>
  );
};
