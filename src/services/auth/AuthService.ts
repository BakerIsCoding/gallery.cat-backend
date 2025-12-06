import jwt from "jsonwebtoken";
import { jwtConfig } from "@config/jwt";
import { UserRole, type JwtPayload } from "@interfaces/auth";
import { Service } from "typedi";
import gallery_users from "@models/gallery_users_model";
import EncriptionUtils from "@utils/EncryptionUtils";
import AuditService from "@services/audit/AuditService";
import { AuditTable } from "@interfaces/auditInterfaces";
import { simpleVerifyTemplate } from "templates/MailVerifyTemplate";
import { MailService } from "@services/mail/MailService";
import envLoad from "@config/envLoader";

@Service()
export class AuthService {
  public signAccessToken(payload: Omit<JwtPayload, "iat" | "exp">) {
    const secret: jwt.Secret = jwtConfig.accessSecret;
    const options: jwt.SignOptions = { expiresIn: jwtConfig.accessTtl };
    return jwt.sign(payload, secret, options);
  }

  /*
  public signRefreshToken(payload: Omit<JwtPayload, "iat" | "exp">) {
    const secret: jwt.Secret = jwtConfig.refreshSecret as unknown as jwt.Secret;
    const options: jwt.SignOptions = { expiresIn: jwtConfig.refreshTtl };
    return jwt.sign(payload, secret, options);
  }
    */

  public verifyAccessToken(token: string): JwtPayload {
    const secret: jwt.Secret = jwtConfig.accessSecret;
    return jwt.verify(token, secret) as JwtPayload;
  }

  /*
  public verifyRefreshToken(token: string): JwtPayload {
    const secret: jwt.Secret = jwtConfig.refreshSecret as unknown as jwt.Secret;
    return jwt.verify(token, secret) as JwtPayload;
  }
    */

  public async registerUser(
    username: string,
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    id?: number;
    role?: number;
    code: number;
  }> {
    const isUsernameValid = await this.validateUsername(username);
    if (!isUsernameValid.success) {
      return {
        success: false,
        message: isUsernameValid.message,
        code: isUsernameValid.code,
      };
    }

    const isEmailValid = await this.validateEmail(email);
    if (!isEmailValid.success) {
      return {
        success: false,
        message: isEmailValid.message,
        code: isEmailValid.code,
      };
    }

    const isPasswordValid = await this.isPasswordValid(password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Password does not meet security criteria",
        code: 50002,
      };
    }

    const encryptionUtils = EncriptionUtils.getInstance();

    const escapedUsername = this.escapeString(username);
    const escapedEmail = this.escapeString(email);
    const encryptedPassword = await encryptionUtils.hashSensitive(password);
    const registrationToken = encryptionUtils.generateRegistrationToken();

    const userObject = {
      username: escapedUsername,
      email: escapedEmail,
      password: encryptedPassword,
      mailToken: registrationToken,
      isMailConfirmed: false,
      role: UserRole.USER,
    };

    const newUser = await gallery_users.create(userObject);

    if (!newUser) {
      return { success: false, message: "Failed to create user", code: 50000 };
    }

    const template = simpleVerifyTemplate({
      username: escapedUsername,
      verifyUrl: `https://${envLoad(
        "DOMAIN"
      )}/v1/auth/verify?token=${registrationToken}`,
      expiresIn: "15 minutos",
    });

    const service = new MailService();
    service.sendMail(
      escapedEmail,
      "Verifica tu correo en Gallery.cat",
      template.html,
      template.text
    );

    AuditService.logInsert({
      table: AuditTable.USERS,
      userId: newUser.userId,
      newData: newUser.toJSON(),
    });

    return {
      success: true,
      message: "User registered successfully",
      id: newUser.userId,
      role: newUser.role,
      code: 10000,
    };
  }

  public async verifyUserEmail(mailToken: string): Promise<{
    success: boolean;
    message: string;
    code: number;
  }> {
    try {
      const user = await gallery_users.findOne({ where: { mailToken } });

      if (!user) {
        return { success: false, message: "Invalid token", code: 500 };
      }

      if (user.getDataValue("isMailConfirmed")) {
        return {
          success: false,
          message: "Email is already verified",
          code: 500,
        };
      }

      const savedUser = await gallery_users.update(
        {
          isMailConfirmed: true,
        },
        { where: { mailToken } }
      );

      if (!savedUser) {
        return { success: false, message: "Error verifying email", code: 500 };
      }

      AuditService.logUpdate({
        table: AuditTable.USERS,
        userId: user.getDataValue("userId"),
        oldData: user.toJSON(),
        newData: { ...user.toJSON(), isMailConfirmed: true },
      });

      return {
        success: true,
        message: "Email verified successfully",
        code: 10000,
      };
    } catch (error) {
      return { success: false, message: "Error verifying email", code: 500 };
    }
  }

  private async isPasswordValid(password: string): Promise<boolean> {
    if (!password) {
      return false;
    }

    const lengthValid = password.length >= 10 && password.length <= 64;
    const hasLowercase = /[a-z]/.test(password); // at least one lowercase letter
    const hasUppercase = /[A-Z]/.test(password); // at least one uppercase letter
    const hasDigit = /\d/.test(password); // at least one digit
    const hasSymbol = /[^A-Za-z0-9]/.test(password); // at least one symbol
    const noSpaces = !/\s/.test(password); // no whitespace

    if (password.length > 6 && password.length < 64) {
      return true;
    }

    return (
      lengthValid &&
      hasLowercase &&
      hasUppercase &&
      hasDigit &&
      hasSymbol &&
      noSpaces
    );
  }

  private async validateUsername(
    username: string
  ): Promise<{ success: boolean; message: string; code: number }> {
    if (!username) {
      return { success: false, message: "Username is required", code: 50006 };
    }

    username = username.trim();

    if (username.length < 3 || username.length > 32) {
      return {
        success: false,
        message: "Username must be between 3 and 32 characters",
        code: 50006,
      };
    }

    // Invalid characters (example: null or control characters)
    if (/[\x00-\x1F\x7F]/.test(username)) {
      return {
        success: false,
        message: "Username contains invalid characters",
        code: 50007,
      };
    }

    // Avoid username being only spaces
    if (/^\s+$/.test(username)) {
      return {
        success: false,
        message: "Username cannot be only whitespace",
        code: 50008,
      };
    }

    const escapedUsername = this.escapeString(username);

    const obtainedUser = await gallery_users.findOne({
      where: { username: escapedUsername },
    });

    if (obtainedUser) {
      return {
        success: false,
        message: "Username is already taken",
        code: 50009,
      };
    }

    return { success: true, message: "Username is valid", code: 10000 };
  }

  private async validateEmail(
    email: string
  ): Promise<{ success: boolean; message: string; code: number }> {
    if (!email) {
      return { success: false, message: "Email is required", code: 50010 };
    }

    email = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Invalid email format",
        code: 50011,
      };
    }

    // Avoid control characters (null, tabs, newlines)
    if (/[\x00-\x1F\x7F]/.test(email)) {
      return {
        success: false,
        message: "Email contains invalid characters",
        code: 50012,
      };
    }

    const escapedEmail = this.escapeString(email);

    // Check if it is already registered
    const obtainedUser = await gallery_users.findOne({
      where: { email: escapedEmail },
    });

    if (obtainedUser) {
      return {
        success: false,
        message: "Email is already registered",
        code: 50013,
      };
    }

    return { success: true, message: "Email is valid", code: 10000 };
  }

  private escapeString(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/\//g, "&#x2F;");
  }

  private unescapeString(str: string): string {
    return str
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x2F;/g, "/")
      .replace(/&amp;/g, "&");
  }
}
