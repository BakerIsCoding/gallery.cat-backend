import { IsInt, IsOptional, IsString, MinLength } from "class-validator";

export class CreateCommentBodyDto {
  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsInt()
  parentCommentId?: number;
}
