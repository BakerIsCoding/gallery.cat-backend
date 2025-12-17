import { IsEnum, IsNumber, IsString, Max, Min } from "class-validator";

export enum ResponseType {
  SUCCESS = "success",
  ERROR = "error",
}

export class BaseResponseDto {
  @IsEnum(ResponseType)
  type!: ResponseType;

  @IsString()
  msg!: string;

  @IsNumber()
  code!: number;
}
