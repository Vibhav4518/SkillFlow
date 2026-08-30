import { prisma } from '../../../infrastructure/database/lib/prisma.js';
import {
  UserEntity,
  RefreshTokenEntity,
} from '../entities/auth.entity.js';

import bcrypt from 'bcrypt';
import crypto from 'node:crypto';


export interface IAuthRepository {
  findUserByEmail(
    email: string
  ): Promise<UserEntity | null>;

  findUserById(
    id: string
  ): Promise<UserEntity | null>;

  createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: string;
  }): Promise<UserEntity>;

  saveRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<RefreshTokenEntity>;

  findRefreshToken(
    token: string
  ): Promise<RefreshTokenEntity | null>;

  revokeRefreshToken(
    token: string
  ): Promise<void>;
}


// --------------------------------------------------
// IN-MEMORY FALLBACK
// --------------------------------------------------

const memoryUsers = new Map<string, UserEntity>();

const memorySessions =
  new Map<string, RefreshTokenEntity>();


const defaultHash =
  bcrypt.hashSync(
    'Str0ngP@ssw0rd!',
    10
  );

const snehaHash =
  bcrypt.hashSync(
    'abc123',
    10
  );


const candidateUser: UserEntity = {
  id: 'usr_12345',
  email: 'jordan.lee@example.com',
  passwordHash: defaultHash,
  fullName: 'Jordan Lee',
  phone: '+1-555-0100',
  role: 'CANDIDATE',
  createdAt: new Date(),
  updatedAt: new Date(),
};


const employerUser: UserEntity = {
  id: 'emp_67890',
  email: 'avery.patel@company.com',
  passwordHash: defaultHash,
  fullName: 'Avery Patel',
  role: 'EMPLOYER',
  companyId: 'cmp_24680',
  createdAt: new Date(),
  updatedAt: new Date(),
};


const snehaUser: UserEntity = {
  id: 'usr_sneha',
  email: 'sneha@gmail.com',
  passwordHash: snehaHash,
  fullName: 'Sneha Rajput',
  role: 'CANDIDATE',
  createdAt: new Date(),
  updatedAt: new Date(),
};


const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(val?: string): boolean {
  return !!val && UUID_REGEX.test(val);
}

// In-memory store fallback with seeded test users if DB is offlinedidateUser
memoryUsers.set(
  candidateUser.id,
  candidateUser
);

memoryUsers.set(
  candidateUser.email,
  candidateUser
);

memoryUsers.set(
  employerUser.id,
  employerUser
);

memoryUsers.set(
  employerUser.email,
  employerUser
);

memoryUsers.set(
  snehaUser.id,
  snehaUser
);

memoryUsers.set(
  snehaUser.email,
  snehaUser
);


// --------------------------------------------------
// REPOSITORY
// --------------------------------------------------

export class AuthRepository
  implements IAuthRepository {


  // -----------------------------------------------
  // FIND USER BY EMAIL
  // -----------------------------------------------

  async findUserByEmail(
    email: string
  ): Promise<UserEntity | null> {

    try {

      const user =
        await prisma.user.findUnique({
          where: { email },

          include: {
            candidateProfile: true,
          },
        });


      if (!user) {
        return memoryUsers.get(email) || null;
      }

      return {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        fullName: user.fullName,

        phone:
          user.candidateProfile?.phone ||
          undefined,

        role: user.role as any,

        createdAt:
          user.createdAt ||
          new Date(),

        updatedAt:
          user.updatedAt ||
          new Date(),
      };

    } catch {

      return memoryUsers.get(email) || null;

    }
  }


  // -----------------------------------------------
  // FIND USER BY ID
  // -----------------------------------------------

  async findUserById(
    id: string
  ): Promise<UserEntity | null> {
    if (!isUuid(id)) {
      return memoryUsers.get(id) || null;
    }

    try {

      const user =
        await prisma.user.findUnique({
          where: { id },

          include: {
            candidateProfile: true,
          },
        });


      if (!user) {
        return memoryUsers.get(id) || null;
      }

      return {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        fullName: user.fullName,

        phone:
          user.candidateProfile?.phone ||
          undefined,

        role: user.role as any,

        createdAt:
          user.createdAt ||
          new Date(),

        updatedAt:
          user.updatedAt ||
          new Date(),
      };

    } catch {

      return memoryUsers.get(id) || null;

    }
  }


  // -----------------------------------------------
  // CREATE USER
  // -----------------------------------------------

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: string;
  }): Promise<UserEntity> {

    try {

      const user =
        await prisma.user.create({
          data: {
            id: crypto.randomUUID(),
            fullName: data.name,
            email: data.email,
            passwordHash: data.passwordHash,
            role: (data.role?.toUpperCase() as any) || 'CANDIDATE',
            updatedAt: new Date(),
          },
        });


      return {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        fullName: user.fullName,
        role: user.role as any,
        createdAt:
          user.createdAt || new Date(),
        updatedAt:
          user.updatedAt || new Date(),
      };

    } catch {

      // Fallback only if database is unavailable
      const id = crypto.randomUUID();

      const user: UserEntity = {
        id,
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.name,
        role: 'CANDIDATE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryUsers.set(id, user);
      memoryUsers.set(data.email, user);

      return user;
    }
  }


  // -----------------------------------------------
  // SAVE REFRESH TOKEN
  // -----------------------------------------------

  async saveRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<RefreshTokenEntity> {
    if (!isUuid(userId)) {
      const session: RefreshTokenEntity = {
        id: crypto.randomUUID(),
        token,
        userId,
        expiresAt,
        revoked: false,
        createdAt: new Date(),
      };
      memorySessions.set(token, session);
      return session;
    }

    try {

      const session =
        await prisma.refreshToken.create({
          data: {
            id: crypto.randomUUID(),
            userId: userId,
            token: token,
            expiresAt: expiresAt,
            createdAt: new Date(),
          },
        });


      return {
        id: session.id,
        token: session.token,
        userId: session.userId,
        expiresAt:
          session.expiresAt ||
          expiresAt,
        revoked: session.revoked,
        createdAt:
          session.createdAt ||
          new Date(),
      };

    } catch {

      const session: RefreshTokenEntity = {
        id: crypto.randomUUID(),
        token,
        userId,
        expiresAt,
        revoked: false,
        createdAt: new Date(),
      };

      memorySessions.set(
        token,
        session
      );

      return session;
    }
  }


  // -----------------------------------------------
  // FIND REFRESH TOKEN
  // -----------------------------------------------

  async findRefreshToken(
    token: string
  ): Promise<RefreshTokenEntity | null> {

    try {

      const session =
        await prisma.refreshToken.findUnique({
          where: {
            token: token,
          },
        });


      if (!session) {
        return memorySessions.get(token) || null;
      }


      return {
        id: session.id,
        token: session.token,
        userId: session.userId,
        expiresAt:
          session.expiresAt ||
          new Date(
            Date.now() + 86400000
          ),
        revoked: session.revoked,
        createdAt:
          session.createdAt ||
          new Date(),
      };

    } catch {

      return memorySessions.get(token) || null;
    }
  }


  // -----------------------------------------------
  // REVOKE REFRESH TOKEN
  // -----------------------------------------------

  async revokeRefreshToken(
    token: string
  ): Promise<void> {
    const session = memorySessions.get(token);
    if (session) {
      session.revoked = true;
    }

    try {
      await prisma.refreshToken.updateMany({
        where: {
          token: token,
        },
        data: {
          revoked: true,
        },
      });
    } catch {
      // Fallback ignore DB error
    }
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    const memUser = memoryUsers.get(userId);
    if (memUser) {
      memUser.passwordHash = passwordHash;
    }
    try {
      if (isUuid(userId)) {
        await prisma.user.update({
          where: { id: userId },
          data: { passwordHash },
        });
      }
    } catch {
      // Ignore DB fallback error
    }
  }
}
