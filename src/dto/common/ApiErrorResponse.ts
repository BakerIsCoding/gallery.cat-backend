import { Equals, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";

export class ApiErrorResponse {
  @Equals("error")
  @JSONSchema({ example: "error" })
  type!: "error";

  @IsString()
  msg!: string;
}
