import { PrismaClient } from "@prisma/client";
import { UpdateUserProfileDto } from "./user.dto";

const prisma = new PrismaClient();

export class UserService {
  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phoneNumber: true,
          bio: true,
          location: true,
          textSize: true,
          highContrastEnabled: true,
          languagePreference: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return { success: false, message: "User not found", code: 404 };
      }

      return {
        success: true,
        message: "User found",
        code: 200,
        data: user,
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return { success: false, message: "Failed to get user", code: 500 };
    }
  }

  async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phoneNumber: true,
          bio: true,
          location: true,
          textSize: true,
          highContrastEnabled: true,
          languagePreference: true,
          createdAt: true,

          _count: {
            select: {
              posts: true,
              replies: true,
              resources: true,
              ownedCommunities: true,
            },
          },
        },
      });

      if (!user) {
        return { success: false, message: "User not found", code: 404 };
      }

      return {
        success: true,
        message: "User profile retrieved",
        code: 200,
        data: {
          ...user,
          stats: {
            postCount: user._count.posts,
            replyCount: user._count.replies,
            resourceCount: user._count.resources,
            communityCount: user._count.ownedCommunities,
          },
        },
      };
    } catch (error) {
      console.error("Error getting user profile:", error);
      return {
        success: false,
        message: "Failed to get user profile",
        code: 500,
      };
    }
  }

  async updateUserProfile(userId: string, updateData: UpdateUserProfileDto) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return { success: false, message: "User not found", code: 404 };
      }

      if (updateData.username) {
        const usernameExists = await prisma.user.findUnique({
          where: { username: updateData.username },
        });

        if (usernameExists && usernameExists.id !== userId) {
          return {
            success: false,
            message: "Username already taken",
            code: 400,
          };
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phoneNumber: true,
          bio: true,
          location: true,
          textSize: true,
          highContrastEnabled: true,
          languagePreference: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        message: "Profile updated successfully",
        code: 200,
        data: updatedUser,
      };
    } catch (error) {
      console.error("Error updating user profile:", error);
      return { success: false, message: "Failed to update profile", code: 500 };
    }
  }

  async getUserCommunities(userId: string) {
    try {
      const communities = await prisma.community.findMany({
        where: { ownerId: userId },
        select: {
          id: true,
          name: true,
          description: true,
          categoryId: true,
          category: {
            select: {
              name: true,
            },
          },
          memberCount: true,
          verifiedStatus: true,
          createdAt: true,
          status: true,
          visibility: true,
        },
      });

      return {
        success: true,
        message: "User communities retrieved",
        code: 200,
        data: communities,
      };
    } catch (error) {
      console.error("Error getting user communities:", error);
      return {
        success: false,
        message: "Failed to get user communities",
        code: 500,
      };
    }
  }
}
