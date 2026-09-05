'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ShoppingCart, Zap, Check } from 'lucide-react';
import { getCartSnapshot, parseCartItems, saveCartItems } from '@/lib/cart';

interface ProductPackageSelectorProps {
  productId: number;
  productName: string;
  cadCode: string;
  packages: Array<{
    id: number;
    packageName: string;
    packageCode: string;
    price: number;
    description?: string | null;
  }>;
}

export default function ProductPackageSelector({
  productId,
  productName,
  cadCode,
  packages
}: ProductPackageSelectorProps) {
  const router = useRouter();
  const [selectedPackageId, setSelectedPackageId] = useState<number>(
    packages.length > 0 ? packages[packages.length - 1].id : 0
  );
  const [added, setAdded] = useState(false);

  const activePackage = packages.find(p => p.id === selectedPackageId) || packages[0];

  const handleAddToCart = () => {
    if (!activePackage) return;

    const currentCart = parseCartItems(getCartSnapshot());
    const existingIndex = currentCart.findIndex(
      (item) => item.productId === productId && item.packageId === activePackage.id
    );

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += 1;
    } else {
      currentCart.push({
        productId,
        productName,
        cadCode,
        packageId: activePackage.id,
        packageName: activePackage.packageName,
        price: activePackage.price,
        quantity: 1
      });
    }

    saveCartItems(currentCart);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (!packages || packages.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 font-bold">
        Sản phẩm chưa có gói giá khả dụng.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="space-y-1">
        <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
          Chọn Gói Dữ Liệu CAD Bạn Cần (Model Configuration):
        </label>
        <p className="text-xs text-slate-500">
          Mỗi gói cung cấp mức độ chi tiết file khác nhau cho mục đích xem, cắt 2D hay trọn bộ 3D.
        </p>
      </div>

      {/* Package Options Cards */}
      <div className="space-y-3">
        {packages.map((pkg) => {
          const isSelected = pkg.id === selectedPackageId;
          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackageId(pkg.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#eef7fc] border-[#69afd7] shadow-md ring-1 ring-[#69afd7]'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-[#69afd7] bg-[#69afd7]' : 'border-slate-400'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">{pkg.packageName}</div>
                    <div className="text-[11px] text-slate-500">{pkg.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-[#3583b2] text-sm">
                    {pkg.price.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Package Total & Action Buttons */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-600 font-bold">Thành tiền gói đã chọn:</span>
          <span className="text-2xl font-black text-[#3583b2]">
            {activePackage ? activePackage.price.toLocaleString('vi-VN') : 0} đ
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            {added ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đã Thêm Vào Giỏ!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 text-[#3583b2]" />
                <span>Thêm Vào Giỏ</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex items-center justify-center gap-2 bg-[#69afd7] hover:bg-[#5097c0] text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
          >
            <Zap className="w-4 h-4" />
            <span>Mua Ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
}
