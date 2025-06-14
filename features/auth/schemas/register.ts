import { z } from "zod";

export const registrationSchema = z
  .object({
    fullname: z.string().min(3, { message: "Name is too short" }),
    email: z.string().email({
      message: "Invalid email address",
    }),
    password: z
      .string()
      .min(8, { message: "Password is too short" })
      .refine(
        (value) => {
          return (
            value.match(/[a-z]/) &&
            value.match(/[A-Z]/) &&
            value.match(/[0-9]/) &&
            value.match(/!|@|#|\$|%|\^|&|\*|\(|\)|-|\+|_/)
          );
        },
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
      ),
    confirm_password: z.string().min(8, { message: "Password is too short" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type RegistrationFormSchema = z.infer<typeof registrationSchema>;
