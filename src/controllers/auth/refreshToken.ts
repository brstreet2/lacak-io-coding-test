import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidV4 } from "uuid";
import {
  addRefreshTokenToWhitelist,
  deleteRefreshToken,
  findRefreshTokenById,
  findUserById,
} from "../../services/auth.services";
import { generateToken } from "../../utils/jwt";
import { hasToken } from "../../utils/hasToken";

type TPayload = {
  id: string;
  jti: string;
  userId: string;
};

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({
        message: "Missing refresh token",
      });
    }

    const secret = process.env.JWT_REFRESH_SECRET as string;

    let payload: TPayload;
    try {
      payload = jwt.verify(refresh_token, secret) as TPayload;
    } catch (error) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const savedRefreshToken = await findRefreshTokenById(payload.jti);

    if (!savedRefreshToken || savedRefreshToken.revoked) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const hashedToken = hasToken(refresh_token);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidV4();
    const { accessToken, refreshToken: newRefreshToken } = generateToken(
      payload.userId,
      jti
    );

    await addRefreshTokenToWhitelist({
      jti,
      refreshToken: newRefreshToken,
      userId: payload.userId,
    });

    return res.status(200).json({
      message: "Success",
      session: {
        accessToken: accessToken.token,
        expiresIn: accessToken.expiresIn,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
}
