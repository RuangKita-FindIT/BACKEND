import { Context } from "hono";
import { ResourceService } from "./resource.service";
import { responseUtils } from "../../utils/response";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { createResourceSchema, updateResourceSchema } from "./resource.dto";

export class ResourceController {
  constructor(private resourceService: ResourceService) {}

  async getResourceById(c: Context) {
    try {
      const resourceId = c.req.param("id");
      const result = await this.resourceService.getResourceById(resourceId);

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

  async getResourcesByCommunityId(c: Context) {
    try {
      const communityId = c.req.param("communityId");
      const { page = "1", limit = "10" } = c.req.query();

      const result = await this.resourceService.getResourcesByCommunityId(
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

  async getUserResources(c: Context) {
    try {
      const user = c.get("user");
      const { page = "1", limit = "10" } = c.req.query();

      const result = await this.resourceService.getUserResources(
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

  async createResource(c: Context) {
    try {
      const user = c.get("user");
      const body = await c.req.json();

      const parsedData = createResourceSchema.safeParse(body);

      if (!parsedData.success) {
        return responseUtils(c, "Invalid input data", 400, {
          errors: parsedData.error.errors,
        });
      }

      const result = await this.resourceService.createResource(
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

  async updateResource(c: Context) {
    try {
      const user = c.get("user");
      const resourceId = c.req.param("id");
      const body = await c.req.json();

      const parsedData = updateResourceSchema.safeParse(body);

      if (!parsedData.success) {
        return responseUtils(c, "Invalid input data", 400, {
          errors: parsedData.error.errors,
        });
      }

      const result = await this.resourceService.updateResource(
        resourceId,
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

  async deleteResource(c: Context) {
    try {
      const user = c.get("user");
      const resourceId = c.req.param("id");

      const result = await this.resourceService.deleteResource(
        resourceId,
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
}
