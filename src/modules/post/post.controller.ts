import { Context } from "hono";
import { PostService } from "./post.service";
import { responseUtils } from "../../utils/response";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { createPostSchema, updatePostSchema } from "./post.dto";

export class PostController {
  constructor(private postService: PostService) {}

  async getPostById(c: Context) {
    try {
      const postId = c.req.param("id");
      const result = await this.postService.getPostById(postId);

      return responseUtils(
        c,
        result.message,
        result.code as ContentfulStatusCode,
        result.data
      );
    } catch (error) {
      console.error("Controller error:", error);
      return responseUtils(c, "Internal server error", 500);
    }
  }

  async getUserPosts(c: Context) {
    try {
      const user = c.get("user");
      const { page = "1", limit = "10" } = c.req.query();

      const result = await this.postService.getUserPosts(
        user.id,
        parseInt(limit),
        parseInt(page)
      );

      return responseUtils(
        c,
        result.message,
        result.code as ContentfulStatusCode,
        result.data,
        result.meta
      );
    } catch (error) {
      console.error("Controller error:", error);
      return responseUtils(c, "Internal server error", 500);
    }
  }

  async createPost(c: Context) {
    try {
      const user = c.get("user");
      const body = await c.req.json();

      const parsedData = createPostSchema.safeParse(body);

      if (!parsedData.success) {
        return responseUtils(c, "Invalid input data", 400, {
          errors: parsedData.error.errors,
        });
      }

      const result = await this.postService.createPost(
        user.id,
        parsedData.data
      );

      return responseUtils(
        c,
        result.message,
        result.code as ContentfulStatusCode,
        result.data
      );
    } catch (error) {
      console.error("Controller error:", error);
      return responseUtils(c, "Internal server error", 500);
    }
  }

  async updatePost(c: Context) {
    try {
      const user = c.get("user");
      const postId = c.req.param("id");
      const body = await c.req.json();

      const parsedData = updatePostSchema.safeParse(body);

      if (!parsedData.success) {
        return responseUtils(c, "Invalid input data", 400, {
          errors: parsedData.error.errors,
        });
      }

      const result = await this.postService.updatePost(
        postId,
        user.id,
        parsedData.data
      );

      return responseUtils(
        c,
        result.message,
        result.code as ContentfulStatusCode,
        result.data
      );
    } catch (error) {
      console.error("Controller error:", error);
      return responseUtils(c, "Internal server error", 500);
    }
  }

  async deletePost(c: Context) {
    try {
      const user = c.get("user");
      const postId = c.req.param("id");

      const result = await this.postService.deletePost(postId, user.id);

      return responseUtils(
        c,
        result.message,
        result.code as ContentfulStatusCode
      );
    } catch (error) {
      console.error("Controller error:", error);
      return responseUtils(c, "Internal server error", 500);
    }
  }

  async getPostReplies(c: Context) {
    try {
      const postId = c.req.param("id");
      const { page = "1", limit = "10" } = c.req.query();

      const result = await this.postService.getPostReplies(
        postId,
        parseInt(limit),
        parseInt(page)
      );

      return responseUtils(
        c,
        result.message,
        result.code as ContentfulStatusCode,
        result.data,
        result.meta
      );
    } catch (error) {
      console.error("Controller error:", error);
      return responseUtils(c, "Internal server error", 500);
    }
  }
}
