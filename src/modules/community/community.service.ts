import {
  PrismaClient,
  CommunityVisibility,
  CommunityStatus,
} from "@prisma/client";
import { CreateCommunityDto, UpdateCommunityDto } from "./community.dto";

const prisma = new PrismaClient();

export class CommunityService {
  async getAllCommunities(
    limit = 10,
    page = 1,
    filter?: {
      name?: string;
      categoryId?: string;
      location?: string;
    }
  ) {
    try {
      const skip = (page - 1) * limit;

      const where = {
        ...(filter?.name && {
          name: { contains: filter.name, mode: "insensitive" as const },
        }),
        ...(filter?.categoryId && { categoryId: filter.categoryId }),
        ...(filter?.location && {
          location: { contains: filter.location, mode: "insensitive" as const },
        }),
        visibility: "public" as CommunityVisibility,
        status: "active" as CommunityStatus,
      };

      const [communities, totalCount] = await Promise.all([
        prisma.community.findMany({
          where,
          select: {
            id: true,
            name: true,
            description: true,
            memberCount: true,
            activeMemberCount: true,
            verifiedStatus: true,
            sdgTags: true,
            location: true,
            createdAt: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            memberCount: "desc",
          },
        }),
        prisma.community.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        message: "Communities retrieved successfully",
        code: 200,
        data: communities,
        meta: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Error getting communities:", error);
      return {
        success: false,
        message: "Failed to retrieve communities",
        code: 500,
      };
    }
  }

  async getCommunityById(communityId: string) {
    try {
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          _count: {
            select: {
              posts: true,
              resources: true,
            },
          },
        },
      });

      if (!community) {
        return {
          success: false,
          message: "Community not found",
          code: 404,
        };
      }

      return {
        success: true,
        message: "Community found",
        code: 200,
        data: {
          ...community,
          stats: {
            postCount: community._count.posts,
            resourceCount: community._count.resources,
          },
        },
      };
    } catch (error) {
      console.error("Error getting community:", error);
      return {
        success: false,
        message: "Failed to retrieve community",
        code: 500,
      };
    }
  }

  async createCommunity(userId: string, data: CreateCommunityDto) {
    try {
      const categoryExists = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!categoryExists) {
        return {
          success: false,
          message: "Invalid category",
          code: 400,
        };
      }

      const community = await prisma.community.create({
        data: {
          ownerId: userId,
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          location: data.location,
          sdgTags: data.sdgTags || [],
          accessibilityFeatures: data.accessibilityFeatures || [],
          language: data.language,
          visibility: (data.visibility as CommunityVisibility) || "public",
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Community created successfully",
        code: 201,
        data: community,
      };
    } catch (error) {
      console.error("Error creating community:", error);
      return {
        success: false,
        message: "Failed to create community",
        code: 500,
      };
    }
  }

  async updateCommunity(
    communityId: string,
    userId: string,
    data: UpdateCommunityDto
  ) {
    try {
      const community = await prisma.community.findUnique({
        where: { id: communityId },
      });

      if (!community) {
        return {
          success: false,
          message: "Community not found",
          code: 404,
        };
      }

      if (community.ownerId !== userId) {
        return {
          success: false,
          message: "You don't have permission to update this community",
          code: 403,
        };
      }

      if (data.categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: data.categoryId },
        });

        if (!categoryExists) {
          return {
            success: false,
            message: "Invalid category",
            code: 400,
          };
        }
      }

      const updatedCommunity = await prisma.community.update({
        where: { id: communityId },
        data: {
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          location: data.location,
          sdgTags: data.sdgTags,
          accessibilityFeatures: data.accessibilityFeatures,
          language: data.language,
          visibility: data.visibility as CommunityVisibility | undefined,
          status: data.status as CommunityStatus | undefined,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Community updated successfully",
        code: 200,
        data: updatedCommunity,
      };
    } catch (error) {
      console.error("Error updating community:", error);
      return {
        success: false,
        message: "Failed to update community",
        code: 500,
      };
    }
  }

  async deleteCommunity(communityId: string, userId: string) {
    try {
      const community = await prisma.community.findUnique({
        where: { id: communityId },
      });

      if (!community) {
        return {
          success: false,
          message: "Community not found",
          code: 404,
        };
      }

      if (community.ownerId !== userId) {
        return {
          success: false,
          message: "You don't have permission to delete this community",
          code: 403,
        };
      }

      await prisma.community.update({
        where: { id: communityId },
        data: {
          status: "inactive",
        },
      });

      return {
        success: true,
        message: "Community deleted successfully",
        code: 200,
      };
    } catch (error) {
      console.error("Error deleting community:", error);
      return {
        success: false,
        message: "Failed to delete community",
        code: 500,
      };
    }
  }

  async getCommunityPosts(communityId: string, limit = 10, page = 1) {
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

      const [posts, totalCount] = await Promise.all([
        prisma.post.findMany({
          where: { communityId },
          select: {
            id: true,
            content: true,
            imageUrl: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.post.count({ where: { communityId } }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        message: "Community posts retrieved successfully",
        code: 200,
        data: posts,
        meta: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Error getting community posts:", error);
      return {
        success: false,
        message: "Failed to retrieve community posts",
        code: 500,
      };
    }
  }

  async getCommunityResources(communityId: string, limit = 10, page = 1) {
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
}
