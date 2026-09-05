import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  PhoneCall,
  Lock,
  FolderTree
} from 'lucide-react';
import prisma from '@/lib/prisma';
import WatermarkPreviewPlayer from '@/components/WatermarkPreviewPlayer';
import ProductPackageSelector from '@/components/ProductPackageSelector';

interface ProductDetailPageProps {
  params: Promise<{
    categorySlug: string;
    productSlug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productSlug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    include: {
      categories: { include: { category: true } },
      packages: { where: { status: 'ACTIVE' }, orderBy: { price: 'asc' } },
      versions: { where: { status: 'ACTIVE' }, orderBy: { id: 'desc' } },
      assets: true,
      files: {
        select: {
          id: true,
          packageId: true,
          versionId: true,
          fileName: true,
          fileType: true,
          folderCategory: true,
          fileSize: true
        },
        orderBy: { folderCategory: 'asc' }
      }
    }
  });

  if (!product || product.status !== 'PUBLISHED') {
    notFound();
  }

  const technicalSpecs = product.technicalSpecs
    ? (JSON.parse(product.technicalSpecs) as Record<string, unknown>)
    : {};
  const getAssetUrl = (assetType: string) =>
    product.assets.find((asset) => asset.assetType === assetType)?.url;
  const previewImage = getAssetUrl('IMAGE_REAL') || product.assets?.[0]?.url;
  const preview2dImage = getAssetUrl('IMAGE_2D');
  const preview3dImage = getAssetUrl('MODEL_3D') || getAssetUrl('IMAGE_3D');
  const drawingImage = getAssetUrl('IMAGE_DRAWING');

  // Standardized 9 Folders defined in KTP CAD spec
  const folderNamesMap: Record<string, string> = {
    '01_GENERAL': '01. Bản Vẽ Tổng Thể (General Assembly)',
    '02_ASSEMBLY': '02. Bản Vẽ Lắp Từng Cụm (Assembly Drawings)',
    '03_PART_DRAWINGS': '03. Bản Vẽ Chi Tiết Gia Công (Part Drawings)',
    '04_FABRICATION': '04. Bản Vẽ Bộc Lót Cắt Laser/Plasma (Fabrication)',
    '05_ELECTRICAL': '05. Sơ Đồ Mạch Điện (Electrical Diagram)',
    '06_BOM': '06. Bảng Kê Vật Tư Linh Kiện (BOM Material List)',
    '07_3D': '07. Mô Hình 3D Lắp Ráp STEP (3D Assembly)',
    '08_MANUAL': '08. Hướng Dẫn Vận Hành & Lắp Ráp (Manual)',
    '09_REVISION': '09. Lịch Sử Phiên Bản & Hiệu Chỉnh (Revision)'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link href="/" className="hover:text-[#3583b2]">Trang chủ</Link>
        <span>/</span>
        <Link href="/cad" className="hover:text-[#3583b2]">Thư viện CAD</Link>
        <span>/</span>
        <span className="text-[#3583b2] font-bold">{product.productName}</span>
      </div>

      {/* Main Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Watermark Drawing Viewer */}
        <div className="lg:col-span-7 space-y-6">
          <WatermarkPreviewPlayer
            productName={product.productName}
            cadCode={product.cadCode}
            previewImage={previewImage}
            preview2dImage={preview2dImage}
            preview3dImage={preview3dImage}
            drawingImage={drawingImage}
          />

          {/* Machine Rights & Certification Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
              <div>
                <div>BẢN QUYỀN SỞ HỮU GỐC KTP CAD</div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Đã kiểm tra tính khả thi gia công & lắp ráp thực tế
                </div>
              </div>
            </div>
            <span className="font-mono text-[#2c6e98] font-black bg-[#eef7fc] px-2.5 py-1 rounded border border-[#b8ddf0]">
              {product.cadCode}
            </span>
          </div>
        </div>

        {/* Right Column: Title, Package Selector & Purchase Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-white bg-[#69afd7] px-2.5 py-0.5 rounded">
                {product.cadCode}
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">
                Mã máy: {product.productCode}
              </span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 leading-snug">
              {product.productName}
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          {/* Package Selection Component */}
          <ProductPackageSelector
            productId={product.id}
            productName={product.productName}
            cadCode={product.cadCode}
            packages={product.packages}
          />

          {/* Technical Consultation Support Box */}
          <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#69afd7] font-bold">
              <PhoneCall className="w-4 h-4 text-[#69afd7]" />
              <span>Cần Tư Vấn Kỹ Thuật Trước Khi Mua?</span>
            </div>
            <p className="text-slate-300 text-[11px] font-medium">
              Kỹ sư KTP sẽ hỗ trợ giải đáp thắc mắc về định dạng file, thông số vật tư & phương án gia công:
            </p>
            <div className="font-mono font-bold text-white text-sm">
              Hotline / Zalo: <span className="text-[#69afd7]">0901 234 567</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Tabs Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">

        {/* Tab Header Titles */}
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-[#3583b2]" />
            Chi Tiết Bộ Hồ Sơ Kỹ Thuật 9 Thư Mục CAD
          </h3>
        </div>

        {/* Specs Table */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            1. Bảng Thông Số Kỹ Thuật Sản Phẩm (Model Technical Specifications)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {Object.entries(technicalSpecs).map(([key, val]) => (
              <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between font-medium">
                <span className="text-slate-600">{key}:</span>
                <span className="font-bold text-slate-900 font-mono">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 9 Folders File Listing */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            2. Cấu Trúc 9 Thư Mục Kỹ Thuật Đã Chuẩn Hóa
          </h4>

          <div className="space-y-3">
            {Object.entries(folderNamesMap).map(([folderKey, folderTitle]) => {
              const matchingFiles = product.files.filter(f => f.folderCategory === folderKey);
              return (
                <div key={folderKey} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-[#3583b2]" />
                      <span>{folderTitle}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                      {matchingFiles.length} file đính kèm
                    </span>
                  </div>

                  {matchingFiles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                      {matchingFiles.map(f => (
                        <div key={f.id} className="bg-white border border-slate-200 px-3 py-1.5 rounded flex items-center justify-between text-slate-900 font-medium">
                          <span className="truncate">{f.fileName}</span>
                          <span className="text-[10px] text-[#2c6e98] bg-[#eef7fc] px-1.5 py-0.5 rounded ml-2 shrink-0 font-bold border border-[#b8ddf0]">
                            {f.fileType}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic pl-6">
                      (Bản vẽ/Tài liệu thuộc gói nâng cao FULL PRO)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* License Policy Notice */}
        <div className="bg-[#eef7fc] border border-[#b8ddf0] p-5 rounded-2xl space-y-2 text-xs text-slate-900">
          <div className="flex items-center gap-2 font-black text-[#2c6e98] text-sm">
            <Lock className="w-4 h-4 text-[#3583b2]" />
            <span>Quy Định Cấp Quyền Tải & Bảo Mã Đường Dẫn (Signed Link License Policy)</span>
          </div>
          <ul className="space-y-1 text-slate-700 list-disc list-inside font-medium">
            <li>Tối đa <strong>5 lượt tải file</strong> cho mỗi gói đã mua.</li>
            <li>Đường link tải có hiệu lực trong vòng <strong>30 ngày</strong> kể từ khi Admin xác nhận thanh toán.</li>
            <li>Link tải được ký số an toàn (Signed URL), phát hiện và ngăn chặn chia sẻ link công khai trái phép.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
