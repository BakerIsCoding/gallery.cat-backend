import { IsString, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BaseResponseDto } from "../common/BaseResponseDto";

class LoginDataDto {
  @IsString()
  token!: string;
}

export class LoginResponseDto extends BaseResponseDto {
  @ValidateIf((response) => response.type === "success")
  @ValidateNested()
  @Type(() => LoginDataDto)
  data?: LoginDataDto;
}
