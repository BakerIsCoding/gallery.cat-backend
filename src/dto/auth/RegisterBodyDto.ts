import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterBodyDto {
  @IsString()
  @MinLength(3)
  username?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
