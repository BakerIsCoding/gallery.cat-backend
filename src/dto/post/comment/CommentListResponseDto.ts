import { IsNumber, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CommentDto } from "./CommentDto";
import { BaseResponseDto } from "src/dto/common/BaseResponseDto";

export class CommentListDataDto {
  @ValidateNested({ each: true })
  @Type(() => CommentDto)
  items!: CommentDto[];

  @IsNumber()
  total!: number;
}

export class CommentListResponseDto extends BaseResponseDto {
  @ValidateIf((response) => response.type === "success")
  @ValidateNested()
  @Type(() => CommentListDataDto)
  data?: CommentListDataDto;
}
