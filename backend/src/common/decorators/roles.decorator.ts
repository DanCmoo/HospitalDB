import { SetMetadata } from '@nestjs/common';

export type UserRole = 'administrador' | 'medico' | 'enfermero' | 'personal_administrativo';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
