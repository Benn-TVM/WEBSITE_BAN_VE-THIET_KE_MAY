import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !['ADMIN', 'TECHNICAL', 'SALES'].includes(session.role)) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    const where: Prisma.ProductWhereInput = {};
    if (query) {
      where.OR = [
        { productName: { contains: query } },
        { productCode: { contains: query } },
        { cadCode: { contains: query } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        categories: { include: { category: true } },
        packages: true,
        versions: true,
        _count: { select: { files: true } }
      },
      orderBy: { id: 'desc' }
    });

    return NextResponse.json({ success: true, count: products.length, products });

  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    // TECHNICAL role can manage products, but ADMIN & TECHNICAL can create
    if (!session || !['ADMIN', 'TECHNICAL'].includes(session.role)) {
      return NextResponse.json({ error: 'Không có quyền tạo sản phẩm' }, { status: 403 });
    }

    const body = await req.json();
    const {
      productName,
      productCode,
      cadCode,
      productType,
      description,
      technicalSpecs,
      rightsStatus,
      status,
      categoryIds,
      packages
    } = body;

    if (!productName || !cadCode || !productCode) {
      return NextResponse.json({ error: 'Tên sản phẩm, Mã CAD và Mã Máy là bắt buộc' }, { status: 400 });
    }

    // STRICT BUSINESS RULE: Cannot publish if rights_status is UNKNOWN or NOT_FOR_SALE
    const isValidRightsToPublish = ['OWNED', 'LICENSED', 'AUTHORIZED'].includes(rightsStatus);
    const finalStatus = status || 'DRAFT';

    if (!isValidRightsToPublish && finalStatus === 'PUBLISHED') {
      return NextResponse.json({
        error: `Không thể Xuất bản (Publish) sản phẩm khi Trạng thái Quyền sở hữu là "${rightsStatus}". Quyền bán chưa được xác minh.`
      }, { status: 400 });
    }

    const slug = cadCode.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const product = await prisma.product.create({
      data: {
        productName,
        productCode,
        cadCode,
        slug,
        productType: productType || 'COMPLETE_MACHINE',
        description: description || '',
        technicalSpecs: typeof technicalSpecs === 'string' ? technicalSpecs : JSON.stringify(technicalSpecs || {}),
        rightsStatus: rightsStatus || 'OWNED',
        status: finalStatus
      }
    });

    // Link Categories
    if (categoryIds && Array.isArray(categoryIds)) {
      for (const catId of categoryIds) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId: Number(catId) }
        });
      }
    }

    // Create Initial Version V1.0
    const version = await prisma.version.create({
      data: {
        productId: product.id,
        version: 'V1.0',
        changeNote: 'Khởi tạo bản vẽ đầu tiên',
        createdById: session.userId,
        status: 'ACTIVE'
      }
    });

    // Create Packages if provided
    if (packages && Array.isArray(packages)) {
      for (const pkg of packages) {
        await prisma.productPackage.create({
          data: {
            productId: product.id,
            packageName: pkg.packageName,
            packageCode: pkg.packageCode,
            price: Number(pkg.price),
            description: pkg.description
          }
        });
      }
    }

    // Sync Product Asset (Image URL)
    const imageUrl = body.imageUrl || `/images/products/${cadCode}.png`;
    const assetRows = [
      {
        productId: product.id,
        assetType: 'IMAGE_REAL',
        url: imageUrl,
        isPreview: true,
        watermark: false
      },
      ...[
        { assetType: 'IMAGE_2D', url: body.assetUrls?.IMAGE_2D },
        { assetType: 'MODEL_3D', url: body.assetUrls?.MODEL_3D },
        { assetType: 'IMAGE_DRAWING', url: body.assetUrls?.IMAGE_DRAWING }
      ]
        .filter((asset): asset is { assetType: string; url: string } => Boolean(asset.url))
        .map((asset) => ({
          productId: product.id,
          assetType: asset.assetType,
          url: asset.url,
          isPreview: true,
          watermark: false
        }))
    ];

    await prisma.productAsset.createMany({ data: assetRows });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE_PRODUCT',
        module: 'CATALOG',
        targetId: product.id,
        newValue: JSON.stringify({ cadCode: product.cadCode, name: product.productName, imageUrl }),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    });

    return NextResponse.json({ success: true, product, version });

  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
