"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { projectMetadataSchema } from "@/features/projects/schemas/project-metadata-scheme";
import { UploadMedia } from "@/components/upload-media";
import type { Project } from "@/features/projects/types";

export interface ProjectFormValues {
  name: string;
  description: string;
  media?: File | null;
}

interface ProjectFormProps {
  project?: Project;
  submitLabel?: string;
  onSubmit: (data: ProjectFormValues) => void;
}

export const ProjectMetaData = ({
  project,
  submitLabel = "Save",
  onSubmit,
}: ProjectFormProps) => {
  const form = useForm({
    resolver: zodResolver(projectMetadataSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      media: project?.logo_url || null,
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="bg-card flex flex-col gap-4 rounded-md border p-6"
    >
      <UploadMedia
        media={form.watch("media")}
        acceptList={["image"]}
        setMedia={(file) => form.setValue("media", file)}
        allowFullScreen
      />
      <div className="flex flex-col gap-2">
        <label
          htmlFor="name"
          className="font-medium"
        >
          Project Name
        </label>
        <Input
          id="name"
          placeholder="Enter project name"
          className="py-5"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <label
          htmlFor="description"
          className="font-medium"
        >
          Project Description
        </label>
        <Textarea
          id="description"
          placeholder="Enter project description"
          rows={4}
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-fit gap-2 self-end"
      >
        {form.formState.isSubmitting ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
};
