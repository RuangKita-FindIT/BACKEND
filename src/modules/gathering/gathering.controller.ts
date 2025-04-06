import { Context } from "hono";
import { GatheringService } from "./gathering.service";
import { responseUtils } from "../../utils/response";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { createGatheringSchema, updateGatheringSchema } from "./gathering.dto";
import { GatheringStatus } from "@prisma/client";

export class GatheringController {
  constructor(private gatheringService: GatheringService) {}

  async getGatheringById(c: Context) {
    try {
      const gatheringId = c.req.param("id");
      const result = await this.gatheringService.getGatheringById(gatheringId);

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

  async getGatheringsByCommunityId(c: Context) {
    try {
      const communityId = c.req.param("communityId");
      const { page = "1", limit = "10", status, upcoming } = c.req.query();

      const filter: { status?: GatheringStatus; upcoming?: boolean } = {};

      if (
        status &&
        ["planned", "ongoing", "completed", "cancelled"].includes(status)
      ) {
        filter.status = status as GatheringStatus;
      }

      if (upcoming === "true") {
        filter.upcoming = true;
      }

      const result = await this.gatheringService.getGatheringsByCommunityId(
        communityId,
        parseInt(limit),
        parseInt(page),
        filter
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

  async createGathering(c: Context) {
    try {
      const user = c.get("user");
      const body = await c.req.json();

      const parsedData = createGatheringSchema.safeParse(body);

      if (!parsedData.success) {
        return responseUtils(c, "Invalid input data", 400, {
          errors: parsedData.error.errors,
        });
      }

      const result = await this.gatheringService.createGathering(
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

  async updateGathering(c: Context) {
    try {
      const user = c.get("user");
      const gatheringId = c.req.param("id");
      const body = await c.req.json();

      const parsedData = updateGatheringSchema.safeParse(body);

      if (!parsedData.success) {
        return responseUtils(c, "Invalid input data", 400, {
          errors: parsedData.error.errors,
        });
      }

      const result = await this.gatheringService.updateGathering(
        gatheringId,
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

  async deleteGathering(c: Context) {
    try {
      const user = c.get("user");
      const gatheringId = c.req.param("id");

      const result = await this.gatheringService.deleteGathering(
        gatheringId,
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
