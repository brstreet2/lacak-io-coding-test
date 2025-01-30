import { Router } from "express";
import * as Controller from "../controllers/auth";

const routes = Router();

routes.post("/register", Controller.registerUser);
routes.post("/login", Controller.loginUser);
routes.post("/logout", Controller.logoutUser);
routes.post("/refresh", Controller.refreshToken);

export default routes;
