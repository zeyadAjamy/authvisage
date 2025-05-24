"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrustedOriginsList } from "./trusted-origins-list";
import { AddTrustedOriginDialog } from "./add-trusted-origin-dialog";

type TrustedOriginsProps = {
  trustedOrigins: string[];
  setTrustedOrigins: React.Dispatch<React.SetStateAction<string[]>>;
};

export const TrustedOrigins = ({
  trustedOrigins,
  setTrustedOrigins,
}: TrustedOriginsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Handle adding origins from dialog
  const handleAddOrigins = (newOrigins: string[]) => {
    if (newOrigins.length === 0) {
      return;
    }

    // Ensure we only add unique origins
    setTrustedOrigins((prev) => {
      const uniqueOrigins = new Set([...prev, ...newOrigins]);
      return Array.from(uniqueOrigins);
    });
    setIsAddDialogOpen(false);
  };

  // Handle deleting an origin
  const handleDeleteOrigin = (url: string) => {
    setTrustedOrigins((prev) => prev.filter((origin) => origin !== url));
  };

  return (
    <>
      <Card className="rounded-lg shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium">
              Trusted Domains
            </CardTitle>
            <CardDescription className="text-muted-foreground max-w-lg">
              This will add a URL to a list of allowed URLs that can interact
              with your Authentication services for this project.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>Add URL</Button>
        </CardHeader>
        <CardContent>
          <TrustedOriginsList
            origins={trustedOrigins}
            onDeleteOrigin={handleDeleteOrigin}
          />
        </CardContent>
      </Card>

      <AddTrustedOriginDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddOrigins}
      />
    </>
  );
};
