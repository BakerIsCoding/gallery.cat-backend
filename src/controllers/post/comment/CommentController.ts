// src/controllers/CommentsController.ts
import {
  JsonController,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Authorized,
  CurrentUser,
  HttpCode,
  QueryParam,
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";

import gallery_post_comments from "@models/gallery_post_comments_model";
import gallery_posts from "@models/gallery_posts_model";
import gallery_users from "@models/gallery_users_model";
import { JwtPayload } from "@interfaces/auth";
import EncriptionUtils from "@utils/EncryptionUtils";
import { ResponseType } from "src/dto/common/BaseResponseDto";
import {
  CommentResponseDto,
  SingleCommentDataDto,
} from "src/dto/post/comment/CommentResponseDto";
import { CreateCommentBodyDto } from "src/dto/post/comment/CreateCommentBodyDto";
import { CommentDto } from "src/dto/post/comment/CommentDto";
import { CommentListResponseDto } from "src/dto/post/comment/CommentListResponseDto";
import { UpdateCommentBodyDto } from "src/dto/post/comment/UpdateCommentBodyDto";
import { isUserExistingById } from "@utils/UserUtils";
import AuditService from "@services/audit/AuditService";
import { AuditTable } from "@interfaces/auditInterfaces";
import { CommentsService } from "@services/post/comment/CommentService";

@Service()
@JsonController("/v1")
export class CommentsController {
  @ResponseSchema(CommentListResponseDto, { statusCode: 200 })
  @Get("/posts/:postId/comments")
  @HttpCode(200)
  @OpenAPI({
    summary: "List comments for a post",
    description: "Returns all comments for a given post.",
    parameters: [
      {
        name: "postId",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
      {
        name: "includeDeleted",
        in: "query",
        required: false,
        schema: { type: "boolean", default: false },
      },
    ],
  })
  public async listComments(
    @Param("postId") postId: number
  ): Promise<CommentListResponseDto> {
    try {
      if (!postId || Number.isNaN(postId)) {
        return {
          type: ResponseType.ERROR,
          msg: "This post does not exist",
          code: 50105,
        };
      }

      const commentsService = new CommentsService();
      const { items, count, code } =
        await commentsService.getAllCommentsByPostId(postId);

      return {
        type: ResponseType.SUCCESS,
        msg: "Comments retrieved successfully",
        data: {
          items: items,
          total: count,
        },
        code: code,
      };
    } catch (error) {
      console.error("Error listing comments:", error);
      return {
        type: ResponseType.ERROR,
        msg: "Error listing comments",
        code: 50204,
      };
    }
  }

  @Post("/posts/:postId/comments")
  @Authorized()
  @HttpCode(200)
  @OpenAPI({
    summary: "Create comment",
    description: "Creates a new comment on a post for the authenticated user",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/CreateCommentBodyDto" },
          example: {
            content: "Pretty cool post about cats! 🐱",
            parentCommentId: 1,
          },
        },
      },
    },
  })
  @ResponseSchema(CommentResponseDto, { statusCode: 200 })
  public async createComment(
    @CurrentUser() user: JwtPayload,
    @Param("postId") postId: number,
    @Body({ validate: true }) body: CreateCommentBodyDto
  ): Promise<CommentResponseDto> {
    try {
      if (!postId || Number.isNaN(postId)) {
        return {
          type: ResponseType.ERROR,
          msg: "This post does not exist",
          code: 50105,
        };
      }

      const commentsService = new CommentsService();
      const result = await commentsService.createComment(user, postId, body);
      return {
        type: result.type,
        msg: result.msg,
        data: result.data,
        code: result.code,
      };
    } catch (error) {
      console.error("Error creating comment:", error);
      return {
        type: ResponseType.ERROR,
        msg: "Something went wrong while creating the comment",
        code: 50203,
      };
    }
  }

  @Put("/comments/:commentId")
  @Authorized()
  @HttpCode(200)
  @OpenAPI({
    summary: "Update comment",
    description:
      "Updates a comment. Only the owner of the comment can edit it.",
    parameters: [
      {
        name: "commentId",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/UpdateCommentBodyDto" },
          example: {
            content: "He cambiado de opinión sobre tu gato 😺",
          },
        },
      },
    },
  })
  @ResponseSchema(CommentResponseDto, { statusCode: 200 })
  public async updateComment(
    @CurrentUser() user: JwtPayload,
    @Param("commentId") commentId: number,
    @Body({ validate: true }) body: UpdateCommentBodyDto
  ): Promise<{
    type: ResponseType;
    msg: string;
    data?: SingleCommentDataDto;
    code: number;
  }> {
    try {
      // TODO: Only possible to edit the comment one time
      const commentsService = new CommentsService();

      if (!commentId || Number.isNaN(commentId)) {
        return {
          type: ResponseType.ERROR,
          msg: "Invalid comment id",
          code: 50206,
        };
      }

      const result = await commentsService.updateComment(user, commentId, body);

      if (result.type === ResponseType.ERROR || !result.updatedComment) {
        throw new Error("Error updating comment");
      }

      return {
        type: result.type,
        msg: "Comment updated successfully",
        data: { comment: result.updatedComment },
        code: result.code,
      };
    } catch (error) {
      console.error("Error updating comment:", error);
      return {
        type: ResponseType.ERROR,
        msg: "Error updating comment",
        code: 50209,
      };
    }
  }

  @Delete("/comments/:commentId")
  @Authorized()
  @HttpCode(200)
  @OpenAPI({
    summary: "Delete comment",
    description:
      "Soft deletes a comment (sets isDeleted = true). Only the owner of the comment can delete it.",
    parameters: [
      {
        name: "commentId",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
    ],
  })
  @ResponseSchema(CommentResponseDto, { statusCode: 200 })
  public async deleteComment(
    @CurrentUser() user: JwtPayload,
    @Param("commentId") commentId: number
  ): Promise<{
    type: ResponseType;
    msg: string;
    data?: { deleted: boolean };
    code: number;
  }> {
    try {
      if (!commentId || Number.isNaN(commentId)) {
        return {
          type: ResponseType.ERROR,
          msg: "Invalid comment id",
          code: 50206,
        };
      }

      const commentsService = new CommentsService();
      const result = await commentsService.deleteComment(user, commentId);

      return {
        type: result.type,
        msg: "Comment deleted successfully",
        data: { deleted: true },
        code: result.code,
      };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return {
        type: ResponseType.ERROR,
        msg: "Error deleting comment",
        data: { deleted: false },
        code: 50210,
      };
    }
  }
}
