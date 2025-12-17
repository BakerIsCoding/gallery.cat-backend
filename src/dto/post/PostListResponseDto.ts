import { IsArray, IsNumber, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BaseResponseDto, ResponseType } from "../common/BaseResponseDto";
import { PostDto } from "./PostDto";

class PostListDataDto {
  @IsArray()
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
  @ValidateIf((r) => r.type === ResponseType.SUCCESS)
  @ValidateNested()
  @Type(() => PostListDataDto)
  data?: PostListDataDto;
}
