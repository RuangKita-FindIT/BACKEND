import { Hono } from "hono";
import { ResourceService } from "./resource.service";
import { ResourceController } from "./resource.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const resourceRoutes = new Hono();
const resourceService = new ResourceService();
const resourceController = new ResourceController(resourceService);

resourceRoutes.use("*", authMiddleware);

resourceRoutes.get("/:id", (c) => resourceController.getResourceById(c));

resourceRoutes.get("/community/:communityId", (c) =>
  resourceController.getResourcesByCommunityId(c)
);

resourceRoutes.get("/user/me", (c) => resourceController.getUserResources(c));

resourceRoutes.post("/", (c) => resourceController.createResource(c));

resourceRoutes.put("/:id", (c) => resourceController.updateResource(c));

resourceRoutes.delete("/:id", (c) => resourceController.deleteResource(c));

export { resourceRoutes };
