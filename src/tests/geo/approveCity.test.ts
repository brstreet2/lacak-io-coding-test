import { Request, Response } from "express";
import { approveCity } from "../../controllers/geo";
import { approveGeo, findGeoById } from "../../services/geo.services";

jest.mock("../../services/geo.services");

describe("approveCity Controller", () => {
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

  it("should approve a city when valid id is provided", async () => {
    const mockGeo = { geonameid: 1, name: "Test City" };
    (findGeoById as jest.Mock).mockResolvedValue(mockGeo);
    (approveGeo as jest.Mock).mockResolvedValue({
      ...mockGeo,
      is_approved: true,
    });

    req.params = { id: "1" };

    await approveCity(req as Request, res as Response);

    expect(findGeoById).toHaveBeenCalledWith(1);
    expect(approveGeo).toHaveBeenCalledWith(1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Geo city approved successfully!",
      data: { ...mockGeo, is_approved: true },
    });
  });

  it("should return 404 if geo data is not found", async () => {
    (findGeoById as jest.Mock).mockResolvedValue(null);

    req.params = { id: "1" };

    await approveCity(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ message: "Geo data not found" });
  });

  it("should handle service errors", async () => {
    (findGeoById as jest.Mock).mockResolvedValue({ geonameid: 1 });
    (approveGeo as jest.Mock).mockRejectedValue(new Error("Service error"));

    req.params = { id: "1" };

    await approveCity(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Error creating data",
      error: "Service error",
    });
  });
});
