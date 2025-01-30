import jwt from "jsonwebtoken";

/**
 * Generate an access token for a user
 * Ussualy i keep the token between 15-30 minutes
 */
export function generateAccessToken(userId: string) {
  const secret = process.env.JWT_ACCESS_SECRET as string;
  const token = jwt.sign({ userId }, secret, {
    expiresIn: "24h",
  });
  const decoded = jwt.decode(token) as jwt.JwtPayload;

  return { token, expiresIn: decoded.exp };
}

/**
 * I choosed 8 hours i prefer to make the user login again again each day.
 * But keep him logged in if he is using the app.
 * You can change this value depending on your app logic.
 * I would go for a maximum 7 days, and make him login again after 7 days inactivity.
 */
export function generateRefreshToken(userId: string, jti: string) {
  const secret = process.env.JWT_REFRESH_SECRET as string;
  return jwt.sign({ userId, jti }, secret, { expiresIn: "8h" });
}

/**
 * Generate a token for email verification
 * This token will be used to verify the user email
 */
export function generateToken(userId: string, jti: string) {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId, jti);
  return { accessToken, refreshToken };
}

export function decodeToken(token: string) {
  try {
    const secret = process.env.JWT_ACCESS_SECRET as string;
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    return decoded.userId;
  } catch (error) {
    throw new Error("Invalid token");
  }
}
