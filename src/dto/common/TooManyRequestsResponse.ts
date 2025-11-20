import { Equals } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";

export class TooManyRequestsResponse {
  @Equals("error")
  @JSONSchema({ example: "error" })
  type!: "error";

  @Equals("Too Many Requests")
  @JSONSchema({ example: "Too Many Requests" })
  msg!: "Too Many Requests";
}
