import { IsString, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BaseResponseDto } from "../common/BaseResponseDto";

class RegisterDataDto {
  @IsString()
  token!: string;
}

export class RegisterResponseDto extends BaseResponseDto {
  @ValidateIf((response) => response.type === "success")
  @ValidateNested()
  @Type(() => RegisterDataDto)
  data?: RegisterDataDto;
}
