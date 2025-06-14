import z from "zod";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB

export const updateInfoSchema = z.object({
  avatar: z
    .any()
    .refine(
      (value) => {
        if (typeof value === "string") {
          return z.string().url().safeParse(value).success;
        }
        if (value instanceof File) {
          return value.size > 0 && value.size <= MAX_AVATAR_SIZE; // Ensure file is not empty and within size limit
        }
      },
      {
        message: "Avatar must be a valid file or empty",
      },
    )
    .optional()
    .nullable(),
  fullname: z
    .string()
    .min(3, { message: "Name is too short" })
    .max(50, { message: "Name is too long" }),
  email: z.string().email({
    message: "Invalid email address",
  }),
});

export type UpdateInfoScheme = z.infer<typeof updateInfoSchema>;
