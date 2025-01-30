import { Request, Response } from "express";
import { isValidEmail } from "../../utils/isValidEmail";
import { isValidPassword } from "../../utils/isValidPassword";
import {
  addRefreshTokenToWhitelist,
  createUserWithEmailAndPassword,
  findUserByEmail,
} from "../../services/auth.services";
import { v4 as uuidV4 } from "uuid";
import { generateToken } from "../../utils/jwt";

export type BodyRequest = {
  email: string;
  password: string;
};

export async function registerUser(req: Request, res: Response) {
  try {
    // Check body request
    const { email, password } = req.body as BodyRequest;
    if (!email || !password) {
      return res.status(400).json({
        message: "Missing field email or password.",
      });
    }

    // Check if email is valid
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    // Check if password is valid
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 5 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    // Check if email already exists
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Create user
    const user = await createUserWithEmailAndPassword({
      password: req.body.password,
      email: req.body.email,
    });

    const jti = uuidV4();
    const { accessToken, refreshToken } = generateToken(user.id as string, jti);
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: user.id,
    });

    return res.status(201).json({
      message: "User created successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
}
