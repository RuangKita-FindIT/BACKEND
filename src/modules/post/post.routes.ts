import { Hono } from "hono";
import { PostService } from "./post.service";
import { PostController } from "./post.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const postRoutes = new Hono();
const postService = new PostService();
const postController = new PostController(postService);

postRoutes.use("*", authMiddleware);

postRoutes.get("/:id", (c) => postController.getPostById(c));

postRoutes.get("/:id/replies", (c) => postController.getPostReplies(c));

postRoutes.get("/user/me", (c) => postController.getUserPosts(c));

postRoutes.post("/", (c) => postController.createPost(c));

postRoutes.put("/:id", (c) => postController.updatePost(c));

postRoutes.delete("/:id", (c) => postController.deletePost(c));

export { postRoutes };
