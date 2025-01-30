import { Request, Response } from "express";
import { createCity } from "../../controllers/geo";
import { createGeo } from "../../services/geo.services";

jest.mock("../../services/geo.services");

describe("createCity Controller", () => {
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

  it("should create a new city when valid data is provided", async () => {
    const mockGeoData = {
      name: "New City",
      population: 1000,
      country_code: "US",
      latitude: "37.7749",
      longitude: "-122.4194",
    };

    (createGeo as jest.Mock).mockResolvedValue(mockGeoData);

    req.body = mockGeoData;

    await createCity(req as Request, res as Response);

    expect(createGeo).toHaveBeenCalledWith(mockGeoData);
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Geo city created successfully",
      data: mockGeoData,
    });
  });

  it("should return 400 if required fields are missing", async () => {
    req.body = { name: "City", population: 1000 };

    await createCity(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Missing fields: country_code, latitude, longitude",
    });
  });

  it("should handle service errors", async () => {
    (createGeo as jest.Mock).mockRejectedValue(new Error("Service error"));

    req.body = {
      name: "City",
      population: 1000,
      country_code: "US",
      latitude: "37.7749",
      longitude: "-122.4194",
    };

    await createCity(req as Request, res as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Error creating data",
      error: "Service error",
    });
  });
});
