import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || !['ADMIN', 'TECHNICAL', 'SALES'].includes(session.role)) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { id } = await params;
    const productId = Number(id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: { include: { category: true } },
        packages: true,
        versions: true,
        files: true,
        assets: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });

  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || !['ADMIN', 'TECHNICAL'].includes(session.role)) {
      return NextResponse.json({ error: 'Không có quyền cập nhật sản phẩm' }, { status: 403 });
    }

    const { id } = await params;
    const productId = Number(id);
    const body = await req.json();

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    const {
      productName,
      productCode,
      cadCode,
      productType,
      description,
      technicalSpecs,
      rightsStatus,
      status
    } = body;

    // Strict Rule Check: If rightsStatus is UNKNOWN or NOT_FOR_SALE, CANNOT publish!
    const effectiveRights = rightsStatus !== undefined ? rightsStatus : existingProduct.rightsStatus;
    const effectiveStatus = status !== undefined ? status : existingProduct.status;
    const isValidRightsToPublish = ['OWNED', 'LICENSED', 'AUTHORIZED'].includes(effectiveRights);

    if (!isValidRightsToPublish && effectiveStatus === 'PUBLISHED') {
      return NextResponse.json({
        error: `Không thể chuyển trạng thái sang Published khi Quyền sở hữu là "${effectiveRights}". Phải chuyển thành OWNED, LICENSED hoặc AUTHORIZED trước.`
      }, { status: 400 });
    }

    const updateData: Prisma.ProductUpdateInput = {};
    if (productName !== undefined) updateData.productName = productName;
    if (productCode !== undefined) updateData.productCode = productCode;
    if (cadCode !== undefined) {
      updateData.cadCode = cadCode;
      updateData.slug = cadCode.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (productType !== undefined) updateData.productType = productType;
    if (description !== undefined) updateData.description = description;
    if (technicalSpecs !== undefined) {
      updateData.technicalSpecs = typeof technicalSpecs === 'string' ? technicalSpecs : JSON.stringify(technicalSpecs);
    }
    if (rightsStatus !== undefined) updateData.rightsStatus = rightsStatus;
    if (status !== undefined) updateData.status = status;

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData
    });

    // Only update assets if explicit imageUrl or assetUrls were supplied in body
    if (body.imageUrl !== undefined || body.assetUrls !== undefined) {
      const previewAssetTypes = ['IMAGE_REAL', 'IMAGE_2D', 'IMAGE_3D', 'MODEL_3D', 'IMAGE_DRAWING'];
      await prisma.productAsset.deleteMany({
        where: {
          productId,
          assetType: { in: previewAssetTypes }
        }
      });

      const assetRows = [
        { assetType: 'IMAGE_REAL', url: body.imageUrl },
        { assetType: 'IMAGE_2D', url: body.assetUrls?.IMAGE_2D },
        { assetType: 'MODEL_3D', url: body.assetUrls?.MODEL_3D },
        { assetType: 'IMAGE_DRAWING', url: body.assetUrls?.IMAGE_DRAWING }
      ].filter((asset): asset is { assetType: string; url: string } => Boolean(asset.url));

      if (assetRows.length > 0) {
        await prisma.productAsset.createMany({
          data: assetRows.map((asset) => ({
            productId,
            assetType: asset.assetType,
            url: asset.url,
            isPreview: true,
            watermark: false
          }))
        });
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE_PRODUCT',
        module: 'CATALOG',
        targetId: product.id,
        newValue: JSON.stringify({ cadCode: product.cadCode, status: product.status, rights: product.rightsStatus, imageUrl: body.imageUrl }),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    });

    return NextResponse.json({ success: true, product });

  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Chỉ Admin mới có quyền xóa sản phẩm' }, { status: 403 });
    }

    const { id } = await params;
    const productId = Number(id);

    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ success: true, message: 'Đã xóa sản phẩm thành công' });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
