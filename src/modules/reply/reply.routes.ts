import { Hono } from "hono";
import { ReplyService } from "./reply.service";
import { ReplyController } from "./reply.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const replyRoutes = new Hono();
const replyService = new ReplyService();
const replyController = new ReplyController(replyService);

replyRoutes.use("*", authMiddleware);

replyRoutes.get("/:id", (c) => replyController.getReplyById(c));

replyRoutes.get("/user/me", (c) => replyController.getUserReplies(c));

replyRoutes.post("/", (c) => replyController.createReply(c));

replyRoutes.put("/:id", (c) => replyController.updateReply(c));

replyRoutes.delete("/:id", (c) => replyController.deleteReply(c));

export { replyRoutes };
