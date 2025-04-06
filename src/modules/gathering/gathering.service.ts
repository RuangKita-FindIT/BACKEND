import { PrismaClient, GatheringStatus } from "@prisma/client";
import { CreateGatheringDto, UpdateGatheringDto } from "./gathering.dto";

const prisma = new PrismaClient();

export class GatheringService {
  async getGatheringById(gatheringId: string) {
    try {
      const gathering = await prisma.gathering.findUnique({
        where: { id: gatheringId },
        include: {
          community: {
            select: {
              id: true,
              name: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
          },
        },
      });

      if (!gathering) {
        return {
          success: false,
          message: "Gathering not found",
          code: 404,
        };
      }

      return {
        success: true,
        message: "Gathering found",
        code: 200,
        data: gathering,
      };
    } catch (error) {
      console.error("Error getting gathering:", error);
      return {
        success: false,
        message: "Failed to retrieve gathering",
        code: 500,
      };
    }
  }

  async getGatheringsByCommunityId(
    communityId: string,
    limit = 10,
    page = 1,
    filter?: {
      status?: GatheringStatus;
      upcoming?: boolean;
    }
  ) {
    try {
      const skip = (page - 1) * limit;

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

      const where: any = { communityId };

      if (filter?.status) {
        where.status = filter.status;
      }

      if (filter?.upcoming) {
        where.startDate = { gte: new Date() };
      }

      const [gatherings, totalCount] = await Promise.all([
        prisma.gathering.findMany({
          where,
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            startDate: true,
            endDate: true,
            status: true,
            capacity: true,
            attendeeCount: true,
            imageUrl: true,
            virtualMeetingUrl: true,
            createdAt: true,
          },
          skip,
          take: limit,
          orderBy: filter?.upcoming
            ? { startDate: "asc" }
            : { startDate: "desc" },
        }),
        prisma.gathering.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        message: "Community gatherings retrieved successfully",
        code: 200,
        data: gatherings,
        meta: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Error getting community gatherings:", error);
      return {
        success: false,
        message: "Failed to retrieve community gatherings",
        code: 500,
      };
    }
  }

  async createGathering(userId: string, data: CreateGatheringDto) {
    try {
      const community = await prisma.community.findUnique({
        where: { id: data.communityId },
        include: { owner: true },
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
          message: "Only community owners can create gatherings",
          code: 403,
        };
      }

      if (new Date(data.startDate) >= new Date(data.endDate)) {
        return {
          success: false,
          message: "Start date must be before end date",
          code: 400,
        };
      }

      const gathering = await prisma.gathering.create({
        data: {
          communityId: data.communityId,
          title: data.title,
          description: data.description,
          location: data.location,
          startDate: data.startDate,
          endDate: data.endDate,
          capacity: data.capacity || 0,
          imageUrl: data.imageUrl,
          accessibilityInfo: data.accessibilityInfo,
          virtualMeetingUrl: data.virtualMeetingUrl,
        },
      });

      return {
        success: true,
        message: "Gathering created successfully",
        code: 201,
        data: gathering,
      };
    } catch (error) {
      console.error("Error creating gathering:", error);
      return {
        success: false,
        message: "Failed to create gathering",
        code: 500,
      };
    }
  }

  async updateGathering(
    gatheringId: string,
    userId: string,
    data: UpdateGatheringDto
  ) {
    try {
      const gathering = await prisma.gathering.findUnique({
        where: { id: gatheringId },
        include: {
          community: {
            include: {
              owner: true,
            },
          },
        },
      });

      if (!gathering) {
        return {
          success: false,
          message: "Gathering not found",
          code: 404,
        };
      }

      if (gathering.community.owner.id !== userId) {
        return {
          success: false,
          message: "Only community owners can update gatherings",
          code: 403,
        };
      }

      if (data.startDate && data.endDate) {
        if (new Date(data.startDate) >= new Date(data.endDate)) {
          return {
            success: false,
            message: "Start date must be before end date",
            code: 400,
          };
        }
      } else if (data.startDate && gathering.endDate) {
        if (new Date(data.startDate) >= gathering.endDate) {
          return {
            success: false,
            message: "Start date must be before end date",
            code: 400,
          };
        }
      } else if (data.endDate && gathering.startDate) {
        if (gathering.startDate >= new Date(data.endDate)) {
          return {
            success: false,
            message: "Start date must be before end date",
            code: 400,
          };
        }
      }

      const updatedGathering = await prisma.gathering.update({
        where: { id: gatheringId },
        data: {
          title: data.title,
          description: data.description,
          location: data.location,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status as GatheringStatus | undefined,
          capacity: data.capacity,
          attendeeCount: data.attendeeCount,
          imageUrl: data.imageUrl,
          accessibilityInfo: data.accessibilityInfo,
          virtualMeetingUrl: data.virtualMeetingUrl,
        },
      });

      return {
        success: true,
        message: "Gathering updated successfully",
        code: 200,
        data: updatedGathering,
      };
    } catch (error) {
      console.error("Error updating gathering:", error);
      return {
        success: false,
        message: "Failed to update gathering",
        code: 500,
      };
    }
  }

  async deleteGathering(gatheringId: string, userId: string) {
    try {
      const gathering = await prisma.gathering.findUnique({
        where: { id: gatheringId },
        include: {
          community: {
            include: {
              owner: true,
            },
          },
        },
      });

      if (!gathering) {
        return {
          success: false,
          message: "Gathering not found",
          code: 404,
        };
      }

      if (gathering.community.owner.id !== userId) {
        return {
          success: false,
          message: "Only community owners can delete gatherings",
          code: 403,
        };
      }

      await prisma.gathering.update({
        where: { id: gatheringId },
        data: {
          status: "cancelled",
        },
      });

      return {
        success: true,
        message: "Gathering cancelled successfully",
        code: 200,
      };
    } catch (error) {
      console.error("Error deleting gathering:", error);
      return {
        success: false,
        message: "Failed to cancel gathering",
        code: 500,
      };
    }
  }
}
