import { generateSecret, generateURI, verifySync } from "otplib";

export function newTotpSecret(): string {
  return generateSecret();
}

export function totpURI(username: string, secret: string): string {
  return generateURI({ strategy: "totp", label: username, issuer: "AfvalApp", secret });
}

export function totpVerify(token: string, secret: string): boolean {
  const result = verifySync({ token: token.replace(/\s/g, ""), secret });
  return result.valid;
}
