import { User } from "../../node_modules/.prisma/client";
import bcrypt from "bcrypt";
import { db } from "../utils/db";
import { hasToken } from "../utils/hasToken";

/**
 * Digunakan untuk menambahkan refresh token ke dalam database.
 */
export const addRefreshTokenToWhitelist = ({
  jti,
  refreshToken,
  userId,
}: {
  jti: string;
  refreshToken: string;
  userId: string;
}) => {
  return db.refreshToken.create({
    data: {
      id: jti,
      hashedToken: hasToken(refreshToken),
      userId,
    },
  });
};

/**
 * Digunakan untuk mengecek apakah refresh token sudah ada di dalam database.
 */
export const findRefreshTokenById = (id: string) => {
  return db.refreshToken.findUnique({ where: { id } });
};

/**
 * Digunakan untuk menghapus refresh token dari database setelah digunakan.
 */
export const deleteRefreshToken = (id: string) => {
  return db.refreshToken.update({
    where: { id },
    data: { revoked: true },
  });
};

/**
 * Digunakan untuk menghapus semua refresh token yang dimiliki oleh user.
 */
export const revokeTokens = (token: string) => {
  return db.refreshToken.updateMany({
    where: { hashedToken: token },
    data: { revoked: true },
  });
};

export const createUserWithEmailAndPassword = (
  user: Pick<User, "email" | "password">
) => {
  if (!user.password) {
    throw new Error("Password is required");
  }
  const password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: {
      email: user.email,
      password,
    },
  });
};

export const findUserByEmail = (email: User["email"]) => {
  return db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
    },
  });
};

export const findUserById = (id: User["id"]) => {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
    },
  });
};

export const findUserByToken = (token: User["access_token"]) => {
  return db.user.findFirst({
    where: { access_token: token },
    select: { id: true, email: true, role: true },
  });
};

export const updateUserHandler = async (
  id: string,
  data: {
    email?: string;
    password?: string;
    token?: string;
  }
) => {
  const { email, password, token } = data;

  let hashedPassword: string;

  if (password) {
    hashedPassword = bcrypt.hashSync(password, 12);
  }

  const updatedUser = await db.$transaction(async (db) => {
    const userUpdate = await db.user.update({
      where: { id },
      data: {
        email: email ?? undefined,
        access_token: token ?? undefined,
        password: password ? hashedPassword : undefined,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return { ...userUpdate };
  });

  return updatedUser;
};
