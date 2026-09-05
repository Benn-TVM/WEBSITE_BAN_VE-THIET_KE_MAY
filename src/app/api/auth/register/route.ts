import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getErrorMessage } from '@/lib/errors';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ Tên, Email và Mật khẩu' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải từ 6 ký tự trở lên' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email này đã được đăng ký tài khoản. Vui lòng đăng nhập.' },
        { status: 400 }
      );
    }

    // Default Role is USER (roleId: 4)
    const userRole = await prisma.role.findFirst({ where: { name: 'USER' } });
    const roleId = userRole ? userRole.id : 4;

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        passwordHash: hashedPassword,
        roleId: roleId,
        status: 'ACTIVE'
      },
      include: {
        role: true
      }
    });

    // Create Cart for User
    await prisma.cart.create({
      data: { userId: user.id }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        module: 'AUTH',
        targetId: user.id,
        newValue: JSON.stringify({ email: user.email, name: user.name, role: user.role.name }),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      roleId: user.roleId
    };

    const token = await createToken(tokenPayload);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      user: tokenPayload
    });

  } catch (error: unknown) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi đăng ký: ' + getErrorMessage(error) },
      { status: 500 }
    );
  }
}
