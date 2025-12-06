import { AuthService } from "@services/auth/AuthService";
import { JwtPayload, UserRole, ValidateUserResult } from "@interfaces/auth";
import {
  JsonController,
  Post,
  Body,
  HttpCode,
  Param,
  QueryParam,
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { LoginResponseDto } from "src/dto/auth/LoginResponseDto";
import { LoginBodyDto } from "src/dto/auth/LoginBodyDto";
import { Service } from "typedi";
import { ResponseType } from "src/dto/common/BaseResponseDto";
import { TooManyRequestsResponse } from "src/dto/common/TooManyRequestsResponse";
import { InternalServerErrorResponse } from "src/dto/common/InternalServerErrorResponse";
import EncriptionUtils from "@utils/EncryptionUtils";
import gallery_users from "@models/gallery_users_model";
import { RegisterResponseDto } from "src/dto/auth/RegisterResponseDto";
import { RegisterBodyDto } from "src/dto/auth/RegisterBodyDto";
import { VerificationResponseDto } from "src/dto/auth/VerificationResponseDto";

@Service()
@JsonController("/v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/login")
  @HttpCode(200)
  @OpenAPI({
    summary: "Login",
    description: "Returns an access token upon successful login",
    security: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/LoginBodyDto" },
          example: {
            email: "valid@mail.com",
            password: "superdupermegaultrasecurep@ssword",
          },
        },
      },
    },
  })
  @ResponseSchema(LoginResponseDto, { statusCode: 200 })
  @ResponseSchema(TooManyRequestsResponse, { statusCode: 429 })
  @ResponseSchema(InternalServerErrorResponse, { statusCode: 500 })
  public async login(
    @Body({ validate: true }) body: LoginBodyDto
  ): Promise<LoginResponseDto> {
    const { email, password } = body;

    if (!email || !password) {
      return {
        type: ResponseType.ERROR,
        msg: "Mail and password are required",
        code: 50001,
      };
    }

    const user = await this.authService.validateUser(email, password);
    if (!user.success) {
      return {
        type: ResponseType.ERROR,
        msg: "Invalid credentials",
        code: user.code,
      };
    }

    const encryptionUtils = EncriptionUtils.getInstance();
    const encryptedUserId = encryptionUtils.jwtEncryptValue(user.id.toString());
    const encryptedRoleId = encryptionUtils.jwtEncryptValue(
      user.role.toString()
    );

    if (encryptedUserId === null) {
      return {
        type: ResponseType.ERROR,
        msg: "Something went wrong while encrypting userId",
        code: 50003,
      };
    }

    const payload: Omit<JwtPayload, "iat" | "exp"> = {
      userId: encryptedUserId,
      role: encryptedRoleId,
    };

    const accessToken = this.authService.signAccessToken(payload);

    return {
      type: ResponseType.SUCCESS,
      msg: "Successful login",
      data: { token: accessToken },
      code: 10001,
    };
  }

  @Post("/register")
  @HttpCode(200)
  @OpenAPI({
    summary: "Register",
    description: "Returns success upon successful registration",
    security: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/RegisterBodyDto" },
          example: {
            username: "newuser",
            email: "valid@mail.com",
            password: "superdupermegaultrasecurep@ssword",
          },
        },
      },
    },
  })
  @ResponseSchema(RegisterResponseDto, { statusCode: 200 })
  @ResponseSchema(TooManyRequestsResponse, { statusCode: 429 })
  @ResponseSchema(InternalServerErrorResponse, { statusCode: 500 })
  public async register(
    @Body({ validate: true }) body: RegisterBodyDto
  ): Promise<RegisterResponseDto> {
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return {
        type: ResponseType.ERROR,
        msg: "Username, email and password are required",
        code: 50004,
      };
    }

    const user = await this.authService.registerUser(username, email, password);

    if (!user.success) {
      return {
        type: ResponseType.ERROR,
        msg: user.message,
        code: user.code,
      };
    }

    return {
      type: ResponseType.SUCCESS,
      msg: "Register successful",
      code: 10002,
    };
  }

  /*
  public async refresh(req: Request, res: Response) {
    const { refresh_token } = req.body || {};
    if (!refresh_token)
      return res
        .status(400)
        .json({ type: "error", msg: "Falta refresh_token" });
    try {
      const payload = this.authService.verifyRefreshToken(refresh_token);
      const access_token = this.authService.signAccessToken({
        sub: payload.sub,
        roles: payload.roles,
      });
      return res.json({ type: "ok", data: { access_token } });
    } catch {
      return res
        .status(401)
        .json({ type: "error", msg: "Refresh token inválido" });
    }
  }
  */

  @Post("/verify")
  @HttpCode(200)
  @OpenAPI({
    summary: "Verify Mail",
    description: "Verifies a user's email using a token",
    security: [],
    parameters: [
      {
        name: "token",
        in: "query",
        required: true,
        schema: { type: "string" },
        description: "Verification token sent to the user's email",
      },
    ],
  })
  @ResponseSchema(VerificationResponseDto, { statusCode: 200 })
  @ResponseSchema(TooManyRequestsResponse, { statusCode: 429 })
  @ResponseSchema(InternalServerErrorResponse, { statusCode: 500 })
  public async verify(
    @QueryParam("token") token: string
  ): Promise<VerificationResponseDto> {
    if (!token) {
      return {
        type: ResponseType.ERROR,
        msg: "Verification token is required",
        code: 50016,
      };
    }

    const userVerify = await this.authService.verifyUserEmail(token);

    if (!userVerify.success) {
      return {
        type: ResponseType.ERROR,
        msg: userVerify.message,
        code: userVerify.code,
      };
    }

    return {
      type: ResponseType.SUCCESS,
      msg: "Mail validated successfully",
      code: 10002,
    };
  }
}
