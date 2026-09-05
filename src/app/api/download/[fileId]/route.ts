import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập tài khoản để tải file bản vẽ.' },
        { status: 401 }
      );
    }

    const { fileId: fileIdStr } = await params;
    const fileId = parseInt(fileIdStr, 10);
    const { searchParams } = new URL(req.url);
    const licenseIdStr = searchParams.get('licenseId');
    const licenseId = licenseIdStr ? parseInt(licenseIdStr, 10) : null;

    if (isNaN(fileId)) {
      return NextResponse.json({ error: 'ID file không hợp lệ' }, { status: 400 });
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { product: true }
    });

    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file' }, { status: 404 });
    }

    const isStaff = ['ADMIN', 'TECHNICAL'].includes(session.role);
    let license = null;

    if (!isStaff) {
      // 1. Verify License for customer
      if (licenseId) {
        license = await prisma.license.findUnique({
          where: { id: licenseId }
        });
        if (!license || license.userId !== session.userId) {
          return NextResponse.json(
            { error: 'License không hợp lệ hoặc không thuộc sở hữu của tài khoản của bạn.' },
            { status: 403 }
          );
        }
      } else {
        // Find active license for this user and product
        license = await prisma.license.findFirst({
          where: {
            productId: file.productId,
            userId: session.userId,
            status: 'ACTIVE'
          },
          orderBy: { createdAt: 'desc' }
        });
      }

      const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

      if (!license) {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: 'DOWNLOAD_BLOCKED',
            module: 'SECURITY',
            targetId: file.id,
            newValue: JSON.stringify({
              reason: 'Chưa có bản quyền hoặc đơn hàng chưa thanh toán',
              fileName: file.fileName,
              cadCode: file.product.cadCode,
              productName: file.product.productName
            }),
            ipAddress: clientIp
          }
        });

        return NextResponse.json(
          { error: 'Bạn chưa có License bản quyền cho file CAD này hoặc đơn hàng chưa được duyệt thanh toán.' },
          { status: 403 }
        );
      }

      // 2. Check Expiry
      if (new Date() > new Date(license.validUntil)) {
        await prisma.license.update({
          where: { id: license.id },
          data: { status: 'EXPIRED' }
        });

        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: 'DOWNLOAD_BLOCKED',
            module: 'SECURITY',
            targetId: file.id,
            newValue: JSON.stringify({
              reason: 'License bản vẽ đã hết hạn',
              fileName: file.fileName,
              cadCode: file.product.cadCode,
              productName: file.product.productName
            }),
            ipAddress: clientIp
          }
        });

        return NextResponse.json(
          { error: 'License tải bản vẽ này đã hết hạn. Vui lòng liên hệ để gia hạn thêm.' },
          { status: 403 }
        );
      }

      // 3. Check Download Counter
      if (license.downloadCount >= license.downloadLimit) {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: 'DOWNLOAD_BLOCKED',
            module: 'SECURITY',
            targetId: file.id,
            newValue: JSON.stringify({
              reason: `Đã vượt giới hạn ${license.downloadLimit} lần tải`,
              fileName: file.fileName,
              cadCode: file.product.cadCode,
              productName: file.product.productName
            }),
            ipAddress: clientIp
          }
        });

        return NextResponse.json(
          { error: `Bạn đã đạt giới hạn tối đa ${license.downloadLimit} lần tải cho License này.` },
          { status: 403 }
        );
      }

      // 4. Increment Download Counter
      await prisma.license.update({
        where: { id: license.id },
        data: { downloadCount: license.downloadCount + 1 }
      });
    }

    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // 5. Record Download Audit Log
    await prisma.download.create({
      data: {
        userId: session.userId,
        orderId: license?.orderId || null,
        productId: file.productId,
        fileId: file.id,
        versionId: file.versionId,
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || 'Unknown',
        status: 'SUCCESS'
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'DOWNLOAD_CAD',
        module: 'CATALOG',
        targetId: file.id,
        newValue: JSON.stringify({
          fileName: file.fileName,
          cadCode: file.product.cadCode,
          productName: file.product.productName,
          fileSize: `${(file.fileSize / 1024).toFixed(0)} KB`,
          turn: license ? `${license.downloadCount + 1}/${license.downloadLimit}` : 'Admin Unlimited'
        }),
        ipAddress: clientIp
      }
    });

    // 6. Return File stream or simulated CAD file content
    const fileBuffer = Buffer.from(
      `--- KTP CAD PRIVATE FILE STREAM ---\nFile Name: ${file.fileName}\nCAD Code: ${file.product.cadCode}\nFile Type: ${file.fileType}\nFolder Category: ${file.folderCategory}\nDownloaded By User ID: ${session.userId} (${session.email})\nDownloaded At: ${new Date().toISOString()}\nChecksum: Verified OK\n`
    );

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.fileName)}"`
      }
    });

  } catch (error: unknown) {
    console.error('Error downloading file:', error);
    return NextResponse.json({ error: getErrorMessage(error, 'Lỗi khi tải file' )}, { status: 500 });
  }
}
