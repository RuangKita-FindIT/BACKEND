import { PrismaClient } from "@prisma/client";
import { CreateResourceDto, UpdateResourceDto } from "./resource.dto";

const prisma = new PrismaClient();

export class ResourceService {
  async getResourceById(resourceId: string) {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
        include: {
          community: {
            select: {
              id: true,
              name: true,
              status: true,
              visibility: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });

      if (!resource) {
        return {
          success: false,
          message: "Resource not found",
          code: 404,
        };
      }

      if (resource.community.status !== "active") {
        return {
          success: false,
          message: "Resource not available",
          code: 404,
        };
      }

      return {
        success: true,
        message: "Resource found",
        code: 200,
        data: resource,
      };
    } catch (error) {
      console.error("Error getting resource:", error);
      return {
        success: false,
        message: "Failed to retrieve resource",
        code: 500,
      };
    }
  }

  async getResourcesByCommunityId(communityId: string, limit = 10, page = 1) {
    try {
      const skip = (page - 1) * limit;

      const community = await prisma.community.findFirst({
        where: {
          id: communityId,
          status: "active",
        },
      });

      if (!community) {
        return {
          success: false,
          message: "Community not found or inactive",
          code: 404,
        };
      }

      const [resources, totalCount] = await Promise.all([
        prisma.resource.findMany({
          where: { communityId },
          select: {
            id: true,
            title: true,
            description: true,
            fileUrl: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.resource.count({ where: { communityId } }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        message: "Community resources retrieved successfully",
        code: 200,
        data: resources,
        meta: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Error getting community resources:", error);
      return {
        success: false,
        message: "Failed to retrieve community resources",
        code: 500,
      };
    }
  }

  async getUserResources(userId: string, limit = 10, page = 1) {
    try {
      const skip = (page - 1) * limit;

      const [resources, totalCount] = await Promise.all([
        prisma.resource.findMany({
          where: {
            userId,
            community: {
              status: "active",
            },
          },
          select: {
            id: true,
            title: true,
            description: true,
            fileUrl: true,
            createdAt: true,
            community: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.resource.count({
          where: {
            userId,
            community: {
              status: "active",
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        message: "User resources retrieved successfully",
        code: 200,
        data: resources,
        meta: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Error getting user resources:", error);
      return {
        success: false,
        message: "Failed to retrieve user resources",
        code: 500,
      };
    }
  }

  async createResource(userId: string, data: CreateResourceDto) {
    try {
      const community = await prisma.community.findFirst({
        where: {
          id: data.communityId,
          status: "active",
        },
      });

      if (!community) {
        return {
          success: false,
          message: "Community not found or inactive",
          code: 404,
        };
      }

      const resource = await prisma.resource.create({
        data: {
          userId,
          communityId: data.communityId,
          title: data.title,
          description: data.description,
          fileUrl: data.fileUrl,
        },
        include: {
          community: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Resource created successfully",
        code: 201,
        data: resource,
      };
    } catch (error) {
      console.error("Error creating resource:", error);
      return {
        success: false,
        message: "Failed to create resource",
        code: 500,
      };
    }
  }

  async updateResource(
    resourceId: string,
    userId: string,
    data: UpdateResourceDto
  ) {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
        include: {
          community: {
            select: {
              status: true,
              ownerId: true,
            },
          },
        },
      });

      if (!resource) {
        return {
          success: false,
          message: "Resource not found",
          code: 404,
        };
      }

      if (resource.community.status !== "active") {
        return {
          success: false,
          message: "Cannot update resource in inactive community",
          code: 400,
        };
      }

      if (resource.userId !== userId && resource.community.ownerId !== userId) {
        return {
          success: false,
          message: "You don't have permission to update this resource",
          code: 403,
        };
      }

      const updatedResource = await prisma.resource.update({
        where: { id: resourceId },
        data,
        include: {
          community: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Resource updated successfully",
        code: 200,
        data: updatedResource,
      };
    } catch (error) {
      console.error("Error updating resource:", error);
      return {
        success: false,
        message: "Failed to update resource",
        code: 500,
      };
    }
  }

  async deleteResource(resourceId: string, userId: string) {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
        include: {
          community: {
            select: {
              ownerId: true,
            },
          },
        },
      });

      if (!resource) {
        return {
          success: false,
          message: "Resource not found",
          code: 404,
        };
      }

      if (resource.userId !== userId && resource.community.ownerId !== userId) {
        return {
          success: false,
          message: "You don't have permission to delete this resource",
          code: 403,
        };
      }

      await prisma.resource.delete({
        where: { id: resourceId },
      });

      return {
        success: true,
        message: "Resource deleted successfully",
        code: 200,
      };
    } catch (error) {
      console.error("Error deleting resource:", error);
      return {
        success: false,
        message: "Failed to delete resource",
        code: 500,
      };
    }
  }
}
