'use client';

import { useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Box, Zap } from 'lucide-react';
import {
  getCartServerSnapshot,
  getCartSnapshot,
  parseCartItems,
  saveCartItems,
  subscribeToCartUpdates,
  type StoredCartItem
} from '@/lib/cart';

export default function CartPage() {
  const router = useRouter();
  const cartSnapshot = useSyncExternalStore(
    subscribeToCartUpdates,
    getCartSnapshot,
    getCartServerSnapshot
  );
  const cartItems = useMemo(
    () => (cartSnapshot === null ? null : parseCartItems(cartSnapshot)),
    [cartSnapshot]
  );

  const updateCart = (newItems: StoredCartItem[]) => {
    saveCartItems(newItems);
  };

  const handleQuantityChange = (index: number, delta: number) => {
    if (!cartItems) return;

    const newItems = [...cartItems];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    updateCart(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (!cartItems) return;

    const newItems = cartItems.filter((_, i) => i !== index);
    updateCart(newItems);
  };

  const handleClearCart = () => {
    updateCart([]);
  };

  const totalAmount = cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;

  if (cartItems === null) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-500 text-xs font-bold">
        Đang tải dữ liệu giỏ hàng...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#3583b2]">Trang chủ</Link>
          <span>/</span>
          <span className="text-[#3583b2] font-bold">Giỏ hàng bản vẽ</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-[#3583b2]" />
          Giỏ Hàng Bản Vẽ CAD Của Bạn ({cartItems.length} sản phẩm)
        </h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-[#eef7fc] border border-[#b8ddf0] text-[#3583b2] rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">Giỏ hàng của bạn đang trống</h3>
            <p className="text-xs text-slate-500 font-medium">
              Hãy chọn bản vẽ thiết kế máy hoặc gói CAD phù hợp từ Thư viện KTP CAD.
            </p>
          </div>
          <Link
            href="/cad"
            className="inline-flex items-center gap-2 bg-[#69afd7] hover:bg-[#5097c0] text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
          >
            <Box className="w-4 h-4" />
            <span>Khám Phá Thư Viện Bản Vẽ</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Sản phẩm bản vẽ đã chọn
                </span>
                <button
                  onClick={handleClearCart}
                  className="text-xs text-slate-500 hover:text-red-600 font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa tất cả</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {cartItems.map((item, index) => (
                  <div key={`${item.productId}-${item.packageId}`} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black text-[#2c6e98] bg-[#eef7fc] px-2 py-0.5 rounded border border-[#b8ddf0]">
                          {item.cadCode}
                        </span>
                        <span className="text-xs font-extrabold text-[#3583b2]">
                          [{item.packageName}]
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {item.productName}
                      </h4>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Quyền tải: Signed URL (5 lần / 30 ngày)
                      </div>
                    </div>

                    {/* Quantity Controls & Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                        <button
                          onClick={() => handleQuantityChange(index, -1)}
                          className="px-3 py-1 text-slate-600 font-black hover:bg-slate-200 rounded-l-xl"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold font-mono text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(index, 1)}
                          className="px-3 py-1 text-slate-600 font-black hover:bg-slate-200 rounded-r-xl"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-slate-900 text-sm font-mono">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {item.price.toLocaleString('vi-VN')} đ / gói
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/cad"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#3583b2] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tiếp tục xem thêm bản vẽ khác</span>
            </Link>
          </div>

          {/* Cart Summary Panel */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                Tóm Tắt Đơn Hàng Mua CAD
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Tạm tính ({cartItems.length} mục):</span>
                <span className="font-mono font-bold text-slate-900">
                  {totalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Phí cấp License số:</span>
                <span className="font-bold text-emerald-700">Miễn phí</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Bảo hộ quyền sở hữu bản vẽ:</span>
                <span className="font-bold text-emerald-700">Được bảo vệ</span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                <span className="font-black text-slate-900 text-sm">Tổng cộng:</span>
                <span className="font-black text-[#3583b2] text-2xl font-mono">
                  {totalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="bg-[#eef7fc] border border-[#b8ddf0] p-3 rounded-xl space-y-1 text-[11px] text-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-[#2c6e98]">
                <ShieldCheck className="w-4 h-4 text-[#3583b2]" />
                <span>Quy định nhận License KTP CAD</span>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed">
                Sau khi bấm Thanh Toán, bạn sẽ chuyển khoản qua mã <strong>VietQR</strong>. Ngay khi Admin duyệt, bạn có thể tải bản vẽ trực tiếp tại trang Tài khoản.
              </p>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full flex items-center justify-center gap-2 bg-[#69afd7] hover:bg-[#5097c0] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md"
            >
              <Zap className="w-4 h-4" />
              <span>Tiến Hành Thanh Toán & Nhận License</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
