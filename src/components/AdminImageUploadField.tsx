'use client';

import { useState } from 'react';
import { ImageOff, Upload, X } from 'lucide-react';

interface AdminImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function AdminImageUploadField({
  label,
  value,
  onChange,
  placeholder = '/uploads/image.png'
}: AdminImageUploadFieldProps) {
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const previewUrl = localPreviewUrl || value;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setImageError(false);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.url) {
        onChange(data.url);
        setImageError(false);
      }
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
      <label className="block text-xs font-mono font-bold text-slate-700 uppercase">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-28 h-28 shrink-0 border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden bg-white flex items-center justify-center p-2">
          {previewUrl && !imageError ? (
            <img
              key={previewUrl}
              src={previewUrl}
              alt={label}
              className="w-full h-full object-contain"
              onError={() => {
                if (!localPreviewUrl) setImageError(true);
              }}
            />
          ) : (
            <div className="text-center text-slate-400 font-mono text-[10px] space-y-1">
              <ImageOff className="w-6 h-6 mx-auto" />
              <div>Chưa có ảnh</div>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-[#3583b2] hover:bg-[#2c6e98] text-white rounded-xl text-xs font-black transition-all shadow-sm">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Đang tải lên...' : 'Tải ảnh từ máy tính'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {previewUrl && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setLocalPreviewUrl('');
                  setImageError(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa ảnh</span>
              </button>
            )}
          </div>

          <input
            type="text"
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
              setLocalPreviewUrl('');
              setImageError(false);
            }}
            placeholder={placeholder}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-xs"
          />
        </div>
      </div>
    </div>
  );
}
