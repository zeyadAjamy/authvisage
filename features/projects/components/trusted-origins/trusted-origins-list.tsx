"use client";

import { Globe, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type TrustedOriginsListProps = {
  origins: string[];
  onDeleteOrigin: (url: string) => void;
};

export const TrustedOriginsList = ({
  origins,
  onDeleteOrigin,
}: TrustedOriginsListProps) => {
  const handleDeleteOrigin = (url: string) => {
    onDeleteOrigin(url);
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
      {origins.map((origin, index) => (
        <div
          key={index}
          className="flex items-center space-x-3 border-b px-4 py-3 last:border-b-0"
        >
          <Globe className="text-muted-foreground h-4 w-4" />
          <span className="flex-1 truncate font-mono text-sm">{origin}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteOrigin(origin)}
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
