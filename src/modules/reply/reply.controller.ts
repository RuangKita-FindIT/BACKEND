import { Context } from "hono";
import { ReplyService } from "./reply.service";
import { responseUtils } from "../../utils/response";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { createReplySchema, updateReplySchema } from "./reply.dto";

export class ReplyController {
  constructor(private replyService: ReplyService) {}

  async getReplyById(c: Context) {
    try {
      const replyId = c.req.param("id");
      const result = await this.replyService.getReplyById(replyId);

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

  async getUserReplies(c: Context) {
    try {
      const user = c.get("user");
      const { page = "1", limit = "10" } = c.req.query();

      const result = await this.replyService.getUserReplies(
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

  async createReply(c: Context) {
    try {
      const user = c.get("user");
      const body = await c.req.json();

      const parsedData = createReplySchema.safeParse(body);

      if (!parsedData.success) {
        return responseUtils(c, "Invalid input data", 400, {
          errors: parsedData.error.errors,
        });
      }

      const result = await this.replyService.createReply(
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

  async updateReply(c: Context) {
    try {
      const user = c.get("user");
      const replyId = c.req.param("id");
      const body = await c.req.json();

      const parsedData = updateReplySchema.safeParse(body);

      if (!parsedData.success) {
        return responseUtils(c, "Invalid input data", 400, {
          errors: parsedData.error.errors,
        });
      }

      const result = await this.replyService.updateReply(
        replyId,
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

  async deleteReply(c: Context) {
    try {
      const user = c.get("user");
      const replyId = c.req.param("id");

      const result = await this.replyService.deleteReply(replyId, user.id);

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
}
