import { IsString, IsEmail, IsOptional, Length, Matches } from 'class-validator';

export class UpdatePersonaDto {
  @IsString()
  @Length(2, 20)
  @IsOptional()
  tipoDoc?: string;

  @IsString()
  @Length(3, 50)
  @IsOptional()
  nomPers?: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsOptional()
  correo?: string;

  @IsString()
  @Length(7, 20)
  @Matches(/^[0-9]+$/, { message: 'El teléfono debe contener solo dígitos' })
  @IsOptional()
  telPers?: string;
}
