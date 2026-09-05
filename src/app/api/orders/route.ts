import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const body = await req.json();
    const { name, email, phone, items } = body;

    if (!email || !name || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đầy đủ thông tin khách hàng và danh sách sản phẩm' },
        { status: 400 }
      );
    }

    // 1. Find or create User
    let user = null;
    if (session) {
      user = await prisma.user.findUnique({
        where: { id: session.userId }
      });
    }

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
    }

    if (!user) {
      // Get default role for USER
      const userRole = await prisma.role.findFirst({
        where: { name: 'USER' }
      });

      const roleId = userRole ? userRole.id : 4; // Fallback to ID 4 if role name lookup fails

      user = await prisma.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          passwordHash: '$2a$10$defaultPasswordHashForGuestCheckout',
          roleId,
          status: 'ACTIVE'
        }
      });
    } else if (phone && !user.phone) {
      // Update phone if missing
      await prisma.user.update({
        where: { id: user.id },
        data: { phone }
      });
    }

    // 2. Calculate Total
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const itemTotal = item.price * (item.quantity || 1);
      subtotal += itemTotal;
      orderItemsData.push({
        productId: item.productId,
        packageId: item.packageId,
        price: item.price,
        quantity: item.quantity || 1
      });
    }

    const total = subtotal;

    // 3. Generate Order Code (e.g. ORD-20260905-8941)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `ORD-${dateStr}-${randomDigits}`;

    // 4. Create Order + OrderItems + Payment in transaction
    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        orderCode,
        subtotal,
        discount: 0,
        total,
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        items: {
          create: orderItemsData
        },
        payments: {
          create: {
            method: 'VIETQR',
            amount: total,
            status: 'PENDING'
          }
        }
      },
      include: {
        items: {
          include: { product: true, package: true }
        },
        payments: true
      }
    });

    // Ghi AuditLog đặt hàng / mua bản vẽ
    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const purchasedSummary = newOrder.items.map(item => ({
      productName: item.product.productName,
      cadCode: item.product.cadCode,
      packageName: item.package.packageName,
      price: item.price,
      quantity: item.quantity
    }));

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ORDER_CREATED',
        module: 'ORDERS',
        targetId: newOrder.id,
        newValue: JSON.stringify({
          orderCode: newOrder.orderCode,
          total: newOrder.total,
          itemCount: newOrder.items.length,
          items: purchasedSummary
        }),
        ipAddress: clientIp
      }
    });

    return NextResponse.json({
      success: true,
      orderCode: newOrder.orderCode,
      total: newOrder.total,
      paymentInfo: {
        bankName: 'MB Bank (Ngân Hàng Quân Đội)',
        accountNumber: '0901234567',
        accountName: 'KTP CAD',
        transferContent: `KTPCAD ${newOrder.orderCode}`
      }
    });

  } catch (error: unknown) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: getErrorMessage(error, 'Lỗi hệ thống khi tạo đơn hàng' )},
      { status: 500 }
    );
  }
}
