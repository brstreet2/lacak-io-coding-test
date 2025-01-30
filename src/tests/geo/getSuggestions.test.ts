import { getSuggestions } from "../../services/geo.services";
import { haversineDistance } from "../../utils/haversine";
import { db } from "../../utils/db";

jest.mock("../../utils/haversine");
jest.mock("../../utils/db", () => ({
  db: {
    geoname: {
      findMany: jest.fn(),
    },
  },
}));

describe("getSuggestions", () => {
  it("should return suggestions sorted by score", async () => {
    // Mock data from the database
    const mockDbResults = [
      {
        name: "London",
        latitude: 51.5074,
        longitude: -0.1278,
        country_code: "GB",
        admin1_code: "ENG",
      },
      {
        name: "Londonderry",
        latitude: 55.0068,
        longitude: -7.3183,
        country_code: "GB",
        admin1_code: "NI",
      },
    ];

    // Mock the database query
    (db.geoname.findMany as jest.Mock).mockResolvedValue(mockDbResults);

    // Mock haversineDistance
    (haversineDistance as jest.Mock).mockImplementation(
      ({ latitude, longitude }, target) => {
        if (target.latitude === 51.5074 && target.longitude === -0.1278)
          return 50;
        if (target.latitude === 55.0068 && target.longitude === -7.3183)
          return 100;
        return 0;
      }
    );

    const suggestions = await getSuggestions({
      query: "London",
      latitude: 51.5074,
      longitude: -0.1278,
    });

    expect(suggestions).toEqual([
      {
        name: "London, ENG, GB",
        latitude: "51.50740",
        longitude: "-0.12780",
        score: 1, // Weighted score calculation
      },
      {
        name: "Londonderry, NI, GB",
        latitude: "55.00680",
        longitude: "-7.31830",
        score: 0.7, // Lower score due to distance
      },
    ]);

    // Ensure database query is called with the correct parameters
    expect(db.geoname.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: "London", mode: "insensitive" } },
          { asciiname: { contains: "London", mode: "insensitive" } },
          { alternatenames: { contains: "London", mode: "insensitive" } },
        ],
      },
      take: 10,
    });

    // Ensure haversineDistance is called for proximity score
    expect(haversineDistance).toHaveBeenCalledTimes(2);
  });

  it("should handle empty query results", async () => {
    // Mock an empty database response
    (db.geoname.findMany as jest.Mock).mockResolvedValue([]);

    const suggestions = await getSuggestions({
      query: "NonExistentCity",
      latitude: 0,
      longitude: 0,
    });

    expect(suggestions).toEqual([]);
  });

  it("should prioritize name match over proximity if scores are close", async () => {
    const mockDbResults = [
      {
        name: "London",
        latitude: 51.5074,
        longitude: -0.1278,
        country_code: "GB",
        admin1_code: "ENG",
      },
      {
        name: "Londonville",
        latitude: 52.0,
        longitude: -0.1,
        country_code: "US",
        admin1_code: "NY",
      },
    ];

    // Mock the database response
    (db.geoname.findMany as jest.Mock).mockResolvedValue(mockDbResults);

    // Mock haversineDistance
    (haversineDistance as jest.Mock).mockImplementation(() => 10);

    const suggestions = await getSuggestions({
      query: "London",
      latitude: 51.5074,
      longitude: -0.1278,
    });

    expect(suggestions[0].name).toContain("London, ENG, GB");
  });
});
