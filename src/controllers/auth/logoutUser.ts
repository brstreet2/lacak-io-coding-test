import { Request, Response } from "express";
import { revokeTokens } from "../../services/auth.services";

export async function logoutUser(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "Access token is required" });
    }

    await revokeTokens(token);

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, error });
  }
}
