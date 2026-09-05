'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  ShieldCheck,
  Building,
  User,
  Mail,
  Phone,
  ArrowRight
} from 'lucide-react';
import {
  getCartServerSnapshot,
  getCartSnapshot,
  parseCartItems,
  subscribeToCartUpdates
} from '@/lib/cart';

export default function CheckoutPage() {
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
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  // Copy helpers
  const [copiedAccount, setCopiedAccount] = useState(false);

  useEffect(() => {
    if (cartItems !== null && cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems, router]);

  const totalAmount = cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!cartItems) {
      setErrorMsg('Vui lòng kiểm tra lại giỏ hàng trước khi đặt hàng');
      return;
    }

    if (!name || !email || !phone) {
      setErrorMsg('Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại liên hệ');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          items: cartItems
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Tạo đơn hàng thất bại');
        setSubmitting(false);
        return;
      }

      // Clear Cart LocalStorage
      localStorage.removeItem('ktp_cart');
      window.dispatchEvent(new Event('cart_updated'));

      // Redirect to Order Success Page
      router.push(`/checkout/success?code=${data.orderCode}&total=${data.total}`);

    } catch (err) {
      console.error(err);
      setErrorMsg('Đã có lỗi kết nối khi đặt hàng. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  if (cartItems === null) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-500 text-xs font-bold">
        Đang tải thông tin thanh toán...
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
          <Link href="/cart" className="hover:text-[#3583b2]">Giỏ hàng</Link>
          <span>/</span>
          <span className="text-[#3583b2] font-bold">Thanh toán đơn hàng</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-[#3583b2]" />
          Xác Nhận Đơn Hàng & Chuyển Khoản VietQR
        </h1>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="underline text-xs">Đóng</button>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer Details & Payment Steps */}
        <div className="lg:col-span-7 space-y-6">

          {/* Customer Info Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-[#3583b2]" />
                <span>1. Thông Tin Người Mua Bản Vẽ</span>
              </h3>
              <span className="text-[11px] text-[#3583b2] font-bold">Quyền tải sẽ gửi qua Email này</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Họ và tên người nhận (*):</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#69afd7] font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Email nhận thông báo (*):</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="nguyenvana@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#69afd7] font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Số điện thoại / Zalo (*):</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="0901234567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#69afd7] font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Tên Công ty / Đơn vị (Không bắt buộc):</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Cơ Khí Chế Tạo KTP..."
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#69afd7] font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Details (VietQR Manual Bank Transfer) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#3583b2]" />
                <span>2. Phương Thức Chuyển Khoản Ngân Hàng (VietQR)</span>
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-black">
                Xác Nhận Nhanh 24/7
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* VietQR Dynamic Preview Image */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <img
                  src={`https://img.vietqr.io/image/MB-0901234567-compact2.png?amount=${totalAmount}&addInfo=KTPCAD%20DONHANG&accountName=KTP%20CAD`}
                  alt="VietQR Transfer"
                  className="w-48 h-auto rounded-xl border border-slate-200 shadow-sm"
                />
                <span className="text-[10px] text-slate-500 font-bold">Mở App Ngân hàng & Quét QR</span>
              </div>

              {/* Bank Account Info Details */}
              <div className="md:col-span-7 space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[11px]">Ngân hàng nhận:</div>
                  <div className="font-extrabold text-slate-900">MB Bank (Ngân Hàng Quân Đội)</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[11px]">Chủ tài khoản:</div>
                  <div className="font-extrabold text-slate-900 uppercase">KTP CAD</div>
                </div>

                <div className="bg-[#eef7fc] p-3 rounded-xl border border-[#b8ddf0] flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-[11px]">Số tài khoản chính thức:</div>
                    <div className="font-black text-[#2c6e98] font-mono text-sm">0901 234 567</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('0901234567')}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#3583b2] hover:underline bg-white px-2.5 py-1 rounded border border-[#b8ddf0]"
                  >
                    {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAccount ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs space-y-1 text-amber-900">
              <div className="font-extrabold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Lưu ý quan trọng khi chuyển khoản:</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed font-medium">
                Nội dung chuyển khoản chính thức sẽ tự động tạo chứa <strong>Mã Đơn Hàng (Ví dụ: KTPCAD ORD-20260905-XXXX)</strong> ở trang kế tiếp. Admin sẽ duyệt đơn trong vòng 5-15 phút.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Submit Button */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
              Chi Tiết Đơn Hàng ({cartItems.length} gói CAD)
            </h3>
          </div>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.packageId}`} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{item.productName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    <span className="text-[#3583b2] font-bold">{item.cadCode}</span> • Gói: {item.packageName}
                  </div>
                </div>
                <div className="font-black text-slate-900 font-mono text-right">
                  {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tạm tính:</span>
              <span className="font-mono font-bold text-slate-900">{totalAmount.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí ký số Signed URL:</span>
              <span className="font-bold text-emerald-700">0 đ</span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="font-black text-slate-900 text-base">Tổng Thanh Toán:</span>
              <span className="font-black text-[#3583b2] text-2xl font-mono">
                {totalAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full flex items-center justify-center gap-2 bg-[#69afd7] hover:bg-[#5097c0] text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? (
              <span>Đang tạo đơn hàng...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Hoàn Tất Đặt Hàng & Nhận Mã Chuyển Khoản</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-bold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bảo mật giao dịch theo tiêu chuẩn KTP CAD Security</span>
          </div>
        </div>
      </form>
    </div>
  );
}
