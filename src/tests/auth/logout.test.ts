import { logoutUser } from "../../controllers/auth/logoutUser";
import { Request, Response } from "express";
import { revokeTokens } from "../../services/auth.services";

jest.mock("../../services/auth.services");

describe("logoutUser", () => {
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

  it("should return 400 if token is missing", async () => {
    req.headers = {};

    await logoutUser(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Access token is required",
    });
  });

  it("should return 200 on successful logout", async () => {
    req.headers = {
      authorization: "Bearer valid_token",
    };
    (revokeTokens as jest.Mock).mockResolvedValue(undefined);

    await logoutUser(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Logged out successfully",
    });
  });

  it("should return 500 on error", async () => {
    req.headers = {
      authorization: "Bearer valid_token",
    };
    (revokeTokens as jest.Mock).mockRejectedValue(new Error("Database error"));

    await logoutUser(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Database error",
      error: expect.any(Error),
    });
  });
});
