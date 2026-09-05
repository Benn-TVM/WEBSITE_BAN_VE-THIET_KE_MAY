import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getErrorMessage } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug: slug },
      include: {
        categories: {
          include: { category: true }
        },
        packages: {
          where: { status: 'ACTIVE' },
          orderBy: { price: 'asc' }
        },
        versions: {
          where: { status: 'ACTIVE' },
          orderBy: { id: 'desc' }
        },
        assets: true,
        files: {
          select: {
            id: true,
            packageId: true,
            versionId: true,
            fileName: true,
            fileType: true,
            folderCategory: true,
            fileSize: true,
            createdAt: true
            // NOTE: Do NOT select storagePath or checksum to avoid exposing private file locations!
          },
          orderBy: { folderCategory: 'asc' }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm hoặc bản vẽ không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
