import Link from 'next/link';
import CadThumbnail from '@/components/CadThumbnail';

interface ProductCardProps {
  product: {
    id: number;
    productName: string;
    productCode: string;
    cadCode: string;
    slug: string;
    productType: string;
    rightsStatus: string;
    featured?: boolean;
    assets?: Array<{ url: string }>;
    categories: Array<{ category: { name: string; slug: string } }>;
    packages: Array<{ id: number; packageName: string; price: number }>;
    _count?: { files: number };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const fullPrice = product.packages.length > 0
    ? Math.max(...product.packages.map(p => p.price))
    : 0;

  // Strikethrough old price calculation for visual alignment with Image 1
  const oldPrice = fullPrice > 0 ? Math.round(fullPrice * 1.1) : 0;

  const customImage = product.assets?.[0]?.url;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-4 border border-slate-200 hover:border-[#69afd7] transition-all duration-300 flex flex-col justify-between group hover:shadow-lg space-y-3">
      <Link href={`/cad/may-thiet-ke/${product.slug}`} className="block space-y-3">
        {/* Product Photo Box with Cyan Model Code Overlay */}
        <CadThumbnail
          cadCode={product.cadCode}
          productCode={product.productCode}
          productType={product.productType}
          productName={product.productName}
          customImage={customImage}
        />

        {/* Product Title - Bold Dark Orange Uppercase Text (Matching Image 1) */}
        <div className="pt-1 space-y-1">
          <h3 className="font-extrabold text-[#c2591e] text-sm uppercase group-hover:text-[#9e3e09] transition-colors line-clamp-2 leading-snug tracking-tight">
            {product.productName}
          </h3>
        </div>

        {/* Price Row: Old Price Strikethrough + Current Price (Matching Image 1) */}
        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
          {oldPrice > fullPrice && (
            <span className="text-xs text-slate-400 line-through font-medium">
              {oldPrice.toLocaleString('vi-VN')} VNĐ
            </span>
          )}
          <span className="font-black text-slate-900 text-base">
            {fullPrice.toLocaleString('vi-VN')} VNĐ
          </span>
        </div>
      </Link>
    </div>
  );
}
