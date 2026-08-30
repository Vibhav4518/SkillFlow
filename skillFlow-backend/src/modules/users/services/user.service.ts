import type { UserResponseDto, UpdateUserDto } from "../dtos/user.dto.js";
import { userRepository } from "../repositories/user.repository.js";
import { UserMapper } from "../mappers/user.mapper.js";

export class UserService {
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await userRepository.findAll();
    return UserMapper.toResponseList(users);
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return UserMapper.toResponse(user);
  }

  async getUserByEmail(email: string): Promise<UserResponseDto> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    return UserMapper.toResponse(user);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    if (data.email && data.email !== existingUser.email) {
      const userWithEmail = await userRepository.findByEmail(data.email);
      if (userWithEmail) {
        throw new Error("Email already in use");
      }
    }
    const updatedUser = await userRepository.update(id, data);
    return UserMapper.toResponse(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    await userRepository.delete(id);
  }
}

export const userService = new UserService();