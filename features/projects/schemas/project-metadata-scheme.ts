import { z } from "zod";

export const projectMetadataSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  media: z
    .any()
    .optional()
    .refine((file) => {
      if (file) {
        const isValidFile = file instanceof File;
        return isValidFile;
      }
      return true;
    }, "Invalid file type"),
});
