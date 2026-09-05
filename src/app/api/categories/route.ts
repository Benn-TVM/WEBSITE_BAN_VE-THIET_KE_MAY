import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getErrorMessage } from '@/lib/errors';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { status: 'ACTIVE' },
      include: {
        children: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
