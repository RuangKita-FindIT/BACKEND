import { Hono } from "hono";
import { authRoutes } from "./auth.routes";
import { userRoutes } from "../modules/user/user.routes";

const routes = new Hono();

routes.get("/", (c) => c.text("RuangKita Backend!"));

routes.route("/auth", authRoutes);
routes.route("/users", userRoutes);

export { routes };
