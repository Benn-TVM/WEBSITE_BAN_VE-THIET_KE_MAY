import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || !['ADMIN', 'SALES'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xác nhận thanh toán đơn hàng này. Yêu cầu quyền ADMIN hoặc SALES.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Mã đơn hàng không hợp lệ' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        },
        payments: true,
        user: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ message: 'Đơn hàng này đã được xác nhận thanh toán trước đó' });
    }

    // 1. Update Order Status to PAID & COMPLETED
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        orderStatus: 'COMPLETED'
      }
    });

    // 2. Update Payment Record to PAID
    if (order.payments.length > 0) {
      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          status: 'PAID',
          paidAt: new Date()
        }
      });
    }

    // 3. Issue Licenses for each OrderItem (5 downloads, 30 days valid)
    const validFrom = new Date();
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days expiry

    const licensePromises = order.items.map(item => {
      return prisma.license.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          productId: item.productId,
          packageId: item.packageId,
          validFrom,
          validUntil,
          downloadLimit: 5,
          downloadCount: 0,
          status: 'ACTIVE'
        }
      });
    });

    await Promise.all(licensePromises);

    // 4. Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CONFIRM_PAYMENT',
        module: 'ORDERS',
        targetId: order.id,
        newValue: JSON.stringify({
          orderCode: order.orderCode,
          total: order.total,
          customerName: order.user?.name || 'Khách vãng lai',
          customerEmail: order.user?.email || 'N/A',
          licensedItems: order.items.length,
          products: order.items.map(item => item.product.productName),
          confirmedBy: session.email
        }),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Đã xác nhận thanh toán thành công đơn hàng ${order.orderCode} và cấp ${order.items.length} License tải bản vẽ (30 ngày, 5 lượt tải)!`
    });

  } catch (error: unknown) {
    console.error('Error confirming payment:', error);
    return NextResponse.json({ error: getErrorMessage(error, 'Lỗi khi xác nhận thanh toán' )}, { status: 500 });
  }
}
