"use client";

import { useState } from "react";
import { TrustedOrigins } from "@/features/projects/components/trusted-origins";
import { ProjectMetaData, type ProjectFormValues } from "./metadata";
import { toast } from "react-toastify";
import { useMedia } from "@/hooks/use-media";
import { StorageBucket } from "@/lib/supabase/storage";
import { NewProject } from "@/features/projects/types";
import { useProject } from "@/features/projects/hooks/use-project";
import { useTrustedOrigins } from "@/features/projects/hooks/use-trusted-origins";
import { useRouter } from "next/navigation";

export const NewProjectForm = () => {
  const [trustedOrigins, setTrustedOrigins] = useState<string[]>([]);
  const {
    upload,
    getPublicUrl,
    delete: deleteMedia,
  } = useMedia(StorageBucket.PROJECTS);
  const { createProjectMutation } = useProject();
  const { addTrustedOriginMutation } = useTrustedOrigins();
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
      const pathObject = await upload.mutateAsync(data.media, {
        onError: (error) => {
          toast.error(`Error uploading media: ${error.message}`);
        },
      });

      const url = await getPublicUrl.mutateAsync(pathObject.path, {
        onError: (error) => {
          toast.error(`Error getting public URL: ${error.message}`);
          // Delete the file if we can't get the URL
          deleteMedia.mutateAsync(pathObject.path, {
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
        },
      },
    );

    // upload trusted origins
    const promises = trustedOrigins.map((origin) => {
      return addTrustedOriginMutation.mutateAsync({
        projectId: newProjectMetadata.id,
        name: origin,
      });
    });

    const originResults = await Promise.allSettled(promises);
    const anyFailed = originResults.some(
      (result) => result.status === "rejected",
    );
    const uploadedOriginNames = originResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value.name);
    const failedOrigins = trustedOrigins.filter(
      (origin) => !uploadedOriginNames.includes(origin),
    );

    if (anyFailed) {
      toast.warn(
        `Some trusted origins failed to upload: ${failedOrigins.join(", ")}`,
      );
    }

    // redirect to the project page
    toast.success("Project created successfully! Redirecting...", {
      autoClose: 5000,
    });

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
