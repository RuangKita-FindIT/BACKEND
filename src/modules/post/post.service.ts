import { PrismaClient } from "@prisma/client";
import { CreatePostDto, UpdatePostDto } from "./post.dto";

const prisma = new PrismaClient();

export class PostService {
  async getPostById(postId: string) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          community: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          _count: {
            select: {
              replies: true,
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
          message: "Post not available - community inactive",
          code: 404,
        };
      }

      return {
        success: true,
        message: "Post found",
        code: 200,
        data: {
          ...post,
          replyCount: post._count.replies,
        },
      };
    } catch (error) {
      console.error("Error getting post:", error);
      return {
        success: false,
        message: "Failed to retrieve post",
        code: 500,
      };
    }
  }

  async getUserPosts(userId: string, limit = 10, page = 1) {
    try {
      const skip = (page - 1) * limit;

      const [posts, totalCount] = await Promise.all([
        prisma.post.findMany({
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
            community: {
              select: {
                id: true,
                name: true,
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
        prisma.post.count({
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
        message: "User posts retrieved successfully",
        code: 200,
        data: posts.map((post) => ({
          ...post,
          replyCount: post._count.replies,
        })),
        meta: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Error getting user posts:", error);
      return {
        success: false,
        message: "Failed to retrieve user posts",
        code: 500,
      };
    }
  }

  async createPost(userId: string, data: CreatePostDto) {
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

      const post = await prisma.post.create({
        data: {
          userId,
          communityId: data.communityId,
          content: data.content,
          imageUrl: data.imageUrl,
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
              username: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Post created successfully",
        code: 201,
        data: post,
      };
    } catch (error) {
      console.error("Error creating post:", error);
      return {
        success: false,
        message: "Failed to create post",
        code: 500,
      };
    }
  }

  async updatePost(postId: string, userId: string, data: UpdatePostDto) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          community: {
            select: {
              ownerId: true,
              status: true,
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
          message: "Cannot update post in inactive community",
          code: 400,
        };
      }

      if (post.userId !== userId && post.community.ownerId !== userId) {
        return {
          success: false,
          message: "You don't have permission to update this post",
          code: 403,
        };
      }

      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          content: data.content,
          imageUrl: data.imageUrl,
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
              username: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Post updated successfully",
        code: 200,
        data: updatedPost,
      };
    } catch (error) {
      console.error("Error updating post:", error);
      return {
        success: false,
        message: "Failed to update post",
        code: 500,
      };
    }
  }

  async deletePost(postId: string, userId: string) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          community: {
            select: {
              ownerId: true,
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

      if (post.userId !== userId && post.community.ownerId !== userId) {
        return {
          success: false,
          message: "You don't have permission to delete this post",
          code: 403,
        };
      }

      await prisma.reply.deleteMany({
        where: { postId },
      });

      await prisma.post.delete({
        where: { id: postId },
      });

      return {
        success: true,
        message: "Post deleted successfully",
        code: 200,
      };
    } catch (error) {
      console.error("Error deleting post:", error);
      return {
        success: false,
        message: "Failed to delete post",
        code: 500,
      };
    }
  }

  async getPostReplies(postId: string, limit = 10, page = 1) {
    try {
      const skip = (page - 1) * limit;

      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          community: {
            select: {
              status: true,
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
          message: "Post not available - community inactive",
          code: 404,
        };
      }

      const [replies, totalCount] = await Promise.all([
        prisma.reply.findMany({
          where: { postId },
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
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: "asc",
          },
        }),
        prisma.reply.count({ where: { postId } }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        message: "Post replies retrieved successfully",
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
      console.error("Error getting post replies:", error);
      return {
        success: false,
        message: "Failed to retrieve post replies",
        code: 500,
      };
    }
  }
}
