import { Equals } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";

export class UnauthorizedResponse {
  @Equals("error")
  @JSONSchema({ example: "error" })
  type!: "error";

  @Equals("Unauthorized")
  @JSONSchema({ example: "Unauthorized" })
  msg!: "Unauthorized";
}
