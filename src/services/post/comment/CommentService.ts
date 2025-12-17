import { Service } from "typedi";
import gallery_users from "@models/gallery_users_model";
import { PostDto } from "src/dto/post/PostDto";
import gallery_post_likes from "@models/gallery_post_likes_model";
import gallery_post_comments from "@models/gallery_post_comments_model";
import gallery_posts from "@models/gallery_posts_model";
import { CommentListDataDto } from "src/dto/post/comment/CommentListResponseDto";
import { CommentDto } from "src/dto/post/comment/CommentDto";
import { ResponseType } from "src/dto/common/BaseResponseDto";
import AuditService from "@services/audit/AuditService";
import { AuditTable } from "@interfaces/auditInterfaces";
import { CreateCommentBodyDto } from "src/dto/post/comment/CreateCommentBodyDto";
import { JwtPayload } from "jsonwebtoken";
import EncriptionUtils from "@utils/EncryptionUtils";
import { isUserExistingById } from "@utils/UserUtils";

@Service()
export class CommentsService {
  public async getAllCommentsByPostId(
    postId: number
  ): Promise<{ items: CommentDto[]; count: number; code: number }> {
    try {
      const post = await gallery_posts.findByPk(postId);

      if (!post) {
        return {
          items: [],
          count: 0,
          code: 50105,
        };
      }

      const { rows, count } = await gallery_post_comments.findAndCountAll({
        where: { postId },
        order: [["createdAt", "ASC"]],
        include: [{ model: gallery_users, as: "user" }],
      });

      const items: CommentDto[] = [];

      for (const comment of rows) {
        let commentContent;
        const author = comment.user;

        if (comment.isDeleted) {
          commentContent = null;
        } else {
          commentContent = comment.content;
        }

        items.push({
          commentId: comment.commentId,
          postId: comment.postId,
          userId: comment.userId,
          content: commentContent,
          parentCommentId: comment.parentCommentId ?? null,
          isDeleted: comment.isDeleted,
          createdAt: comment.createdAt ? comment.createdAt.toISOString() : null,
          updatedAt: comment.updatedAt ? comment.updatedAt.toISOString() : null,
          author: {
            userId: author?.userId ?? comment.userId,
            username: author?.username ?? "",
            imageUrl: author?.imageUrl ?? null,
          },
        });
      }

      return {
        items: items,
        count: count,
        code: 10000,
      };
    } catch (error) {
      console.error("Error listing comments:", error);
      return {
        items: [],
        count: 0,
        code: 50204,
      };
    }
  }

  public async createComment(
    user: JwtPayload,
    postId: number,
    body: CreateCommentBodyDto
  ) {
    const decryptionUtils = EncriptionUtils.getInstance();
    const decryptedUserId = decryptionUtils.jwtDecryptValue(user.userId);
    const userId = Number(decryptedUserId);

    const isUserExists = await isUserExistingById(userId);
    if (!isUserExists) {
      return {
        type: ResponseType.ERROR,
        msg: "User does not exist",
        code: 50200,
      };
    }

    const post = await gallery_posts.findByPk(postId);
    if (!post) {
      return {
        type: ResponseType.ERROR,
        msg: "Post not found",
        code: 50105,
      };
    }

    let parentCommentId: number | undefined;
    let createdComment: any;

    if (body.parentCommentId === null || body.parentCommentId === undefined) {
      // No parent comment, create as a top-level comment
      createdComment = await gallery_post_comments.create({
        postId,
        userId,
        content: body.content,
        parentCommentId: body.parentCommentId,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: null,
      });
    } else {
      // Verify that the parent comment in that post exists
      const isCommentExisting = await gallery_post_comments.findOne({
        where: { parentCommentId: body.parentCommentId, postId: postId },
      });

      if (!isCommentExisting) {
        return {
          type: ResponseType.ERROR,
          msg: "Invalid parent comment",
          code: 50201,
        };
      }

      createdComment = await gallery_post_comments.create({
        postId,
        userId,
        content: body.content,
        parentCommentId: parentCommentId ?? null,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: null,
      });
    }

    // Log the creation in audit logs
    AuditService.logInsert({
      table: AuditTable.POST_COMMENTS,
      userId: userId,
      newData: createdComment.toJSON(),
    });

    // Return the created comment with author info, so the client can display it immediately
    const comment = await gallery_post_comments.findOne({
      where: { commentId: createdComment.commentId },
      include: [{ model: gallery_users, as: "user" }],
    });

    if (!comment) {
      return {
        type: ResponseType.ERROR,
        msg: "The comment has been created but could not be loaded",
        code: 50202,
      };
    }

    const author = comment.user;

    const responseComment: CommentDto = {
      commentId: comment.commentId,
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      parentCommentId: comment.parentCommentId ?? null,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt ? comment.createdAt.toISOString() : null,
      updatedAt: comment.updatedAt ? comment.updatedAt.toISOString() : null,
      author: {
        userId: author?.userId ?? comment.userId,
        username: author?.username ?? "",
        imageUrl: author?.imageUrl ?? null,
      },
    };

    return {
      type: ResponseType.SUCCESS,
      msg: "Comment created successfully",
      data: {
        comment: responseComment,
      },
      code: 10051,
    };
  }

  public async updateComment(
    user: JwtPayload,
    commentId: number,
    body: { content?: string }
  ): Promise<{
    type: ResponseType;
    updatedComment: CommentDto | null;
    code: number;
  }> {
    try {
      const decryptionUtils = EncriptionUtils.getInstance();
      const decryptedUserId = decryptionUtils.jwtDecryptValue(user.userId);
      const userId = Number(decryptedUserId);

      if (!userId || Number.isNaN(userId)) {
        return {
          type: ResponseType.ERROR,
          updatedComment: null,
          code: 50206,
        };
      }

      const comment = await gallery_post_comments.findByPk(commentId, {
        include: [{ model: gallery_users, as: "user" }],
      });

      if (!comment) {
        // The comment does not exist
        return {
          type: ResponseType.ERROR,
          updatedComment: null,
          code: 50207,
        };
      }

      // Prevent editing if the comment has been created more than 15 minutes ago
      const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
      const createdAt = new Date(comment.createdAt).getTime();
      const now = Date.now();

      if (now - createdAt > FIFTEEN_MINUTES_MS) {
        return {
          type: ResponseType.ERROR,
          updatedComment: null,
          code: 50210,
        };
      }

      if (comment.userId !== userId) {
        // User is not the author of the comment
        return {
          type: ResponseType.ERROR,
          updatedComment: null,
          code: 50208,
        };
      }

      const oldData = comment.toJSON();

      if (typeof body.content === "string") {
        comment.content = body.content;
      }

      comment.updatedAt = new Date();

      await comment.save();

      AuditService.logUpdate({
        table: AuditTable.POST_COMMENTS,
        userId: userId,
        oldData: oldData,
        newData: comment.toJSON(),
      });

      const author = comment.user;

      const responseComment: CommentDto = {
        commentId: comment.commentId,
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content,
        parentCommentId: comment.parentCommentId ?? null,
        isDeleted: comment.isDeleted,
        createdAt: comment.createdAt ? comment.createdAt.toISOString() : null,
        updatedAt: comment.updatedAt ? comment.updatedAt.toISOString() : null,
        author: {
          userId: author?.userId ?? comment.userId,
          username: author?.username ?? "",
          imageUrl: author?.imageUrl ?? null,
        },
      };

      return {
        type: ResponseType.ERROR,
        updatedComment: responseComment,
        code: 10052,
      };
    } catch (error) {
      console.error("Error updating comment:", error);
      return { type: ResponseType.ERROR, updatedComment: null, code: 50209 };
    }
  }

  public async deleteComment(
    user: JwtPayload,
    commentId: number
  ): Promise<{
    type: ResponseType;
    data?: { deleted: boolean };
    code: number;
  }> {
    try {
      const decryptionUtils = EncriptionUtils.getInstance();
      const decryptedUserId = decryptionUtils.jwtDecryptValue(user.userId);
      const userId = Number(decryptedUserId);

      if (!userId || Number.isNaN(userId)) {
        return {
          type: ResponseType.ERROR,
          data: { deleted: false },
          code: 50206,
        };
      }

      const comment = await gallery_post_comments.findByPk(commentId, {
        include: [{ model: gallery_users, as: "user" }],
      });

      if (!comment) {
        return {
          type: ResponseType.ERROR,
          data: { deleted: false },
          code: 50207,
        };
      }

      const oldData = comment.toJSON();

      if (comment.userId !== userId) {
        // User is not the author of the comment
        return {
          type: ResponseType.ERROR,
          data: { deleted: false },
          code: 50211,
        };
      }

      comment.isDeleted = true;
      comment.updatedAt = new Date();

      await comment.save();

      AuditService.logUpdate({
        table: AuditTable.POST_COMMENTS,
        userId: userId,
        oldData: oldData,
        newData: comment.toJSON(),
      });

      // Comment successfully soft deleted
      return {
        type: ResponseType.SUCCESS,
        data: { deleted: true },
        code: 10053,
      };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return {
        type: ResponseType.ERROR,
        data: { deleted: false },
        code: 50210,
      };
    }
  }
}
