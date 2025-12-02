import { IsNumber, IsOptional, IsString } from "class-validator";

export class PostAuthorDto {
  @IsNumber()
  userId!: number;

  @IsString()
  username!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}

export class PostDto {
  @IsNumber()
  postId!: number;

  @IsNumber()
  userId!: number;

  @IsString()
  description!: string;

  @IsString()
  imageUrl!: string;

  @IsOptional()
  @IsString()
  createdAt?: string | null;

  @IsOptional()
  @IsString()
  updatedAt?: string | null;

  @IsNumber()
  likeCount!: number;

  @IsNumber()
  commentCount!: number;

  author!: PostAuthorDto;
}
