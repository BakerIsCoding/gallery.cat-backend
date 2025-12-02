// src/controllers/PostsController.ts
import {
  JsonController,
  Post,
  Get,
  Delete,
  Body,
  Param,
  QueryParam,
  HttpCode,
  Authorized,
  CurrentUser,
  UseBefore,
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Service } from "typedi";
import { ResponseType } from "src/dto/common/BaseResponseDto";
import { InternalServerErrorResponse } from "src/dto/common/InternalServerErrorResponse";

import gallery_posts from "@models/gallery_posts_model";
import gallery_users from "@models/gallery_users_model";
import gallery_post_likes from "@models/gallery_post_likes_model";
import gallery_post_comments from "@models/gallery_post_comments_model";

import { JwtPayload } from "@interfaces/auth";
import { PostResponseDto } from "src/dto/post/PostResponseDto";
import { CreatePostBodyDto } from "src/dto/post/CreatePostBodyDto";
import { PostAuthorDto, PostDto } from "src/dto/post/PostDto";
import { PostListResponseDto } from "src/dto/post/PostListResponseDto";
import { AuthMiddleware } from "src/middlewares/AuthMiddleware";
import { AuthService } from "@services/auth/AuthService";
import EncriptionUtils from "@utils/EncryptionUtils";
import { PostService } from "@services/auth/PostService";
const auth = new AuthMiddleware(new AuthService()).authenticate;

@Service()
@JsonController("/v1/posts")
export class PostsController {
  constructor(private readonly postService: PostService) {}

  @Get("/")
  @HttpCode(200)
  @OpenAPI({
    summary: "List posts",
    description:
      "Returns a paginated list of posts, including author and like/comment counts",
    parameters: [
      {
        name: "page",
        in: "query",
        required: false,
        schema: { type: "integer", default: 1, minimum: 1 },
      },
      {
        name: "pageSize",
        in: "query",
        required: false,
        schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
      },
    ],
  })
  @ResponseSchema(PostListResponseDto, { statusCode: 200 })
  @ResponseSchema(InternalServerErrorResponse, { statusCode: 500 })
  public async listPosts(
    @QueryParam("page") page: number = 1,
    @QueryParam("pageSize") pageSize: number = 10
  ): Promise<PostListResponseDto> {
    try {
      const allPosts = await this.postService.getAllPostsByPage(page, pageSize);

      if (allPosts.code) {
        return {
          type: ResponseType.ERROR,
          msg: "Error retrieving posts",
          code: allPosts.code,
        };
      }

      return {
        type: ResponseType.SUCCESS,
        msg: "Posts retrieved successfully",
        data: {
          items: allPosts.items,
          total: allPosts.count,
          page,
          pageSize,
        },
        code: allPosts.code,
      };
    } catch (error) {
      console.error("Error listing posts:", error);
      return {
        type: ResponseType.ERROR,
        msg: "Error listing posts",
        code: 50000,
      };
    }
  }

  @Get("/:postId")
  @HttpCode(200)
  @OpenAPI({
    summary: "Get post by ID",
    description:
      "Returns a single post by ID, including author and like/comment counts",
    parameters: [
      {
        name: "postId",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
    ],
  })
  @ResponseSchema(PostResponseDto, { statusCode: 200 })
  @ResponseSchema(InternalServerErrorResponse, { statusCode: 500 })
  public async getPost(
    @Param("postId") postId: number
  ): Promise<PostResponseDto> {
    try {
      const responsePost = await this.postService.getPostById(postId);

      if (responsePost.code || !responsePost.responsePost) {
        return {
          type: ResponseType.ERROR,
          msg: "Post not found",
          code: responsePost.code,
        };
      }

      return {
        type: ResponseType.SUCCESS,
        msg: "Post retrieved successfully",
        data: {
          post: responsePost.responsePost,
        },
        code: responsePost.code,
      };
    } catch (error) {
      console.error("Error getting post:", error);
      return {
        type: ResponseType.ERROR,
        msg: "Error getting post",
        code: 50000,
      };
    }
  }

  @Post("/")
  @UseBefore(auth)
  @HttpCode(200)
  @OpenAPI({
    summary: "Create post",
    description: "Creates a new cat photo post for the authenticated user",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/CreatePostBodyDto" },
          example: {
            description: "Mi gato durmiendo",
            imageUrl: "https://example.com/images/cat1.jpg",
          },
        },
      },
    },
  })
  @ResponseSchema(PostResponseDto, { statusCode: 200 })
  public async createPost(
    @CurrentUser() user: JwtPayload,
    @Body({ validate: true }) body: CreatePostBodyDto
  ): Promise<PostResponseDto> {
    try {
      const result = await this.postService.createPost(user, body);

      if (!result.success) {
        return {
          type: ResponseType.ERROR,
          msg: "Error creating post",
          code: result.code,
        };
      }

      return {
        type: ResponseType.SUCCESS,
        msg: "Post created successfully",
        code: result.code,
      };
    } catch (error) {
      console.error("Error creating post (controller):", error);
      return {
        type: ResponseType.ERROR,
        msg: "Error creating post",
        code: 50000,
      };
    }
  }

  @Delete("/:postId")
  @UseBefore(auth)
  @HttpCode(200)
  @OpenAPI({
    summary: "Delete post",
    description:
      "Deletes a post by ID. Only the owner of the post (or admins, según tu lógica) can delete it.",
    parameters: [
      {
        name: "postId",
        in: "path",
        required: true,
        schema: { type: "integer" },
      },
    ],
  })
  @ResponseSchema(PostResponseDto, { statusCode: 200 })
  @ResponseSchema(InternalServerErrorResponse, { statusCode: 500 })
  public async deletePost(
    @CurrentUser() user: JwtPayload,
    @Param("postId") postId: number
  ): Promise<PostResponseDto> {
    try {
      const result = await this.postService.deletePost(user, postId);

      if (!result.success) {
        return {
          type: ResponseType.ERROR,
          msg: "Error deleting post",
          code: result.code,
        };
      }

      return {
        type: ResponseType.SUCCESS,
        msg: "Post deleted successfully",
        code: result.code,
      };
    } catch (error) {
      console.error("Error deleting post (controller):", error);
      return {
        type: ResponseType.ERROR,
        msg: "Error deleting post",
        code: 50000,
      };
    }
  }
}
