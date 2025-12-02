import { IsString, MinLength } from "class-validator";

export class CreatePostBodyDto {
  @IsString()
  @MinLength(1)
  description!: string;

  @IsString()
  @MinLength(1)
  imageUrl!: string;
}
