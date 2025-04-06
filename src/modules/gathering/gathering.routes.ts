import { Hono } from "hono";
import { GatheringService } from "./gathering.service";
import { GatheringController } from "./gathering.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const gatheringRoutes = new Hono();
const gatheringService = new GatheringService();
const gatheringController = new GatheringController(gatheringService);

gatheringRoutes.use("*", authMiddleware);

gatheringRoutes.get("/:id", (c) => gatheringController.getGatheringById(c));
gatheringRoutes.get("/community/:communityId", (c) =>
  gatheringController.getGatheringsByCommunityId(c)
);
gatheringRoutes.post("/", (c) => gatheringController.createGathering(c));
gatheringRoutes.put("/:id", (c) => gatheringController.updateGathering(c));
gatheringRoutes.delete("/:id", (c) => gatheringController.deleteGathering(c));

export { gatheringRoutes };
