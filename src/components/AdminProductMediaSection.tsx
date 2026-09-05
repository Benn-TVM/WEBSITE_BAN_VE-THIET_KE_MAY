'use client';

import { useState } from 'react';
import {
  Camera,
  Box,
  Layers,
  FileText,
  Upload,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface AdminProductMediaSectionProps {
  imageUrl: string;
  setImageUrl: (val: string) => void;
  image2dUrl: string;
  setImage2dUrl: (val: string) => void;
  model3dUrl: string;
  setModel3dUrl: (val: string) => void;
  drawingImageUrl: string;
  setDrawingImageUrl: (val: string) => void;
  cadCode?: string;
}

interface MediaCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  isModel?: boolean;
  accentColor?: string;
}

function MediaCard({
  title,
  icon,
  value,
  onChange,
  isModel = false,
  accentColor = 'text-[#3583b2]'
}: MediaCardProps) {
  const [localPreview, setLocalPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const displayUrl = localPreview || value;
  const isFilled = Boolean(displayUrl);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isModel) {
      setLocalPreview(URL.createObjectURL(file));
    }
    setHasError(false);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (isModel) {
        formData.append('kind', 'model');
      }

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.url) {
        onChange(data.url);
        setHasError(false);
      } else {
        alert(data.error || 'Tải tệp thất bại');
      }
    } catch {
      alert('Lỗi máy chủ khi tải tệp');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleClear = () => {
    onChange('');
    setLocalPreview('');
    setHasError(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all space-y-3">
      {/* 1. Header cân đối, không gãy chữ */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 ${accentColor}`}>
            {icon}
          </div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight truncate" title={title}>
            {title}
          </h4>
        </div>

        {/* Badge trạng thái luôn 1 dòng */}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap flex items-center gap-1 ${
            isFilled
              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 font-extrabold'
              : 'text-slate-400 bg-slate-100 border border-slate-200/80'
          }`}
        >
          {isFilled ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Đã có</span>
            </>
          ) : (
            'Chưa có'
          )}
        </span>
      </div>

      {/* 2. Khung xem trước trực quan */}
      <div className="relative w-full h-32 bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex items-center justify-center group hover:border-[#3583b2]/50 transition-colors">
        {uploading ? (
          <div className="text-center space-y-1.5 p-2">
            <Loader2 className="w-6 h-6 text-[#3583b2] animate-spin mx-auto" />
            <span className="text-[11px] font-bold text-slate-500">Đang tải lên...</span>
          </div>
        ) : isFilled ? (
          <>
            {isModel ? (
              <div className="text-center p-3 space-y-1">
                <Box className="w-9 h-9 text-indigo-600 mx-auto animate-pulse" />
                <div className="text-[11px] font-bold text-slate-700 truncate max-w-[130px] mx-auto font-mono">
                  {displayUrl.split('/').pop()}
                </div>
                <div className="text-[9px] text-emerald-600 font-extrabold uppercase">
                  Model 3D Sẵn Sàng
                </div>
              </div>
            ) : hasError ? (
              <div className="text-center p-2 text-slate-400 text-[10px] space-y-1">
                <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
                <span>Không tải được ảnh</span>
              </div>
            ) : (
              <img
                src={displayUrl}
                alt={title}
                className="w-full h-full object-contain p-2"
                onError={() => {
                  if (!localPreview) setHasError(true);
                }}
              />
            )}

            {/* Quick Action Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-800 px-2.5 py-1.5 rounded-lg shadow font-bold text-[11px] flex items-center gap-1 transition-transform hover:scale-105">
                <RefreshCw className="w-3.5 h-3.5 text-[#3583b2]" />
                <span>Đổi</span>
                <input
                  type="file"
                  accept={isModel ? '.glb,.gltf,.obj,.stl' : 'image/*'}
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleClear}
                className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-lg shadow font-bold text-[11px] flex items-center gap-1 transition-transform hover:scale-105"
                title="Xóa tệp này"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            </div>
          </>
        ) : (
          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-3 text-center hover:bg-slate-100/70 transition-colors">
            <Upload className="w-5 h-5 text-slate-400 mb-1" />
            <span className="text-xs font-bold text-[#3583b2]">Tải {isModel ? 'file 3D' : 'ảnh'} lên</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
              {isModel ? '.glb, .gltf' : 'PNG, JPG, WEBP'}
            </span>
            <input
              type="file"
              accept={isModel ? '.glb,.gltf,.obj,.stl' : 'image/*'}
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* 3. Footer thao tác cân đối */}
      {isFilled ? (
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs font-bold">
          <label className="cursor-pointer text-[#3583b2] hover:text-[#2c6e98] flex items-center gap-1 px-1 py-0.5 rounded transition-colors">
            <RefreshCw className="w-3 h-3" />
            <span>Đổi {isModel ? 'file' : 'ảnh'}</span>
            <input
              type="file"
              accept={isModel ? '.glb,.gltf,.obj,.stl' : 'image/*'}
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleClear}
            className="text-rose-600 hover:text-rose-700 flex items-center gap-1 px-1 py-0.5 rounded transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Xóa</span>
          </button>
        </div>
      ) : (
        <div className="text-center text-[10px] text-slate-400 font-mono pt-1">
          Chưa có tệp tải lên
        </div>
      )}
    </div>
  );
}

export default function AdminProductMediaSection({
  imageUrl,
  setImageUrl,
  image2dUrl,
  setImage2dUrl,
  model3dUrl,
  setModel3dUrl,
  drawingImageUrl,
  setDrawingImageUrl
}: AdminProductMediaSectionProps) {
  const filledCount = [imageUrl, image2dUrl, model3dUrl, drawingImageUrl].filter(Boolean).length;

  return (
    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-[#3583b2] flex items-center justify-center shadow-xs">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Hình Ảnh & File 3D Xem Trước
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                {filledCount}/4 tệp
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Nhấp trực tiếp vào từng ô để tải ảnh thực tế, mô hình 3D, bản vẽ 2D và tài liệu kỹ thuật
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
          Hỗ trợ ảnh PNG, JPG, WEBP và 3D GLB
        </div>
      </div>

      {/* 4-column compact grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Ảnh sản phẩm thực tế */}
        <MediaCard
          title="Ảnh Thực Tế"
          icon={<Camera className="w-4 h-4" />}
          value={imageUrl}
          onChange={setImageUrl}
          accentColor="text-[#00a89a]"
        />

        {/* 2. File 3D Model */}
        <MediaCard
          title="File 3D (.glb)"
          icon={<Box className="w-4 h-4" />}
          value={model3dUrl}
          onChange={setModel3dUrl}
          isModel={true}
          accentColor="text-indigo-600"
        />

        {/* 3. Bản vẽ 2D */}
        <MediaCard
          title="Bản Vẽ 2D"
          icon={<Layers className="w-4 h-4" />}
          value={image2dUrl}
          onChange={setImage2dUrl}
          accentColor="text-sky-600"
        />

        {/* 4. Ảnh bản vẽ đính kèm */}
        <MediaCard
          title="Ảnh Bản Vẽ"
          icon={<FileText className="w-4 h-4" />}
          value={drawingImageUrl}
          onChange={setDrawingImageUrl}
          accentColor="text-amber-600"
        />
      </div>
    </div>
  );
}
