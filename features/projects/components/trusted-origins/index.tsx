"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTrustedOrigins } from "@/features/projects/services/api";
import { TrustedOriginsList } from "./trusted-origins-list";
import { AddTrustedOriginDialog } from "./add-trusted-origin-dialog";
import type { TrustedOrigin } from "@/features/projects/types";

type TrustedOriginsProps =
  | {
      projectId: string;
    }
  | {
      trustedOrigins: string[];
      setTrustedOrigins: React.Dispatch<React.SetStateAction<string[]>>;
    };

export const TrustedOrigins = (props: TrustedOriginsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [localDomains, setLocalDomains] = useState<TrustedOrigin[]>([]);

  const isControlledMode =
    "trustedOrigins" in props &&
    props.trustedOrigins !== undefined &&
    "setTrustedOrigins" in props &&
    props.setTrustedOrigins !== undefined;
  const projectId = "projectId" in props ? props.projectId : undefined;
  const trustedOrigins = isControlledMode ? props.trustedOrigins : undefined;
  const setTrustedOrigins = isControlledMode
    ? props.setTrustedOrigins
    : undefined;

  // Only fetch from API if we're in uncontrolled mode and have a projectId
  const { data: apiOrigins, isLoading } = useQuery({
    queryKey: ["trusted-origins", projectId],
    queryFn: () => getTrustedOrigins(projectId || ""),
  });

  // Initialize local origins based on mode
  useEffect(() => {
    if (isControlledMode && trustedOrigins) {
      setLocalDomains(
        trustedOrigins.map((name, index) => ({
          id: `local_${index}`,
          name,
        })),
      );
    } else if (!isControlledMode && apiOrigins && apiOrigins.length > 0) {
      setLocalDomains(apiOrigins);
    }
  }, [isControlledMode, trustedOrigins, apiOrigins]);

  // Handle adding origins from dialog
  const handleAddOrigins = (newOrigins: TrustedOrigin[]) => {
    if (isControlledMode && setTrustedOrigins) {
      // In controlled mode, update the parent state with all new origins
      const newOriginNames = newOrigins.map((origin) => origin.name);
      const allOrigins = new Set(newOriginNames).union(new Set(trustedOrigins));
      const allOriginsAsObjectArray = Array.from(allOrigins).map(
        (name, index) => ({
          id: `local_${index}`,
          name,
        }),
      );
      // Update the parent state with all new origins
      setTrustedOrigins([...allOrigins]);
      // Update local state for UI
      setLocalDomains(allOriginsAsObjectArray);
    } else if (projectId) {
      // In uncontrolled mode, the API calls are handled in the dialog component
      setLocalDomains((prev) => [
        ...prev,
        ...newOrigins.map((origin) => ({
          id: `local_${prev.length}`,
          name: origin.name,
        })),
      ]);
    }
    setIsAddDialogOpen(false);
  };

  if (isLoading && !isControlledMode) {
    return <LoadingState />;
  }

  // if (error && !isControlledMode) {
  //   return (
  //     <ErrorState

  //     />
  //   );
  // }

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
            origins={localDomains}
            onDeleteOrigin={(_, name) => {
              if (isControlledMode && setTrustedOrigins) {
                setTrustedOrigins((prev) =>
                  prev.filter((origin) => origin !== name),
                );
              }
            }}
            projectId={projectId}
            isControlledMode={isControlledMode}
          />
        </CardContent>
      </Card>

      <AddTrustedOriginDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddOrigins}
        projectId={projectId}
        isControlledMode={isControlledMode}
      />
    </>
  );
};

const LoadingState = () => (
  <Card>
    <CardHeader>
      <CardTitle>Trusted Domains</CardTitle>
      <CardDescription>
        This will add a URL to a list of allowed URLs that can interact with
        your Authentication services for this project.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-muted h-10 animate-pulse rounded-md"
          />
        ))}
      </div>
    </CardContent>
  </Card>
);

// const ErrorState = ({ onRetry }: { onRetry: () => void }) => {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Trusted Domains</CardTitle>
//         <CardDescription>
//           This will add a URL to a list of allowed URLs that can interact with
//           your Authentication services for this project.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="p-4 text-center">
//           <p className="text-destructive mb-2">
//             Failed to load trusted domains
//           </p>
//           <Button
//             variant="outline"
//             onClick={onRetry}
//           >
//             Retry
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };
