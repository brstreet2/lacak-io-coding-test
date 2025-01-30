import { createCity } from "../../controllers/geo/createCity";
import { createGeo } from "../../services/geo.services";
import { Request, Response } from "express";

jest.mock("../../services/geo.services");

describe("createCity", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();

    req = {
      body: {
        name: "Test City",
        latitude: "12.3456",
        longitude: "78.9012",
        population: 5000,
        country_code: "TC",
      },
    };

    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a city successfully", async () => {
    const mockCity = {
      id: 1,
      ...req.body,
    };

    (createGeo as jest.Mock).mockResolvedValue(mockCity);

    await createCity(req as Request, res as Response);

    expect(createGeo).toHaveBeenCalledWith(req.body);
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Geo city created successfully",
      data: mockCity,
    });
  });

  it("should return 400 if required fields are missing", async () => {
    req.body = {
      population: 5000,
    };

    await createCity(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Missing fields: name, country_code, latitude, longitude",
    });
    expect(createGeo).not.toHaveBeenCalled();
  });

  it("should return 500 if createGeo throws an error", async () => {
    const error = new Error("Database error");

    (createGeo as jest.Mock).mockRejectedValue(error);

    await createCity(req as Request, res as Response);

    expect(createGeo).toHaveBeenCalledWith(req.body);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Error creating data",
      error: error.message,
    });
  });
});
