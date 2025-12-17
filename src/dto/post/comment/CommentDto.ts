import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CommentAuthorDto {
  @IsNumber()
  userId!: number;

  @IsString()
  username!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}

export class CommentDto {
  @IsNumber()
  commentId!: number;

  @IsNumber()
  postId!: number;

  @IsString()
  content!: string | null;

  @IsOptional()
  @IsNumber()
  parentCommentId?: number | null;

  @IsBoolean()
  isDeleted!: boolean;

  @IsOptional()
  @IsString()
  createdAt?: string | null;

  @IsOptional()
  @IsString()
  updatedAt?: string | null;

  author!: CommentAuthorDto;
}
