// Storage interface using Prisma Client
// This file will be replaced with actual Prisma client usage in routes
// For now, keeping it as placeholder

export interface IStorage {
  // Placeholder - actual database operations will be done via Prisma Client in routes
}

export class PrismaStorage implements IStorage {
  constructor() {
    // Prisma client will be initialized in routes
  }
}

export const storage = new PrismaStorage();
