import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getErrorMessage } from '@/lib/errors';
import { comparePassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập Email và Mật khẩu' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { role: true }
    });

    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const normalizedEmail = email.toLowerCase().trim();

    if (!user) {
      // Ghi log đăng nhập thất bại do email không tồn tại
      const recentFailedCount = await prisma.auditLog.count({
        where: {
          action: 'LOGIN_FAILED',
          oldValue: normalizedEmail,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: null,
          action: 'LOGIN_FAILED',
          module: 'SECURITY',
          oldValue: normalizedEmail,
          newValue: JSON.stringify({
            email: normalizedEmail,
            reason: 'Tài khoản / Email không tồn tại trong hệ thống',
            attemptCount: recentFailedCount + 1
          }),
          ipAddress: clientIp
        }
      });

      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    if (user.status === 'DISABLED') {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_BLOCKED',
          module: 'SECURITY',
          oldValue: user.email,
          newValue: JSON.stringify({
            email: user.email,
            reason: 'Tài khoản đang bị khóa (DISABLED)'
          }),
          ipAddress: clientIp
        }
      });

      return NextResponse.json(
        { error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.' },
        { status: 403 }
      );
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      // Đếm số lần nhập sai mật khẩu trong 24h
      const recentFailedCount = await prisma.auditLog.count({
        where: {
          action: 'LOGIN_FAILED',
          OR: [
            { userId: user.id },
            { oldValue: normalizedEmail }
          ],
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          module: 'SECURITY',
          oldValue: normalizedEmail,
          newValue: JSON.stringify({
            email: user.email,
            name: user.name,
            reason: 'Mật khẩu không chính xác',
            attemptCount: recentFailedCount + 1
          }),
          ipAddress: clientIp
        }
      });

      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      roleId: user.roleId
    };

    const token = await createToken(tokenPayload);
    await setAuthCookie(token);

    // Audit log đăng nhập thành công
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        module: 'AUTH',
        targetId: user.id,
        newValue: JSON.stringify({
          role: user.role.name,
          name: user.name,
          email: user.email
        }),
        ipAddress: clientIp
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: tokenPayload
    });

  } catch (error: unknown) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi đăng nhập: ' + getErrorMessage(error) },
      { status: 500 }
    );
  }
}
