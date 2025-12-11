import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreatePersonaDto {
  @IsString()
  @Length(5, 20)
  @Matches(/^[0-9]+$/, { message: 'El número de documento debe contener solo dígitos' })
  numDoc: string;

  @IsString()
  @Length(2, 20)
  tipoDoc: string;

  @IsString()
  @Length(3, 50)
  nomPers: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsOptional()
  correo?: string;

  @IsString()
  @IsOptional()
  @Length(7, 20)
  @Matches(/^[0-9]+$/, { message: 'El teléfono debe contener solo dígitos' })
  telPers?: string;

  @IsInt()
  @Min(1)
  idSedeRegistro: number;
}
