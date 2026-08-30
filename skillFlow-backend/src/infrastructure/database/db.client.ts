import { prisma } from './lib/prisma.js';

export interface IDatabaseClient {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  execute(sql: string, params?: any[]): Promise<number>;
}

export class PrismaDatabaseClient implements IDatabaseClient {
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return prisma.$queryRawUnsafe<T[]>(sql, ...params);
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] || null;
  }

  async execute(sql: string, params: any[] = []): Promise<number> {
    return prisma.$executeRawUnsafe(sql, ...params);
  }
}

export { prisma } from './lib/prisma.js';
export const db: IDatabaseClient = new PrismaDatabaseClient();
