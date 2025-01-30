import crypto from "crypto";

export function hasToken(token: string) {
  return crypto.createHash("sha512").update(token).digest("hex");
}
