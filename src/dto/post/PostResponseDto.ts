import { ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BaseResponseDto } from "../common/BaseResponseDto";
import { PostDto } from "./PostDto";

class SinglePostDataDto {
  @ValidateNested()
  @Type(() => PostDto)
  post!: PostDto;
}

export class PostResponseDto extends BaseResponseDto {
  @ValidateIf((response) => response.type === "success")
  @ValidateNested()
  @Type(() => SinglePostDataDto)
  data?: SinglePostDataDto;
}
