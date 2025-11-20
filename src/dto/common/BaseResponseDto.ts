import { IsEnum, IsString } from "class-validator";

export enum ResponseType {
  SUCCESS = "success",
  ERROR = "error",
}

export class BaseResponseDto {
  @IsEnum(ResponseType)
  type!: ResponseType;

  @IsString()
  msg!: string;
}
