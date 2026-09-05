import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !['ADMIN', 'TECHNICAL', 'SALES'].includes(session.role)) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const totalProducts = await prisma.product.count();
    const publishedProducts = await prisma.product.count({ where: { status: 'PUBLISHED' } });
    const draftProducts = await prisma.product.count({ where: { status: 'DRAFT' } });
    const machineProducts = await prisma.product.count({ where: { productType: 'COMPLETE_MACHINE' } });
    const partProducts = await prisma.product.count({ where: { productType: 'PART_DRAWING' } });

    const totalFiles = await prisma.file.count();
    const totalFileSize = await prisma.file.aggregate({ _sum: { fileSize: true } });

    const totalOrders = await prisma.order.count();
    const completedOrders = await prisma.order.count({ where: { orderStatus: 'COMPLETED' } });
    const totalRevenue = await prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { total: true }
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        products: {
          total: totalProducts,
          published: publishedProducts,
          draft: draftProducts,
          machines: machineProducts,
          parts: partProducts
        },
        storage: {
          totalFiles,
          totalBytes: totalFileSize._sum.fileSize || 0,
          totalMB: Math.round((totalFileSize._sum.fileSize || 0) / (1024 * 1024))
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          totalRevenue: totalRevenue._sum.total || 0
        },
        recentOrders
      }
    });

  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
