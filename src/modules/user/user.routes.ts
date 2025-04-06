import { Hono } from "hono";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const userRoutes = new Hono();
const userService = new UserService();
const userController = new UserController(userService);

userRoutes.use("*", authMiddleware);

userRoutes.get("/", (c) => userController.getCurrentUser(c));

userRoutes.get("/profile", (c) => userController.getUserProfile(c));

userRoutes.put("/profile", (c) => userController.updateUserProfile(c));

userRoutes.get("/communities", (c) => userController.getUserCommunities(c));

export { userRoutes };
