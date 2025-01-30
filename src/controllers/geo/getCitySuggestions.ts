import { Request, Response } from "express";
import { getSuggestions } from "../../services/geo.services";

export async function getCitySuggestions(req: Request, res: Response) {
  try {
    const { q: query, latitude, longitude } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ error: "Query parameter 'q' is required." });
    }

    const suggestions = await getSuggestions({
      query: query as string,
      latitude: latitude ? parseFloat(latitude as string) : undefined,
      longitude: longitude ? parseFloat(longitude as string) : undefined,
    });

    return res.json({ suggestions });
  } catch (error) {
    return res.status(500).json({ error: "Something wrong with the server." });
  }
}
