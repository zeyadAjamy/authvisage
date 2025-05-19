export const validateOriginsUrl = (url: string): boolean => {
  // Updated pattern to handle localhost and IP addresses
  const urlPattern =
    /^(https?:\/\/)?(localhost(:\d+)?|127\.0\.0\.1(:\d+)?|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?)(\/.*)?$/;
  return urlPattern.test(url);
};
