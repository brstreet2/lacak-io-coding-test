import { Router } from "express";
import * as Controller from "../controllers/geo";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/requireRole.middleware";
import { USER_ROLE } from "@prisma/client";

const routes = Router();

routes.get("/suggestions", authenticate, Controller.getCitySuggestions);
routes.post(
  "/approve/:id",
  authenticate,
  requireRole(USER_ROLE.COMMUNITY_MODERATOR),
  Controller.approveCity
);
routes.post("/create", authenticate, Controller.createCity);

export default routes;
