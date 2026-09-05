'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import AdminProductMediaSection from '@/components/AdminProductMediaSection';

export default function AdminNewProductPage() {
  const router = useRouter();

  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [cadCode, setCadCode] = useState('');
  const [productType, setProductType] = useState('COMPLETE_MACHINE');
  const [rightsStatus, setRightsStatus] = useState('OWNED');
  const [status, setStatus] = useState('DRAFT');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('9900000');
  const [imageUrl, setImageUrl] = useState('');
  const [image2dUrl, setImage2dUrl] = useState('');
  const [model3dUrl, setModel3dUrl] = useState('');
  const [drawingImageUrl, setDrawingImageUrl] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Rule Check
    const canPublish = ['OWNED', 'LICENSED', 'AUTHORIZED'].includes(rightsStatus);
    if (status === 'PUBLISHED' && !canPublish) {
      setError(`Không thể Xuất bản (Publish) khi Quyền sở hữu là "${rightsStatus}". Vui lòng chọn OWNED, LICENSED hoặc giữ DRAFT.`);
      return;
    }

    setLoading(true);

    try {
      const numPrice = Number(price) || 0;
      const pdfPrice = Math.round((numPrice * 0.35) / 100000) * 100000;
      const cadPrice = Math.round((numPrice * 0.70) / 100000) * 100000;

      const packages = productType === 'COMPLETE_MACHINE' ? [
        { packageName: 'GÓI PDF BASIC', packageCode: 'PDF_BASIC', price: pdfPrice, description: 'File PDF tổng thể & kích thước' },
        { packageName: 'GÓI CAD STANDARD', packageCode: 'CAD_STANDARD', price: cadPrice, description: 'File PDF + DWG/DXF 2D chi tiết' },
        { packageName: 'GÓI FULL ENGINEERING PRO', packageCode: 'FULL_PRO', price: numPrice, description: 'Trọn bộ PDF, DWG, DXF, 3D STEP & BOM' }
      ] : [
        { packageName: 'GÓI PART STANDARD', packageCode: 'PART_STANDARD', price: numPrice, description: 'File PDF 2D dimension, DWG cutting & 3D STEP' }
      ];

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productCode,
          cadCode,
          productType,
          rightsStatus,
          status: canPublish ? status : 'DRAFT',
          description,
          imageUrl: imageUrl || `/images/products/${cadCode}.png`,
          assetUrls: {
            IMAGE_2D: image2dUrl,
            MODEL_3D: model3dUrl,
            IMAGE_DRAWING: drawingImageUrl
          },
          categoryIds: productType === 'COMPLETE_MACHINE' ? [10] : [30],
          packages
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Tạo sản phẩm thất bại');
        setLoading(false);
        return;
      }

      router.push('/admin/products');
      router.refresh();
    } catch {
      setError('Lỗi kết nối máy chủ khi tạo sản phẩm');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900">Thêm Bản Vẽ Sản Phẩm Mới</h1>
          <p className="text-xs text-slate-500 font-medium">
            Tạo bản vẽ máy hoặc phụ tùng mới, cấu hình 3 gói giá và kiểm soát bản quyền
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mã CAD Sản Phẩm (*)</label>
              <input
                type="text"
                required
                value={cadCode}
                onChange={(e) => setCadCode(e.target.value.toUpperCase())}
                placeholder="Ví dụ: CAD-MBG025"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#69afd7] font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Mã Máy / Mã Phụ Tùng (*)</label>
              <input
                type="text"
                required
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="Ví dụ: MBG-025"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#69afd7] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Tên Máy / Tên Bản Vẽ Phụ Tùng (*)</label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ví dụ: MÁY BO GẠCH TỰ ĐỘNG MBG-025 KTP"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#69afd7] font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Loại Sản Phẩm</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#69afd7] font-medium"
              >
                <option value="COMPLETE_MACHINE">Bản Vẽ Máy Hoàn Chỉnh</option>
                <option value="PART_DRAWING">Bản Vẽ Phụ Tùng / Linh Kiện</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Quyền Bản Quyền (Rights Status) (*)</label>
              <select
                value={rightsStatus}
                onChange={(e) => setRightsStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-[#69afd7]"
              >
                <option value="OWNED">OWNED (Sở Hữu Gốc KTP)</option>
                <option value="LICENSED">LICENSED (Có Bản Quyền Cấp)</option>
                <option value="AUTHORIZED">AUTHORIZED (Ủy Quyền Thương Mại)</option>
                <option value="UNKNOWN">UNKNOWN (Chưa Rõ - Khóa Publish)</option>
                <option value="NOT_FOR_SALE">NOT_FOR_SALE (Không Được Bán)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Trạng Thái Hiển Thị</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-[#69afd7]"
              >
                <option value="DRAFT">DRAFT (Bản Nháp)</option>
                <option value="PUBLISHED">PUBLISHED (Xuất Bản)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Mô Tả Kỹ Thuật Chi Tiết</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả ứng dụng máy, số lượng bản vẽ và tính năng..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#69afd7] font-medium"
            ></textarea>
          </div>

          {/* Compact Product Media Section (4-column grid) */}
          <AdminProductMediaSection
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            image2dUrl={image2dUrl}
            setImage2dUrl={setImage2dUrl}
            model3dUrl={model3dUrl}
            setModel3dUrl={setModel3dUrl}
            drawingImageUrl={drawingImageUrl}
            setDrawingImageUrl={setDrawingImageUrl}
            cadCode={cadCode}
          />

          <div>
            <label className="block text-slate-700 font-bold mb-1">Giá Gốc FULL PRO (VNĐ)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="9900000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[#3583b2] font-mono font-black focus:outline-none focus:border-[#69afd7]"
            />
            <p className="text-[10px] text-slate-500 mt-1 font-medium">
              Hệ thống sẽ tự động tính Gói PDF (35% = {Math.round((Number(price) * 0.35)/100000)*100000}đ) và Gói CAD (70% = {Math.round((Number(price) * 0.70)/100000)*100000}đ).
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link href="/admin/products" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl">
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#69afd7] hover:bg-[#5097c0] text-white font-extrabold px-6 py-2.5 rounded-xl uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Đang Lưu...' : 'Lưu Sản Phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
