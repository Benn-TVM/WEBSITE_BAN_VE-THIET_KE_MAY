import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getErrorMessage } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const featured = searchParams.get('featured');

    const where: Prisma.ProductWhereInput = {
      status: 'PUBLISHED', // Enforce only published products
    };

    if (featured === 'true') {
      where.featured = true;
    }

    if (type) {
      where.productType = type;
    }

    if (query) {
      where.OR = [
        { productName: { contains: query } },
        { productCode: { contains: query } },
        { cadCode: { contains: query } },
        { description: { contains: query } }
      ];
    }

    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug }
      });

      if (category) {
        // Find all child category IDs if parent
        const childCategories = await prisma.category.findMany({
          where: { parentId: category.id },
          select: { id: true }
        });
        const catIds = [category.id, ...childCategories.map(c => c.id)];

        where.categories = {
          some: {
            categoryId: { in: catIds }
          }
        };
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        categories: {
          include: { category: true }
        },
        packages: {
          where: { status: 'ACTIVE' },
          orderBy: { price: 'asc' }
        },
        assets: true,
        _count: {
          select: { files: true }
        }
      },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
