import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
  refId: string; // student/lecturer id
  iat?: number;
  exp?: number;
}
