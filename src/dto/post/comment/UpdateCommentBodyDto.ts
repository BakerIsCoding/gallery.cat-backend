import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateCommentBodyDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;
}
