import dotenv from "dotenv";
import express, { Request, Response } from "express";
import * as routes from "./routes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.json({ limit: "11mb" }));
app.use(express.urlencoded({ limit: "11mb", extended: true }));
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "OK" });
});
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "API is running." });
});

// Routes
app.use("/api/v1/geo", routes.geoRoutes);
app.use("/api/v1/auth", routes.authRoutes);

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
