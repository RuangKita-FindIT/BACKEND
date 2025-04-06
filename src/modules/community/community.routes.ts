import { Hono } from "hono";
import { CommunityService } from "./community.service";
import { CommunityController } from "./community.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const communityRoutes = new Hono();
const communityService = new CommunityService();
const communityController = new CommunityController(communityService);

communityRoutes.use("*", authMiddleware);

communityRoutes.get("/", (c) => communityController.getAllCommunities(c));
communityRoutes.get("/:id", (c) => communityController.getCommunityById(c));
communityRoutes.get("/:id/posts", (c) =>
  communityController.getCommunityPosts(c)
);
communityRoutes.get("/:id/resources", (c) =>
  communityController.getCommunityResources(c)
);
communityRoutes.post("/", (c) => communityController.createCommunity(c));
communityRoutes.put("/:id", (c) => communityController.updateCommunity(c));
communityRoutes.delete("/:id", (c) => communityController.deleteCommunity(c));

export { communityRoutes };
