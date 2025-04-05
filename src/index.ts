import { Hono } from "hono";
import { routes } from "./routes";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.route("/", routes);

export default {
  port: 3000,
  fetch: app.fetch,
};
