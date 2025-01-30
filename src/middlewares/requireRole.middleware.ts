import { NextFunction, Request, Response } from "express";

export function requireRole(...role: string[]) {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!role.includes(user.role)) {
      return res
        .status(403)
        .json({ message: `You are not ${role}!`, data: null });
    }
    next();
  };
}
