import jwt from "jsonwebtoken";
import { jwtConfig } from "@config/jwt";
import { UserRole, type JwtPayload } from "@interfaces/auth";
import { Service } from "typedi";
import gallery_users from "@models/gallery_users_model";
import EncriptionUtils from "@utils/EncryptionUtils";
import { DefaultApiResponse } from "@interfaces/request";
import { PostDto } from "src/dto/post/PostDto";
import gallery_post_likes from "@models/gallery_post_likes_model";
import gallery_post_comments from "@models/gallery_post_comments_model";
import gallery_posts from "@models/gallery_posts_model";
import { ResponseType } from "src/dto/common/BaseResponseDto";
import { CreatePostBodyDto } from "src/dto/post/CreatePostBodyDto";

@Service()
export class PostService {
  public async getAllPostsByPage(
    page: number,
    pageSize: number
  ): Promise<{ items: PostDto[]; count: number; code?: number }> {
    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    const { rows, count } = await gallery_posts.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        { model: gallery_users, as: "user" },
        { model: gallery_post_likes, as: "likes" },
        { model: gallery_post_comments, as: "comments" },
      ],
    });

    if (!rows) {
      return { items: [], count: 0, code: 1000 };
    }

    const items: PostDto[] = [];

    for (const post of rows) {
      const author = post.user;
      const likes = post.likes ?? [];
      const comments = post.comments ?? [];

      const likeCount = likes.length;
      const commentCount = comments.length;

      items.push({
        postId: post.postId,
        userId: post.userId,
        description: post.description,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt ? post.createdAt.toISOString() : null,
        updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
        likeCount,
        commentCount,
        author: {
          userId: author?.userId ?? post.userId,
          username: author?.username ?? "",
          imageUrl: author?.imageUrl ?? null,
        },
      });
    }

    return { items, count };
  }

  public async getPostById(
    postId: number
  ): Promise<{ responsePost: PostDto | null; code?: number }> {
    try {
      const post = await gallery_posts.findByPk(postId, {
        include: [
          { model: gallery_users, as: "user" },
          { model: gallery_post_likes, as: "likes" },
          { model: gallery_post_comments, as: "comments" },
        ],
      });

      if (!post) {
        return {
          responsePost: null,
          code: 1001,
        };
      }

      const author = post.user;
      const likes = post.likes ?? [];
      const comments = post.comments ?? [];

      const likeCount = likes.length;
      const commentCount = comments.length;

      const responsePost: PostDto = {
        postId: post.postId,
        userId: post.userId,
        description: post.description,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt ? post.createdAt.toISOString() : null,
        updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
        likeCount,
        commentCount,
        author: {
          userId: author?.userId ?? post.userId,
          username: author?.username ?? "",
          imageUrl: author?.imageUrl ?? null,
        },
      };

      return { responsePost };
    } catch (error) {
      return { responsePost: null, code: 1000 };
    }
  }

  public async createPost(
    user: JwtPayload,
    body: CreatePostBodyDto
  ): Promise<{ success: boolean; code?: number }> {
    try {
      const decryptionUtils = EncriptionUtils.getInstance();
      const decryptedUserId = decryptionUtils.jwtDecryptValue(user.userId);
      const userId = Number(decryptedUserId);

      if (!userId || Number.isNaN(userId)) {
        return { success: false, code: 2001 };
      }

      const created = await gallery_posts.create({
        userId,
        description: body.description,
        imageUrl: body.imageUrl,
        createdAt: new Date(),
        updatedAt: null,
      });

      if (!created) {
        return { success: false, code: 2002 };
      }

      return { success: true };
    } catch (error) {
      console.error("Error creating post (service):", error);
      return { success: false, code: 1000 };
    }
  }

  public async deletePost(
    user: JwtPayload,
    postId: number
  ): Promise<{ success: boolean; code?: number }> {
    try {
      const decryptionUtils = EncriptionUtils.getInstance();
      const decryptedUserId = decryptionUtils.jwtDecryptValue(user.userId);
      const userId = Number(decryptedUserId);

      if (!userId || Number.isNaN(userId)) {
        return { success: false, code: 2001 };
      }

      const post = await gallery_posts.findByPk(postId);

      if (!post) {
        return { success: false, code: 2003 };
      }

      if (post.userId !== userId) {
        return { success: false, code: 2004 };
      }

      await post.destroy();

      return { success: true };
    } catch (error) {
      console.error("Error deleting post (service):", error);
      return { success: false, code: 1000 };
    }
  }
}
