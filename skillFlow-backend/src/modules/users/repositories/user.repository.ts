import type { Prisma, User } from "@prisma/client";
import { prisma } from "../../../infrastructure/database/lib/prisma.js";

export class UserRepository {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: {
        id,
      },
    });
  }
}

export const userRepository = new UserRepository();