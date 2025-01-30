import { refreshToken } from "../../controllers/auth/refreshToken";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  findRefreshTokenById,
  findUserById,
  deleteRefreshToken,
  addRefreshTokenToWhitelist,
} from "../../services/auth.services";
import { hasToken } from "../../utils/hasToken";
import { generateToken } from "../../utils/jwt";

jest.mock("jsonwebtoken");
jest.mock("../../services/auth.services");
jest.mock("../../utils/hasToken");
jest.mock("../../utils/jwt");

describe("refreshToken", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    req = {};
    res = {
      status: mockStatus,
    };
    jest.clearAllMocks();
  });

  it("should return 401 if refresh token is missing", async () => {
    req.body = {};

    await refreshToken(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Missing refresh token",
    });
  });

  it("should return 401 if refresh token is invalid", async () => {
    req.body = { refresh_token: "invalid_token" };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await refreshToken(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Invalid refresh token",
    });
  });

  it("should return 401 if refresh token is revoked or not found", async () => {
    req.body = { refresh_token: "valid_token" };
    (jwt.verify as jest.Mock).mockReturnValue({
      jti: "123",
      userId: "user123",
    });
    (findRefreshTokenById as jest.Mock).mockResolvedValue(null);

    await refreshToken(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Invalid refresh token",
    });
  });

  it("should return 401 if user is unauthorized", async () => {
    req.body = { refresh_token: "valid_token" };
    (jwt.verify as jest.Mock).mockReturnValue({
      jti: "123",
      userId: "user123",
    });
    (findRefreshTokenById as jest.Mock).mockResolvedValue({
      id: "123",
      revoked: false,
      hashedToken: "hashed_token",
    });
    (hasToken as jest.Mock).mockReturnValue("hashed_token");
    (findUserById as jest.Mock).mockResolvedValue(null);

    await refreshToken(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Unauthorized",
    });
  });

  it("should return 200 with new tokens on successful refresh", async () => {
    req.body = { refresh_token: "valid_token" };
    (jwt.verify as jest.Mock).mockReturnValue({
      jti: "123",
      userId: "user123",
    });
    (findRefreshTokenById as jest.Mock).mockResolvedValue({
      id: "123",
      revoked: false,
      hashedToken: "hashed_token",
    });
    (hasToken as jest.Mock).mockReturnValue("hashed_token");
    (findUserById as jest.Mock).mockResolvedValue({
      id: "user123",
      email: "test@example.com",
    });
    (generateToken as jest.Mock).mockReturnValue({
      accessToken: { token: "new_access_token", expiresIn: 3600 },
      refreshToken: "new_refresh_token",
    });
    (deleteRefreshToken as jest.Mock).mockResolvedValue(undefined);
    (addRefreshTokenToWhitelist as jest.Mock).mockResolvedValue(undefined);

    await refreshToken(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Success",
      session: {
        accessToken: "new_access_token",
        expiresIn: 3600,
        refreshToken: "new_refresh_token",
        user: {
          id: "user123",
          email: "test@example.com",
        },
      },
    });
  });
});
