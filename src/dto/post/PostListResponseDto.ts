import { IsNumber, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BaseResponseDto } from "../common/BaseResponseDto";
import { PostDto } from "./PostDto";

class PostListDataDto {
  @ValidateNested({ each: true })
  @Type(() => PostDto)
  items!: PostDto[];

  @IsNumber()
  total!: number;

  @IsNumber()
  page!: number;

  @IsNumber()
  pageSize!: number;
}

export class PostListResponseDto extends BaseResponseDto {
  @ValidateIf((response) => response.type === "success")
  @ValidateNested()
  @Type(() => PostListDataDto)
  data?: PostListDataDto;
}
