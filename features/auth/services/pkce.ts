/**
 * PKCE Challenge Pair structure
 */
export interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
}

/**
 * SHA-256 hash a string and encode it in Base64URL (without padding)
 * @param inputStr - The string to hash and encode
 * @returns Base64URL encoded SHA-256 hash without padding
 */
export const sha256Base64UrlEncode = async (
  inputStr: string,
): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(inputStr);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const base64 = Buffer.from(hash).toString("base64");

  // Convert to base64url by replacing chars and removing padding
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

// Update the generatePkce function to use the new helper
export const generatePkce = async (): Promise<PKCEPair> => {
  const codeVerifier = crypto.randomUUID();
  const codeChallenge = await sha256Base64UrlEncode(codeVerifier);
  return { codeVerifier, codeChallenge };
};
