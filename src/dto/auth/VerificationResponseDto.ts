import {
  IsBoolean,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { BaseResponseDto } from "../common/BaseResponseDto";

class VerificationDataDto {
  @IsBoolean()
  isVerified!: boolean;
}

export class VerificationResponseDto extends BaseResponseDto {
  @ValidateIf((response) => response.type === "success")
  @ValidateNested()
  @Type(() => VerificationDataDto)
  data?: VerificationDataDto;
}
