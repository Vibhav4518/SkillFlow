import { UserEntity } from '../entities/auth.entity.js';
import { AuthUserResponse } from '../dtos/auth.dto.js';

export class AuthMapper {
  static toUserResponse(user: UserEntity): AuthUserResponse {
    const fullName =
      (user as any).fullName ||
      user.fullName ||
      user.email.split('@')[0];

    const response: AuthUserResponse = {
      id: user.id,
      fullName,
      email: user.email,
      role: user.role,
    };

    if (user.phone) {
      response.phone = user.phone;
    }

    if (user.companyId) {
      response.companyId = user.companyId;
    }

    return response;
  }
}