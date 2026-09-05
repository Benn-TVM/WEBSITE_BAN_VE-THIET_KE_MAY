'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import AdminProductMediaSection from '@/components/AdminProductMediaSection';

export default function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [cadCode, setCadCode] = useState('');
  const [productType, setProductType] = useState('COMPLETE_MACHINE');
  const [rightsStatus, setRightsStatus] = useState('OWNED');
  const [status, setStatus] = useState('DRAFT');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [image2dUrl, setImage2dUrl] = useState('');
  const [model3dUrl, setModel3dUrl] = useState('');
  const [drawingImageUrl, setDrawingImageUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${productId}`);
        const data = await res.json();

        if (!res.ok || !data.product) {
          setError(data.error || 'Không tìm thấy sản phẩm');
          setLoading(false);
          return;
        }

        const p = data.product;
        setProductName(p.productName || '');
        setProductCode(p.productCode || '');
        setCadCode(p.cadCode || '');
        setProductType(p.productType || 'COMPLETE_MACHINE');
        setRightsStatus(p.rightsStatus || 'OWNED');
        setStatus(p.status || 'DRAFT');
        setDescription(p.description || '');

        if (p.assets && p.assets.length > 0) {
          const assetByType = (assetType: string) =>
            p.assets.find((asset: { assetType: string; url: string }) => asset.assetType === assetType)?.url || '';

          setImageUrl(assetByType('IMAGE_REAL') || p.assets[0].url || '');
          setImage2dUrl(assetByType('IMAGE_2D'));
          setModel3dUrl(assetByType('MODEL_3D') || assetByType('IMAGE_3D'));
          setDrawingImageUrl(assetByType('IMAGE_DRAWING'));
        }

        setLoading(false);
      } catch {
        setError('Lỗi khi tải dữ liệu sản phẩm');
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Rule Check
    const canPublish = ['OWNED', 'LICENSED', 'AUTHORIZED'].includes(rightsStatus);
    if (status === 'PUBLISHED' && !canPublish) {
      setError(`BẢO VỆ TÀI SẢN: Không thể Xuất bản (Publish) khi Quyền sở hữu là "${rightsStatus}". Vui lòng chọn OWNED, LICENSED hoặc giữ DRAFT.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productCode,
          cadCode,
          productType,
          rightsStatus,
          status: canPublish ? status : 'DRAFT',
          description,
          imageUrl,
          assetUrls: {
            IMAGE_2D: image2dUrl,
            MODEL_3D: model3dUrl,
            IMAGE_DRAWING: drawingImageUrl
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Cập nhật sản phẩm thất bại');
        setSubmitting(false);
        return;
      }

      setSuccessMsg('Đã lưu thay đổi sản phẩm thành công!');
      setSubmitting(false);
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1000);
    } catch {
      setError('Lỗi kết nối máy chủ khi cập nhật sản phẩm');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${cadCode} - ${productName}? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Xóa sản phẩm thất bại');
        setDeleting(false);
        return;
      }

      router.push('/admin/products');
      router.refresh();
    } catch {
      setError('Lỗi kết nối máy chủ khi xóa sản phẩm');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center space-y-3 text-slate-500 font-mono text-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-[#3583b2]" />
        <span>Đang tải thông tin sản phẩm #{productId}...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">Chỉnh Sửa Bản Vẽ Sản Phẩm #{productId}</h1>
            <p className="text-xs text-slate-500 font-medium">
              Cập nhật mã CAD, tên máy, hình ảnh thực tế và trạng thái bản quyền
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span>{deleting ? 'Đang xóa...' : 'Xóa Sản Phẩm'}</span>
        </button>
      </div>

      {/* Main Edit Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1 uppercase">
                Mã CAD Trích Xuất *
              </label>
              <input
                type="text"
                required
                value={cadCode}
                onChange={e => setCadCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold text-[#3583b2]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1 uppercase">
                Mã Máy / Phụ Tùng
              </label>
              <input
                type="text"
                value={productCode}
                onChange={e => setProductCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 mb-1 uppercase">
              Tên Sản Phẩm Bản Vẽ *
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={e => setProductName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900"
            />
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

          {/* Status & Rights Control */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1 uppercase">
                Phân Loại Sản Phẩm
              </label>
              <select
                value={productType}
                onChange={e => setProductType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900"
              >
                <option value="COMPLETE_MACHINE">Máy Hoàn Chỉnh (3 Gói CAD)</option>
                <option value="SPARE_PART">Phụ Tùng / Linh Kiện</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1 uppercase">
                Quyền Sở Hữu Bản Vẽ *
              </label>
              <select
                value={rightsStatus}
                onChange={e => setRightsStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900"
              >
                <option value="OWNED">OWNED - KTP Sở Hữu Gốc</option>
                <option value="LICENSED">LICENSED - Có Bản Quyền Mua</option>
                <option value="AUTHORIZED">AUTHORIZED - Được Ủy Quyền</option>
                <option value="UNKNOWN">UNKNOWN - Chưa Xác Minh</option>
                <option value="NOT_FOR_SALE">NOT_FOR_SALE - Không Bán</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1 uppercase">
                Trạng Thái Hiển Thị
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900"
              >
                <option value="DRAFT">DRAFT (Bản Nháp)</option>
                <option value="PUBLISHED">PUBLISHED (Xuất Bản)</option>
                <option value="ARCHIVED">ARCHIVED (Lưu Khóa)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 mb-1 uppercase">
              Mô Tả & Thông Số Kỹ Thuật
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Hủy Bỏ
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#3583b2] hover:bg-[#2c6e98] text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
