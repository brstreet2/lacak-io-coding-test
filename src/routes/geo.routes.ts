import { Router } from "express";
import * as Controller from "../controllers/geo";
import { authenticate } from "../middlewares/auth.middleware";

const routes = Router();

routes.get("/suggestions", authenticate, Controller.getCitySuggestions);
routes.post("/create", authenticate, Controller.createCity);

export default routes;
