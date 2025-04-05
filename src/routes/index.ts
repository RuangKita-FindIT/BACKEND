import { Hono } from "hono";
import { authRoutes } from "./auth.routes";

const routes = new Hono();

routes.get("/", (c) => c.text("RuangKita Backend!"));

routes.route("/auth", authRoutes);

export { routes };
