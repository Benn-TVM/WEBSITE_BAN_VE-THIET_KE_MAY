'use client';

import { useState } from 'react';
import { CheckCircle2, ImageOff, ShieldAlert, ZoomIn, ZoomOut } from 'lucide-react';
import CadModelViewer from './CadModelViewer';

type ViewType = '2D' | '3D' | 'REAL' | 'CAD';

interface WatermarkPreviewPlayerProps {
  productName: string;
  cadCode: string;
  previewImage?: string;
  preview2dImage?: string;
  preview3dModel?: string;
  preview3dImage?: string;
  drawingImage?: string;
}

interface GalleryItem {
  id: ViewType;
  title: string;
  badge: string;
  description: string;
  image?: string;
  fallbackTitle: string;
}

function Cube3DIcon({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <defs>
        <clipPath id="left-cube-face-hatching">
          <polygon points="4,9 14,14 14,24.5 4,19.5" />
        </clipPath>
      </defs>
      {/* Outer cube silhouette & edges */}
      <path d="M14 3.5L24 8.5V19.5L14 24.5L4 19.5V8.5L14 3.5Z" />
      <path d="M14 14V24.5" />
      <path d="M14 14L24 8.5" />
      <path d="M14 14L4 8.5" />
      {/* Hatching lines on left face sloping upwards */}
      <g clipPath="url(#left-cube-face-hatching)">
        <line x1="0" y1="12" x2="18" y2="2" strokeWidth="1.6" />
        <line x1="0" y1="15" x2="18" y2="5" strokeWidth="1.6" />
        <line x1="0" y1="18" x2="18" y2="8" strokeWidth="1.6" />
        <line x1="0" y1="21" x2="18" y2="11" strokeWidth="1.6" />
        <line x1="0" y1="24" x2="18" y2="14" strokeWidth="1.6" />
        <line x1="0" y1="27" x2="18" y2="17" strokeWidth="1.6" />
        <line x1="0" y1="30" x2="18" y2="20" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

function CameraFlashIcon({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 3 Flash rays at top */}
      <path d="M14 2V4.8" />
      <path d="M8.5 3.5L10.2 5.5" />
      <path d="M19.5 3.5L17.8 5.5" />
      {/* Top housing */}
      <path d="M10.5 8V6.5C10.5 5.8 11 5.2 11.8 5.2H16.2C17 5.2 17.5 5.8 17.5 6.5V8" />
      {/* Top buttons */}
      <path d="M6 7.5H8" />
      <path d="M20 7.5H22" />
      {/* Camera body */}
      <rect x="3" y="8" width="22" height="15" rx="3" />
      {/* Lens outer & inner */}
      <circle cx="14" cy="15.5" r="4.8" />
      <circle cx="14" cy="15.5" r="2.2" />
    </svg>
  );
}

function Blueprint2DIcon({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3.5" y="3.5" width="21" height="21" rx="3" />
      <rect x="7" y="7" width="8.5" height="8.5" rx="1.5" />
      <path d="M7 20H15.5" />
      <path d="M7 18.5V21.5" />
      <path d="M15.5 18.5V21.5" />
      <path d="M20 7V15.5" />
      <path d="M18.5 7H21.5" />
      <path d="M18.5 15.5H21.5" />
    </svg>
  );
}

function CadDrawingIcon({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 3H6C4.9 3 4 3.9 4 5V23C4 24.1 4.9 25 6 25H22C23.1 25 24 24.1 24 23V11L16 3Z" />
      <path d="M16 3V11H24" />
      <rect x="8" y="17" width="12" height="5" rx="1" />
      <path d="M8 14H15" />
    </svg>
  );
}

export default function WatermarkPreviewPlayer({
  productName,
  cadCode,
  previewImage,
  preview2dImage,
  preview3dModel,
  preview3dImage,
  drawingImage
}: WatermarkPreviewPlayerProps) {
  const model3d = preview3dModel || preview3dImage;

  const galleryItems: GalleryItem[] = [
    {
      id: '2D',
      title: 'Ảnh 2D',
      badge: '2D',
      description: 'Ảnh preview bản vẽ 2D của sản phẩm.',
      image: preview2dImage,
      fallbackTitle: 'Chưa có ảnh 2D'
    },
    {
      id: '3D',
      title: 'Mô hình 3D',
      badge: '3D',
      description: 'Preview mô hình 3D được tải lên từ hệ thống.',
      image: model3d,
      fallbackTitle: 'Chưa có mô hình 3D'
    },
    {
      id: 'REAL',
      title: 'Anh san pham',
      badge: 'THUC TE',
      description: 'Anh dai dien hoac anh san pham thuc te.',
      image: previewImage,
      fallbackTitle: 'Chua co anh san pham'
    },
    {
      id: 'CAD',
      title: 'Anh ban ve',
      badge: 'BAN VE',
      description: 'Anh preview ban ve tong the hoac khung ten ky thuat.',
      image: drawingImage,
      fallbackTitle: 'Chua co anh ban ve'
    }
  ];

  const firstAvailable = galleryItems.find((item) => item.image)?.id ?? '2D';
  const [activeView, setActiveView] = useState<ViewType>(firstAvailable);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [failedViews, setFailedViews] = useState<Record<ViewType, boolean>>({
    '2D': false,
    '3D': false,
    REAL: false,
    CAD: false
  });

  const currentItem = galleryItems.find((item) => item.id === activeView) ?? galleryItems[0];
  const visibleImage = currentItem.id !== '3D' && currentItem.image && !failedViews[currentItem.id]
    ? currentItem.image
    : null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="bg-[#ff3b30] text-white px-2 py-0.5 rounded font-black text-[10px] uppercase shadow-sm shrink-0">
            {currentItem.badge}
          </span>
          <span className="text-slate-900 font-bold text-sm truncate">
            {currentItem.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleZoomOut}
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors shadow-sm"
            title="Thu nho"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-700 w-12 text-center">
            {zoomLevel}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors shadow-sm"
            title="Phong to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative w-full h-[420px] bg-slate-50 overflow-hidden flex items-center justify-center select-none border-b border-slate-200">
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 opacity-30 -rotate-12 scale-110">
          {[0, 1, 2].map((item) => (
            <div key={item} className="text-center font-black text-slate-400 text-xl tracking-widest uppercase">
              KTP CAD - BAN QUYEN GOC - {cadCode}
            </div>
          ))}
        </div>

        <div
          className="w-full h-full flex items-center justify-center p-4 transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          {currentItem.id === '3D' && model3d && !failedViews['3D'] ? (
            <CadModelViewer modelUrl={model3d} cadCode={cadCode} />
          ) : visibleImage ? (
            <img
              key={visibleImage}
              src={visibleImage}
              alt={`${currentItem.title} ${productName}`}
              className="max-h-[380px] max-w-full object-contain drop-shadow-md rounded-xl bg-white"
              onError={() => setFailedViews((prev) => ({ ...prev, [currentItem.id]: true }))}
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center select-none">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                <ImageOff className="w-8 h-8 text-slate-400" />
              </div>
              <div className="font-bold text-sm text-slate-600">
                {currentItem.id === '3D' ? 'Chua co file 3D preview' : currentItem.fallbackTitle}
              </div>
              <div className="text-xs text-slate-400 font-mono">{cadCode}</div>
            </div>
          )}
        </div>

        <div className="absolute bottom-3 right-3 z-30 bg-white/90 border border-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1.5 backdrop-blur-md shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5 text-[#3583b2]" />
          <span>Ban quyen KTP CAD - Signed Watermark</span>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border-t border-slate-200">
        <div className="flex items-center gap-4 overflow-x-auto py-2.5 px-1">
          {galleryItems.map((item) => {
            const isActive = activeView === item.id;
            const hasContent = item.id === '3D' ? !!model3d : (!!item.image && !failedViews[item.id]);

            return (
              <div key={item.id} className="flex flex-col items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white border-2 border-[#00c8b6] shadow-[0_0_12px_rgba(0,200,182,0.45)] text-[#00c8b6] scale-105'
                      : 'bg-[#f1f3f5] hover:bg-slate-200/80 border border-slate-200/50 text-[#00c8b6] hover:text-[#00a89a]'
                  } ${!hasContent ? 'opacity-40' : 'opacity-100'}`}
                  title={item.title}
                >
                  {item.id === '3D' && <Cube3DIcon className="w-9 h-9" />}
                  {item.id === 'REAL' && <CameraFlashIcon className="w-9 h-9" />}
                  {item.id === '2D' && <Blueprint2DIcon className="w-9 h-9" />}
                  {item.id === 'CAD' && <CadDrawingIcon className="w-9 h-9" />}
                </button>

                <span
                  className={`text-[10px] font-black uppercase tracking-wider ${
                    isActive ? 'text-[#00a89a]' : 'text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3583b2] shrink-0" />
            {currentItem.description}
          </span>
          <span className="font-mono text-[10px] text-slate-500 font-bold shrink-0">
            2D / 3D / THUC TE / BAN VE
          </span>
        </div>
      </div>
    </div>
  );
}
