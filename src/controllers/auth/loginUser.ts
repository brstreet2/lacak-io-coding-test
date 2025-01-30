import { Request, Response } from "express";
import { BodyRequest } from "./registerUser";
import { isValidEmail } from "../../utils/isValidEmail";
import {
  addRefreshTokenToWhitelist,
  findUserByEmail,
  updateUserHandler,
} from "../../services/auth.services";
import bcrypt from "bcrypt";
import { v4 as uuidV4 } from "uuid";
import { generateToken } from "../../utils/jwt";

export async function loginUser(req: Request, res: Response) {
  try {
    // Check body request
    const { email, password } = req.body as BodyRequest;
    if (!email || !password) {
      return res.status(400).json({
        message: "Missing email or password",
      });
    }

    const user = await findUserByEmail(email);

    // Check if user exists
    if (!user) {
      return res.status(400).json({
        message: "User with email does not exist",
      });
    }

    // Check if password is correct
    const isMatchedPassword = await bcrypt.compare(password, user.password!);
    if (!isMatchedPassword) {
      return res.status(403).json({
        message: "Password is incorrect",
      });
    }

    // Generate token
    const jti = uuidV4();
    const { accessToken, refreshToken } = generateToken(user.id as string, jti);
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: user.id,
    });

    await updateUserHandler(user.id, { token: accessToken.token });

    // Return token
    return res.status(200).json({
      message: "Login successfully",
      data: {
        accessToken: accessToken.token,
        expiresIn: accessToken.expiresIn,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    });
  } catch (error: any) {
    // Return error
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
}
