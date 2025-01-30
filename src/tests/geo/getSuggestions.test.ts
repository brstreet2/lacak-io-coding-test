import { Request, Response } from "express";
import { getCitySuggestions } from "../../controllers/geo";
import { getSuggestions } from "../../services/geo.services";

jest.mock("../../services/geo.services");

describe("getCitySuggestions Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn(() => res as Response);
    req = {};
    res = { json: mockJson, status: mockStatus };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return city suggestions for a valid query", async () => {
    const mockSuggestions = [
      { name: "City A", latitude: "10.123", longitude: "20.456", score: 0.9 },
      { name: "City B", latitude: "30.123", longitude: "40.456", score: 0.8 },
    ];

    (getSuggestions as jest.Mock).mockResolvedValue(mockSuggestions);

    req.query = { q: "City" };

    await getCitySuggestions(req as Request, res as Response);

    expect(getSuggestions).toHaveBeenCalledWith({
      query: "City",
      latitude: undefined,
      longitude: undefined,
    });
    expect(mockJson).toHaveBeenCalledWith({ suggestions: mockSuggestions });
  });

  it("should return 400 if query parameter is missing", async () => {
    req.query = {};

    await getCitySuggestions(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Query parameter 'q' is required.",
    });
  });

  it("should handle service errors", async () => {
    (getSuggestions as jest.Mock).mockRejectedValue(new Error("Service error"));

    req.query = { q: "City" };

    await getCitySuggestions(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Something wrong with the server.",
    });
  });
});
