import { IsString, IsInt, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePerteneceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nomDept: string;

  @IsInt()
  @IsNotEmpty()
  codEq: number;
}
