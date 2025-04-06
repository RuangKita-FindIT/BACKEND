import { PrismaClient } from "@prisma/client";
import { CreateReplyDto, UpdateReplyDto } from "./reply.dto";

const prisma = new PrismaClient();

export class ReplyService {
  async getReplyById(replyId: string) {
    try {
      const reply = await prisma.reply.findUnique({
        where: { id: replyId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          post: {
            select: {
              id: true,
              content: true,
            },
          },
          community: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });

      if (!reply) {
        return {
          success: false,
          message: "Reply not found",
          code: 404,
        };
      }

      if (reply.community.status !== "active") {
        return {
          success: false,
          message: "Reply not available - community inactive",
          code: 404,
        };
      }

      return {
        success: true,
        message: "Reply found",
        code: 200,
        data: reply,
      };
    } catch (error) {
      console.error("Error getting reply:", error);
      return {
        success: false,
        message: "Failed to retrieve reply",
        code: 500,
      };
    }
  }

  async getUserReplies(userId: string, limit = 10, page = 1) {
    try {
      const skip = (page - 1) * limit;

      const [replies, totalCount] = await Promise.all([
        prisma.reply.findMany({
          where: {
            userId,
            community: {
              status: "active",
            },
          },
          select: {
            id: true,
            content: true,
            imageUrl: true,
            createdAt: true,
            post: {
              select: {
                id: true,
                content: true,
              },
            },
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
        prisma.reply.count({
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
        message: "User replies retrieved successfully",
        code: 200,
        data: replies,
        meta: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Error getting user replies:", error);
      return {
        success: false,
        message: "Failed to retrieve user replies",
        code: 500,
      };
    }
  }

  async createReply(userId: string, data: CreateReplyDto) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: data.postId },
        include: {
          community: {
            select: {
              status: true,
              id: true,
            },
          },
        },
      });

      if (!post) {
        return {
          success: false,
          message: "Post not found",
          code: 404,
        };
      }

      if (post.community.status !== "active") {
        return {
          success: false,
          message: "Cannot reply to post in inactive community",
          code: 400,
        };
      }

      if (post.community.id !== data.communityId) {
        return {
          success: false,
          message: "Community ID mismatch with post's community",
          code: 400,
        };
      }

      const reply = await prisma.reply.create({
        data: {
          userId,
          postId: data.postId,
          communityId: data.communityId,
          content: data.content,
          imageUrl: data.imageUrl,
        },
        include: {
          post: {
            select: {
              id: true,
              content: true,
            },
          },
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
              username: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Reply created successfully",
        code: 201,
        data: reply,
      };
    } catch (error) {
      console.error("Error creating reply:", error);
      return {
        success: false,
        message: "Failed to create reply",
        code: 500,
      };
    }
  }

  async updateReply(replyId: string, userId: string, data: UpdateReplyDto) {
    try {
      const reply = await prisma.reply.findUnique({
        where: { id: replyId },
        include: {
          community: {
            select: {
              ownerId: true,
              status: true,
            },
          },
        },
      });

      if (!reply) {
        return {
          success: false,
          message: "Reply not found",
          code: 404,
        };
      }

      if (reply.community.status !== "active") {
        return {
          success: false,
          message: "Cannot update reply in inactive community",
          code: 400,
        };
      }

      if (reply.userId !== userId && reply.community.ownerId !== userId) {
        return {
          success: false,
          message: "You don't have permission to update this reply",
          code: 403,
        };
      }

      const updatedReply = await prisma.reply.update({
        where: { id: replyId },
        data: {
          content: data.content,
          imageUrl: data.imageUrl,
        },
        include: {
          post: {
            select: {
              id: true,
              content: true,
            },
          },
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
              username: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Reply updated successfully",
        code: 200,
        data: updatedReply,
      };
    } catch (error) {
      console.error("Error updating reply:", error);
      return {
        success: false,
        message: "Failed to update reply",
        code: 500,
      };
    }
  }

  async deleteReply(replyId: string, userId: string) {
    try {
      const reply = await prisma.reply.findUnique({
        where: { id: replyId },
        include: {
          community: {
            select: {
              ownerId: true,
            },
          },
        },
      });

      if (!reply) {
        return {
          success: false,
          message: "Reply not found",
          code: 404,
        };
      }

      if (reply.userId !== userId && reply.community.ownerId !== userId) {
        return {
          success: false,
          message: "You don't have permission to delete this reply",
          code: 403,
        };
      }

      await prisma.reply.delete({
        where: { id: replyId },
      });

      return {
        success: true,
        message: "Reply deleted successfully",
        code: 200,
      };
    } catch (error) {
      console.error("Error deleting reply:", error);
      return {
        success: false,
        message: "Failed to delete reply",
        code: 500,
      };
    }
  }
}
