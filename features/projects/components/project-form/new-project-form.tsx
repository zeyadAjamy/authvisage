"use client";

import { useState } from "react";
import { TrustedOrigins } from "@/features/projects/components/trusted-origins";
import { ProjectMetaData, type ProjectFormValues } from "./metadata";
import { toast } from "react-toastify";
import { useMedia } from "@/hooks/use-media";
import { StorageBucket } from "@/lib/supabase/storage";
import { NewProject } from "@/features/projects/types";
import { useProjectMutations } from "@/features/projects/hooks/use-project-mutations";
import { useTrustedOriginMutations } from "@/features/projects/hooks/use-trusted-origins-mutations";
import { useRouter } from "next/navigation";
import { useProject } from "@/features/projects/contexts/project";

export const NewProjectForm = () => {
  const [trustedOrigins, setTrustedOrigins] = useState<string[]>([]);
  const { uploadMediaMutation, getPublicUrlMutation, deleteMediaMutation } =
    useMedia(StorageBucket.PROJECTS);
  const { createProjectMutation, deleteProjectMutation } =
    useProjectMutations();
  const { addTrustedOriginsMutation } = useTrustedOriginMutations();
  const { refreshProjects } = useProject();
  const router = useRouter();

  const onSubmit = async (data: ProjectFormValues) => {
    if (trustedOrigins.length === 0) {
      toast.error("Please add at least one trusted origin.");
      return;
    }
    const projectData: NewProject = {
      name: data.name,
      description: data.description,
      logo_url: "",
    };

    // Upload media if it exists
    if (data.media) {
      const pathObject = await uploadMediaMutation.mutateAsync(data.media, {
        onError: (error) => {
          toast.error(`Error uploading media: ${error.message}`);
        },
      });

      const url = await getPublicUrlMutation.mutateAsync(pathObject.path, {
        onError: (error) => {
          toast.error(`Error getting public URL: ${error.message}`);
          // Delete the file if we can't get the URL
          deleteMediaMutation.mutateAsync(pathObject.path, {
            onError: (error) => {
              toast.error(
                `Error: please report this to the support team: Error Getting public URL followed by Error Deleting file: ${pathObject.path} ${error.message}`,
                {
                  autoClose: 10000,
                },
              );
              console.error(
                `Error Getting public URL followed by Error Deleting file: ${pathObject.path} ${error.message}`,
              );
            },
          });
        },
      });

      projectData.logo_url = url;
    }

    // upload project metadata
    const newProjectMetadata = await createProjectMutation.mutateAsync(
      projectData,
      {
        onError: (error) => {
          toast.error(`Error creating project: ${error.message}`);
          // Rollback any uploaded media
          if (projectData.logo_url) {
            const path = new URL(projectData.logo_url).pathname
              .split("/")
              .at(-1);
            if (path) {
              deleteMediaMutation.mutateAsync(path, {
                onError: (error) => {
                  toast.error(
                    `Error deleting uploaded media: ${error.message}`,
                  );
                },
              });
            }
          }
        },
      },
    );

    // upload trusted origins
    const trustedOriginsToAdd = trustedOrigins.map((origin) => ({
      name: origin,
      project_id: newProjectMetadata.id,
    }));
    await addTrustedOriginsMutation.mutateAsync(trustedOriginsToAdd, {
      onError: (error) => {
        toast.error(`Error adding trusted origins: ${error.message}`);
        // Rollback project creation if trusted origins fail
        deleteProjectMutation.mutateAsync(newProjectMetadata.id, {
          onError: (deleteError) => {
            toast.error(
              `Error deleting project after trusted origins failure: ${deleteError.message}`,
            );
            console.error(
              `Error deleting project after trusted origins failure: ${deleteError.message}`,
            );
          },
        });
      },
    });

    refreshProjects();
    router.push(`/projects/${newProjectMetadata.id}`);
  };

  return (
    <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
      <ProjectMetaData onSubmit={onSubmit} />
      <TrustedOrigins
        trustedOrigins={trustedOrigins}
        setTrustedOrigins={setTrustedOrigins}
      />
    </div>
  );
};
