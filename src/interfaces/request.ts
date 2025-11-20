import { Request } from "express";
import { JwtPayload } from "./auth";

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}

export type RequestWithJwt = Request & {
  user?: JwtPayload;
};

export interface DefaultApiResponse {
  type: "success" | "error";
  msg: string;
  data?: any;
}
