import { Context } from "hono";
import { CommunityService } from "./community.service";
import { responseUtils } from "../../utils/response";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { createCommunitySchema, updateCommunitySchema } from "./community.dto";

export class CommunityController {
  constructor(private communityService: CommunityService) {}

  async getAllCommunities(c: Context) {
    try {
      const {
        page = "1",
        limit = "10",
        name,
        categoryId,
        location,
      } = c.req.query();

      const result = await this.communityService.getAllCommunities(
        parseInt(limit),
        parseInt(page),
        { name, categoryId, location }
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

  async getCommunityById(c: Context) {
    try {
      const communityId = c.req.param("id");
      const result = await this.communityService.getCommunityById(communityId);

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

  async createCommunity(c: Context) {
    try {
      const user = c.get("user");
      const body = await c.req.json();

      const parsedData = createCommunitySchema.safeParse(body);

      if (!parsedData.success) {
        return responseUtils(c, "Invalid input data", 400, {
          errors: parsedData.error.errors,
        });
      }

      const result = await this.communityService.createCommunity(
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

  async updateCommunity(c: Context) {
    try {
      const user = c.get("user");
      const communityId = c.req.param("id");
      const body = await c.req.json();

      const parsedData = updateCommunitySchema.safeParse(body);

      if (!parsedData.success) {
        return responseUtils(c, "Invalid input data", 400, {
          errors: parsedData.error.errors,
        });
      }

      const result = await this.communityService.updateCommunity(
        communityId,
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

  async deleteCommunity(c: Context) {
    try {
      const user = c.get("user");
      const communityId = c.req.param("id");

      const result = await this.communityService.deleteCommunity(
        communityId,
        user.id
      );

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

  async getCommunityPosts(c: Context) {
    try {
      const communityId = c.req.param("id");
      const { page = "1", limit = "10" } = c.req.query();

      const result = await this.communityService.getCommunityPosts(
        communityId,
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

  async getCommunityResources(c: Context) {
    try {
      const communityId = c.req.param("id");
      const { page = "1", limit = "10" } = c.req.query();

      const result = await this.communityService.getCommunityResources(
        communityId,
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
