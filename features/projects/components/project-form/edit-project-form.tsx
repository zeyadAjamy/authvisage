"use client";

import { useState } from "react";
import { TrustedOrigins } from "@/features/projects/components/trusted-origins";
import { ProjectMetaData, type ProjectFormValues } from "./metadata";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { useProjectMutations } from "@/features/projects/hooks/use-project-mutations";
import { useTrustedOriginMutations } from "@/features/projects/hooks/use-trusted-origins-mutations";
import { useMedia } from "@/hooks/use-media";
import { diffArrays } from "@/utils/diff-array";
import { toast } from "react-toastify";
import { StorageBucket } from "@/lib/supabase/storage";
import { useProject } from "@/features/projects/contexts/project";
import type { ProjectWithTrustedOrigins } from "@/features/projects/types";

interface ProjectFormProps {
  project: ProjectWithTrustedOrigins;
  onSubmitCallback?: (data: ProjectWithTrustedOrigins) => void;
}

export const EditProjectForm = ({
  project,
  onSubmitCallback,
}: ProjectFormProps) => {
  const { updateProjectMutation } = useProjectMutations();
  const { addTrustedOriginsMutation, deleteTrustedOriginsMutation } =
    useTrustedOriginMutations();
  const { deleteMediaMutation, getPublicUrlMutation, uploadMediaMutation } =
    useMedia(StorageBucket.PROJECTS);
  const [origins, setOrigins] = useState<string[]>(
    project.trusted_origins.map((origin) => origin.name),
  );
  const { refreshProjects } = useProject();

  const handleSyncOrigins = async (newOrigins: string[]) => {
    // Find differences between old and new origins
    const oldOrigins = project.trusted_origins.map((origin) => origin.name);
    const { added, removed } = diffArrays(oldOrigins, newOrigins);

    // No changes, nothing to do
    if (added.length === 0 && removed.length === 0) {
      return;
    }

    // Sync with backend
    const toBeRemovedIds = project.trusted_origins
      .filter((origin) => removed.includes(origin.name))
      .map((origin) => origin.id);
    const toBeAdded = added.map((name) => ({
      project_id: project.id,
      name,
    }));
    if (toBeRemovedIds.length > 0) {
      await deleteTrustedOriginsMutation.mutateAsync(toBeRemovedIds, {
        onError: (error) => {
          toast.error(`Failed to remove trusted origins: ${error.message}`);
        },
      });
    }
    if (toBeAdded.length > 0) {
      await addTrustedOriginsMutation.mutateAsync(toBeAdded, {
        onError: (error) => {
          toast.error(`Failed to add trusted origins: ${error.message}`);
        },
      });
    }
  };
  const handleUpdateMedia = async (file?: File | null | string) => {
    // If file is a string, it means it's already a URL nothing to do
    if (typeof file === "string") {
      return file;
    }

    // Delete old media if it exists
    if (project.logo_url) {
      await deleteMediaMutation.mutateAsync(project.logo_url, {
        onError: (error) => {
          toast.error(`Failed to delete old media: ${error.message}`);
        },
      });
    }

    // If no file is provided, nothing to do
    if (!file) {
      return null;
    }

    // Upload new media
    const data = await uploadMediaMutation.mutateAsync(file, {
      onError: (error) => {
        toast.error(`Failed to upload media: ${error.message}`);
      },
    });

    // Get public URL for the uploaded media
    const publicUrl = await getPublicUrlMutation.mutateAsync(data.path, {
      onError: (error) => {
        toast.error(`Failed to get media URL: ${error.message}`);
        // If we fail to get the URL, we should delete the uploaded file
        deleteMediaMutation.mutateAsync(data.path, {
          onError: (deleteError) => {
            toast.error(
              `Please report this issue: Failed to delete uploaded file after URL fetch failure: ${deleteError.message}`,
            );
            console.error(
              "Failed to delete uploaded file after URL fetch failure:",
              deleteError,
            );
          },
        });
      },
    });

    return publicUrl;
  };

  const onSubmit = async (data: ProjectFormValues) => {
    // Sync origins with the backend
    await handleSyncOrigins(origins);

    // Handle media upload and get the public URL
    const mediaUrl = await handleUpdateMedia(data.media);

    const updatedData = {
      id: project.id,
      name: data.name,
      description: data.description,
      logo_url: mediaUrl,
    };

    // Update project metadata
    await updateProjectMutation.mutateAsync(updatedData, {
      onSuccess: (data) => {
        toast.success("Project updated successfully");
        onSubmitCallback?.(data);
        refreshProjects();
      },
      onError: (error) => {
        toast.error(`Failed to update project: ${error.message}`);
      },
    });
  };

  return (
    <div>
      <Tabs
        defaultValue="metadata"
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="trusted-domains">Trusted Domains</TabsTrigger>
        </TabsList>
        <TabsContent value="metadata">
          <ProjectMetaData
            project={project}
            submitLabel={"Update Project"}
            onSubmit={onSubmit}
          />
        </TabsContent>
        <TabsContent value="trusted-domains">
          <TrustedOrigins
            trustedOrigins={origins}
            setTrustedOrigins={setOrigins}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
