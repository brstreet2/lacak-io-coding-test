import { loginUser } from "../../controllers/auth/loginUser";
import { Request, Response } from "express";
import {
  findUserByEmail,
  addRefreshTokenToWhitelist,
  updateUserHandler,
} from "../../services/auth.services";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt";

jest.mock("../../services/auth.services");
jest.mock("bcrypt");
jest.mock("../../utils/jwt");

describe("loginUser", () => {
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

  it("should return 400 if email or password is missing", async () => {
    req.body = { email: "", password: "" };

    await loginUser(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Missing email or password",
    });
  });

  it("should return 400 if user does not exist", async () => {
    req.body = { email: "test@example.com", password: "password" };
    (findUserByEmail as jest.Mock).mockResolvedValue(null);

    await loginUser(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      message: "User with email does not exist",
    });
  });

  it("should return 403 if password is incorrect", async () => {
    req.body = { email: "test@example.com", password: "wrongpassword" };
    (findUserByEmail as jest.Mock).mockResolvedValue({
      password: "hashedpassword",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await loginUser(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Password is incorrect",
    });
  });

  it("should return 200 with tokens and user data on successful login", async () => {
    req.body = { email: "test@example.com", password: "correctpassword" };
    (findUserByEmail as jest.Mock).mockResolvedValue({
      id: "123",
      email: "test@example.com",
      password: "hashedpassword",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (generateToken as jest.Mock).mockReturnValue({
      accessToken: { token: "access_token", expiresIn: 3600 },
      refreshToken: "refresh_token",
    });

    await loginUser(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Login successfully",
      data: {
        accessToken: "access_token",
        expiresIn: 3600,
        refreshToken: "refresh_token",
        user: {
          id: "123",
          email: "test@example.com",
        },
      },
    });
  });
});
