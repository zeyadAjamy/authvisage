import z from "zod";

export const urlScheme = z.object({
  url: z.string().refine(
    (url) => {
      const urlPattern =
        /^(https?:\/\/)?(localhost(:\d+)?|127\.0\.0\.1(:\d+)?|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?)(\/.*)?$/;
      return urlPattern.test(url);
    },
    {
      message:
        "Invalid URL format. Must be a valid HTTP/HTTPS URL or localhost.",
    },
  ),
});

export type UrlScheme = z.infer<typeof urlScheme>;
