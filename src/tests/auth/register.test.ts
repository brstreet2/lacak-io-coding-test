import { registerUser } from "../../controllers/auth/registerUser";
import { Request, Response } from "express";
import { isValidEmail } from "../../utils/isValidEmail";
import { isValidPassword } from "../../utils/isValidPassword";
import {
  findUserByEmail,
  createUserWithEmailAndPassword,
  addRefreshTokenToWhitelist,
} from "../../services/auth.services";
import { generateToken } from "../../utils/jwt";

jest.mock("../../services/auth.services");
jest.mock("../../utils/isValidEmail");
jest.mock("../../utils/isValidPassword");
jest.mock("../../utils/jwt");

describe("registerUser", () => {
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

    await registerUser(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Missing field email or password.",
    });
  });

  it("should return 400 if email is invalid", async () => {
    req.body = { email: "invalidemail", password: "Password123!" };
    (isValidEmail as jest.Mock).mockReturnValue(false);

    await registerUser(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Invalid email",
    });
  });

  it("should return 400 if password is invalid", async () => {
    req.body = { email: "test@example.com", password: "short" };
    (isValidEmail as jest.Mock).mockReturnValue(true);
    (isValidPassword as jest.Mock).mockReturnValue(false);

    await registerUser(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      message:
        "Password must be at least 5 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    });
  });

  it("should return 400 if email already exists", async () => {
    req.body = { email: "test@example.com", password: "Password123!" };
    (isValidEmail as jest.Mock).mockReturnValue(true);
    (isValidPassword as jest.Mock).mockReturnValue(true);
    (findUserByEmail as jest.Mock).mockResolvedValue({});

    await registerUser(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      message: "User with this email already exists",
    });
  });

  it("should return 201 with tokens on successful registration", async () => {
    req.body = { email: "test@example.com", password: "Password123!" };
    (isValidEmail as jest.Mock).mockReturnValue(true);
    (isValidPassword as jest.Mock).mockReturnValue(true);
    (findUserByEmail as jest.Mock).mockResolvedValue(null);
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      id: "123",
      email: "test@example.com",
    });
    (generateToken as jest.Mock).mockReturnValue({
      accessToken: "access_token",
      refreshToken: "refresh_token",
    });

    await registerUser(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      message: "User created successfully",
      data: {
        accessToken: "access_token",
        refreshToken: "refresh_token",
      },
    });
  });
});
