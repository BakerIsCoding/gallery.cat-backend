import { IsArray, IsNumber, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CommentDto } from "./CommentDto";
import { BaseResponseDto, ResponseType } from "src/dto/common/BaseResponseDto";

export class CommentListDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentDto)
  items!: CommentDto[];

  @IsNumber()
  total!: number;
}

export class CommentListResponseDto extends BaseResponseDto {
  @ValidateIf((response) => response.type === ResponseType.SUCCESS)
  @ValidateNested()
  @Type(() => CommentListDataDto)
  data?: CommentListDataDto;
}
