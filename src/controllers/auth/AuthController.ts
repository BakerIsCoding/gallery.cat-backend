import { AuthService } from "@services/auth/AuthService";
import { JwtPayload, UserRole, ValidateUserResult } from "@interfaces/auth";
import { JsonController, Post, Body, HttpCode } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { LoginResponseDto } from "src/dto/auth/LoginResponseDto";
import { LoginBodyDto } from "src/dto/auth/LoginBodyDto";
import { Service } from "typedi";
import { ResponseType } from "src/dto/common/BaseResponseDto";
import { TooManyRequestsResponse } from "src/dto/common/TooManyRequestsResponse";
import { InternalServerErrorResponse } from "src/dto/common/InternalServerErrorResponse";
import EncriptionUtils from "@utils/EncryptionUtils";
import gallery_users from "@models/gallery_users_model";

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
      };
    }

    const user = await this.validateUser(email, password);
    if (!user.success) {
      return {
        type: ResponseType.ERROR,
        msg: "Invalid credentials",
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

  private async validateUser(
    email: string,
    password: string
  ): Promise<ValidateUserResult> {
    const obtainedUser = await gallery_users.findOne({ where: { email } });

    if (!obtainedUser) {
      return { success: false, message: "User not found" };
    }

    const passwordMatches = await this.passwordHashMatches(
      password,
      obtainedUser?.getDataValue("password") || ""
    );

    if (!passwordMatches) {
      return { success: false, message: "Invalid password" };
    }

    return {
      success: true,
      id: obtainedUser.getDataValue("userId"),
      role: obtainedUser.getDataValue("role"),
    };
  }

  private async passwordHashMatches(
    plainPassword: string,
    hashedPassword: string
  ) {
    if (!plainPassword || !hashedPassword) {
      return false;
    }

    const encryptionUtils = EncriptionUtils.getInstance();
    const result = await encryptionUtils.verifyHash(
      hashedPassword,
      plainPassword
    );

    return result;
  }
}
