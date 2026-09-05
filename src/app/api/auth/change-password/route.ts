import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, comparePassword, hashPassword } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện đổi mật khẩu' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu mới phải có tối thiểu 6 ký tự' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Người dùng không tồn tại' },
        { status: 404 }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // Verify current password
    const isCurrentValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      // Audit log failed password change attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_CHANGE_FAILED',
          module: 'SECURITY',
          targetId: user.id,
          newValue: JSON.stringify({
            reason: 'Mật khẩu hiện tại không chính xác',
            email: user.email
          }),
          ipAddress: clientIp
        }
      });

      return NextResponse.json(
        { error: 'Mật khẩu hiện tại không chính xác' },
        { status: 400 }
      );
    }

    // Hash and update new password
    const newHashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHashedPassword }
    });

    // Audit log successful password change
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_CHANGED',
        module: 'AUTH',
        targetId: user.id,
        newValue: JSON.stringify({
          message: 'Thay đổi mật khẩu tài khoản thành công',
          email: user.email,
          name: user.name
        }),
        ipAddress: clientIp
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu thành công!'
    });

  } catch (error: unknown) {
    console.error('Change Password Error:', error);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi đổi mật khẩu: ' + getErrorMessage(error) },
      { status: 500 }
    );
  }
}
