'use client';

import { useState } from 'react';
import { Box, Upload, X } from 'lucide-react';

interface AdminModelUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function AdminModelUploadField({
  label,
  value,
  onChange,
  placeholder = '/uploads/model.glb'
}: AdminModelUploadFieldProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', 'model');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.url) {
        onChange(data.url);
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
        <div className="w-28 h-28 shrink-0 border-2 border-dashed border-slate-300 rounded-2xl bg-white flex items-center justify-center p-2">
          <div className="text-center text-slate-500 font-mono text-[10px] space-y-2">
            <Box className="w-8 h-8 mx-auto text-[#3583b2]" />
            <div>{value ? 'Đã có file 3D' : 'Chưa có file 3D'}</div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-[#3583b2] hover:bg-[#2c6e98] text-white rounded-xl text-xs font-black transition-all shadow-sm">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Đang tải lên...' : 'Tải file 3D từ máy tính'}</span>
              <input
                type="file"
                accept=".glb,.gltf,.obj,.stl,model/gltf-binary,model/gltf+json"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa file</span>
              </button>
            )}
          </div>

          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-xs"
          />

          <p className="text-[11px] text-slate-500 font-medium">
            Hỗ trợ GLB, GLTF, OBJ, STL. Nên dùng GLB để tải nhanh và giữ vật liệu tốt nhất.
          </p>
        </div>
      </div>
    </div>
  );
}
