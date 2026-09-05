import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Xac dinh duong dan Database toi uu cho ca Local va Vercel Serverless
function getDatabaseUrl(): string {
  // 1. Neu da cau hinh Database tu xa (Postgres, MySQL, Supabase, Neon):
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL;
  }

  // 2. Neu dang chay tren Vercel Serverless:
  // Vercel co he thong tep Read-Only o /var/task. Ta tu dong copy file dev.db sang /tmp
  // de co quyen READ-WRITE (dat hang, ghi log, tao tai khoan binh thuong tren Vercel)
  if (process.env.VERCEL) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    try {
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
        console.log('[Prisma] Da copy dev.db sang /tmp thanh cong cho Vercel read-write');
      }
    } catch (err) {
      console.warn('[Prisma] Khong the copy dev.db sang /tmp:', err);
    }

    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  // 3. Chay Local thong thuong tren may tinh (Windows / dev):
  const localDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  return `file:${localDbPath}`;
}

// Lazy initialization de tranh loi module evaluation luc build tinh tren Vercel
function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const dbUrl = getDatabaseUrl();
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return globalForPrisma.prisma;
}

// Proxy wrapper tri hoan khoi tao den khi co query thuc te o runtime
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = undefined;
export default prisma;
