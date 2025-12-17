import { ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CommentDto } from "./CommentDto";
import { BaseResponseDto } from "src/dto/common/BaseResponseDto";

export class SingleCommentDataDto {
  @ValidateNested()
  @Type(() => CommentDto)
  comment!: CommentDto;
}

export class CommentResponseDto extends BaseResponseDto {
  @ValidateIf((response) => response.type === "success")
  @ValidateNested()
  @Type(() => SingleCommentDataDto)
  data?: SingleCommentDataDto;
}
