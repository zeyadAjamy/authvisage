"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { projectMetadataSchema } from "@/features/projects/schemes/project-metadata-scheme";
import { UploadMedia } from "@/components/upload-media";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-card flex flex-col gap-4 rounded-md border p-6"
      >
        <FormField
          control={form.control}
          name="media"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel className="font-medium">Project Logo</FormLabel>
              <UploadMedia
                media={field.value}
                acceptList={["image"]}
                setMedia={(file) => field.onChange(file)}
                allowFullScreen
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel className="font-medium">Project Name</FormLabel>
              <Input
                placeholder="Enter project name"
                className="py-5"
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel className="font-medium">Project Description</FormLabel>
              <Textarea
                placeholder="Enter project description"
                rows={4}
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
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
    </Form>
  );
};
