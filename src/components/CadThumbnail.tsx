'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface CadThumbnailProps {
  cadCode: string;
  productCode: string;
  productType: string;
  productName: string;
  customImage?: string;
}

// Local KTP product photos mapping for CAD codes
const KTP_PRODUCT_IMAGES: Record<string, string> = {
  'CAD-MCT025': '/images/products/CAD-MCT025.png',
  'CAD-VENUS024P': '/images/products/CAD-VENUS024P.png',
  'CAD-MCG023-1': '/images/products/CAD-MCG023-1.png',
  'CAD-MCG800': '/images/products/CAD-MCG800.png',
  'CAD-MBG020': '/images/products/CAD-MBG020.png',
  'CAD-MHL023': '/images/products/CAD-MHL023.png',
  'CAD-MCG022': '/images/products/CAD-MCG022.png',
  'CAD-MBG022': '/images/products/CAD-MBG022.png',
  'CAD-MCS023': '/images/products/CAD-MCS023.png',
  'CAD-MBG023': '/images/products/CAD-MBG023.png',
  'CAD-WATEJET-SHUTTLE': '/images/products/CAD-WATEJET-SHUTTLE.png',
  'CAD-WATEJET-YINGTUO': '/images/products/CAD-WATEJET-YINGTUO.png',
  'CAD-MCD800': '/images/products/CAD-MCD800.png',
  'CAD-KTP600': '/images/products/CAD-KTP600.png',
};

export default function CadThumbnail({
  cadCode,
  productCode,
  productName,
  customImage
}: CadThumbnailProps) {
  const [imageError, setImageError] = useState(false);

  // Determine image URL safely - don't guess non-existent files
  const imageUrl = customImage || KTP_PRODUCT_IMAGES[cadCode];

  // Clean Model display code
  const displayCode = productCode || cadCode.replace('CAD-', '').replace('_', ' ');

  return (
    <div className="relative w-full h-64 sm:h-72 bg-white rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-[1.01] transition-transform duration-300">
      {imageUrl && !imageError ? (
        <img
          key={imageUrl}
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-contain p-2 transition-all duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null;
            setImageError(true);
          }}
        />
      ) : (
        /* Styled Clean "Chưa có ảnh sản phẩm" Fallback Card */
        <div className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center space-y-3 p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-[#eef7fc] border border-[#b8ddf0] flex flex-col items-center justify-center text-[#2c6e98] shadow-sm">
            <ImageOff className="w-6 h-6 text-[#3583b2] mb-0.5" />
            <span className="font-mono font-black text-[10px] uppercase">{displayCode.slice(0, 4)}</span>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-xs text-slate-600">
              Chưa có ảnh sản phẩm
            </div>
            <div className="font-mono text-[10px] text-[#3583b2] font-black uppercase tracking-wider">
              {displayCode}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
