import { Request, Response } from "express";
import { createGeo, GeoData } from "../../services/geo.services";

export async function createCity(req: Request, res: Response) {
  const {
    name,
    asciiname,
    alternatenames,
    latitude,
    longitude,
    feature_class,
    feature_code,
    country_code,
    cc2,
    admin1_code,
    admin2_code,
    admin3_code,
    admin4_code,
    population,
    elevation,
    dem,
    timezone,
    modification_date,
  }: GeoData = req.body;

  const missingFields: string[] = [];

  if (!name) missingFields.push("name");
  if (!population) missingFields.push("population");
  if (!country_code) missingFields.push("country_code");
  if (!latitude) missingFields.push("latitude");
  if (!longitude) missingFields.push("longitude");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing fields: ${missingFields.join(", ")}`,
    });
  }

  try {
    const project = await createGeo(req.body);
    return res.status(201).json({
      message: "Geo city created successfully",
      data: project,
    });
  } catch (error: ReferenceError | any) {
    return res.status(500).json({
      message: "Error creating data",
      error: error.message,
    });
  }
}
