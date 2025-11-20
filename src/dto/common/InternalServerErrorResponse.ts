import { Equals } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";

export class InternalServerErrorResponse {
  @Equals("error")
  @JSONSchema({ example: "error" })
  type!: "error";

  @Equals("Internal Server Error")
  @JSONSchema({ example: "Internal Server Error" })
  msg!: "Internal Server Error";
}
