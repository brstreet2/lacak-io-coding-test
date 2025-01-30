import { NextFunction, Request, Response } from "express";
import { findUserByToken } from "../services/auth.services";

export async function authenticate(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized", data: null });
  }

  try {
    const user = await findUserByToken(token);

    if (!user) {
      return res.status(401).json({ message: "Invalid token!", data: null });
    }

    req.user = {
      id: user.id,
      email: user.email,
      token: token,
      role: user.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", data: null });
  }
}
