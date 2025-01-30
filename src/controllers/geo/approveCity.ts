import { Request, Response } from "express";
import { approveGeo, findGeoById } from "../../services/geo.services";

export const approveCity = async (req: Request, res: Response) => {
  // Get geo details
  const geo = await findGeoById(parseInt(req.params.id));
  if (!geo) {
    return res.status(404).json({ message: "Geo data not found" });
  }
  try {
    const data = await approveGeo(geo.geonameid);
    return res.status(200).json({
      message: "Geo city approved successfully!",
      data,
    });
  } catch (error: ReferenceError | any) {
    if (error.status === 404) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Error creating data",
      error: error.message,
    });
  }
};
