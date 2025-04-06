import { Hono } from "hono";
import { authRoutes } from "./auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { communityRoutes } from "../modules/community/community.routes";
import { gatheringRoutes } from "../modules/gathering/gathering.routes";
import { resourceRoutes } from "../modules/resource/resource.routes";
import { postRoutes } from "../modules/post/post.routes";
import { replyRoutes } from "../modules/reply/reply.routes";
import { authMiddleware } from "../middleware/auth.middleware";

const routes = new Hono();

routes.get("/", (c) => c.text("RuangKita Backend!"));
routes.route("/auth", authRoutes);

const protectedRoutes = new Hono();
protectedRoutes.use("*", authMiddleware);
protectedRoutes.route("/users", userRoutes);
protectedRoutes.route("/communities", communityRoutes);
protectedRoutes.route("/gatherings", gatheringRoutes);
protectedRoutes.route("/resources", resourceRoutes);
protectedRoutes.route("/posts", postRoutes);
protectedRoutes.route("/replies", replyRoutes);

routes.route("/", protectedRoutes);

export { routes };
