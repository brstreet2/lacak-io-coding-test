import { haversineDistance } from "../utils/haversine";
import { db } from "../utils/db";
import { geoname } from "@prisma/client";

interface SearchOptions {
  query: string;
  latitude?: number;
  longitude?: number;
}

export interface GeoData {
  name: string;
  asciiname?: string;
  alternatenames?: string;
  latitude: string;
  longitude: string;
  feature_class?: string;
  feature_code?: string;
  country_code: string;
  cc2?: string;
  admin1_code?: string;
  admin2_code?: string;
  admin3_code?: string;
  admin4_code?: string;
  population: number;
  elevation?: number;
  dem?: number;
  timezone?: string;
  modification_date?: Date;
}

export const findGeoById = async (id: geoname["geonameid"]) => {
  return db.geoname.findFirst({
    where: {
      geonameid: id,
    },
  });
};

export const createGeo = async (data: GeoData) => {
  return db.geoname.create({
    data: {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      name: data.name,
      admin1_code: data.admin1_code ?? undefined,
      admin2_code: data.admin2_code ?? undefined,
      admin3_code: data.admin3_code ?? undefined,
      admin4_code: data.admin4_code ?? undefined,
      alternatenames: data.alternatenames ?? data.name,
      asciiname: data.asciiname ?? data.name,
      cc2: data.cc2 ?? undefined,
      country_code: data.country_code,
      dem: data.dem ?? undefined,
      elevation: data.elevation ?? undefined,
      feature_class: data.feature_class ?? "P",
      feature_code: data.feature_code ?? "PPL",
      modification_date: data.modification_date ?? undefined,
      population: data.population,
      timezone: data.timezone ?? undefined,
      is_approved: false,
    },
  });
};

export const approveGeo = async (id: geoname["geonameid"]) => {
  return db.geoname.update({
    where: {
      geonameid: id,
    },
    data: {
      is_approved: true,
    },
  });
};

export const getSuggestions = async ({
  query,
  latitude,
  longitude,
}: SearchOptions) => {
  const results = await db.geoname.findMany({
    where: {
      is_approved: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { asciiname: { contains: query, mode: "insensitive" } },
        { alternatenames: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
  });

  const scoredResults = results.map((geoname) => {
    // Step 1: Query relevance score
    const nameMatchScore =
      query.toLowerCase() === geoname.name.toLowerCase()
        ? 1
        : query.length / geoname.name.length;

    // Step 2: Proximity score
    let proximityScore = 0;
    if (latitude !== undefined && longitude !== undefined) {
      const distance = haversineDistance(
        { latitude, longitude },
        { latitude: geoname.latitude, longitude: geoname.longitude }
      );
      proximityScore = Math.max(0, 1 - distance / 1000); // Normalize for scores
    }

    // Step 3: Weighted total score
    const totalScore = 0.7 * nameMatchScore + 0.3 * proximityScore;

    // Step 4: Round the score up to nearest precision (e.g., 1 decimal place)
    const roundedScore = Math.ceil(totalScore * 10) / 10; // Round up to 1 decimal place

    return {
      name: `${geoname.name}${
        geoname.admin1_code ? `, ${geoname.admin1_code}` : ""
      }, ${geoname.country_code}`,
      latitude: geoname.latitude.toFixed(5),
      longitude: geoname.longitude.toFixed(5),
      score: roundedScore, // Normalize to 2 decimal places
    };
  });

  // Sort results by score and return the top 4
  return scoredResults.sort((a, b) => b.score - a.score).slice(0, 4);
};
