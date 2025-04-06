import { Context } from "hono";
import { UserService } from "./user.service";
import { responseUtils } from "../../utils/response";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { updateUserProfileSchema } from "./user.dto";
import { ZodDataInterface } from "../../utils/zod.interface";

export class UserController {
  constructor(private userService: UserService) {}

  async getUserById(c: Context, userId: string) {
    try {
      const result = await this.userService.getUserById(userId);
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

  async getCurrentUser(c: Context) {
    try {
      const user = c.get("user");
      const result = await this.userService.getUserById(user.id);
      
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

  async getUserProfile(c: Context) {
    try {
      const user = c.get("user");
      const result = await this.userService.getUserProfile(user.id);
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

  async updateUserProfile(c: Context) {
    try {
      const user = c.get("user");
      const body = await c.req.json();

      const parsedData = updateUserProfileSchema.safeParse(body);

      if (!parsedData.success) {
        return responseUtils(c, "Invalid input data", 400, {
          errors: parsedData.error.errors,
        });
      }

      const result = await this.userService.updateUserProfile(
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

  async getUserCommunities(c: Context) {
    try {
      const user = c.get("user");
      const result = await this.userService.getUserCommunities(user.id);

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
}
