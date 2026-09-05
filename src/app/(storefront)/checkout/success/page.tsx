'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Download,
  Clock,
  Building
} from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('code') || 'ORD-20260905-8941';
  const totalParam = searchParams.get('total');
  const total = totalParam ? parseFloat(totalParam) : 0;

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);

  const transferContent = `KTPCAD ${orderCode}`;

  const handleCopy = (text: string, type: 'account' | 'content') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Success Badge */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Đặt Hàng Bản Vẽ Thành Công!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Mã đơn hàng của bạn là: <strong className="font-mono font-black text-[#2c6e98] text-base">{orderCode}</strong>
          </p>
        </div>
      </div>

      {/* VietQR Transfer Details Panel */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-[#3583b2]" />
              <span>Thông Tin Chuyển Khoản Ngân Hàng VietQR</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Vui lòng chuyển khoản đúng số tiền và nội dung bên dưới để hệ thống duyệt tự động
            </p>
          </div>
          <span className="text-xs font-mono font-black text-white bg-[#69afd7] px-3 py-1 rounded-lg">
            {total.toLocaleString('vi-VN')} đ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* QR Code */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <img
              src={`https://img.vietqr.io/image/MB-0901234567-compact2.png?amount=${total}&addInfo=${encodeURIComponent(transferContent)}&accountName=KTP%20CAD`}
              alt="VietQR Payment"
              className="w-56 h-auto rounded-xl border border-slate-200 shadow-md"
            />
            <div className="text-[11px] text-slate-600 font-bold text-center">
              Quét QR bằng ứng dụng ngân hàng bất kỳ
            </div>
          </div>

          {/* Transfer Info Copy Boxes */}
          <div className="md:col-span-7 space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 font-medium">Ngân hàng thụ hưởng:</div>
              <div className="font-extrabold text-slate-900 text-sm">MB Bank (Ngân Hàng Quân Đội)</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 font-medium">Chủ tài khoản:</div>
              <div className="font-extrabold text-slate-900 uppercase">KTP CAD</div>
            </div>

            <div className="bg-[#eef7fc] p-4 rounded-xl border border-[#b8ddf0] flex items-center justify-between">
              <div>
                <div className="text-slate-500 font-medium">Số tài khoản:</div>
                <div className="font-black text-[#2c6e98] font-mono text-base">0901 234 567</div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('0901234567', 'account')}
                className="flex items-center gap-1.5 text-xs font-bold text-[#3583b2] hover:underline bg-white px-3 py-1.5 rounded-lg border border-[#b8ddf0] shadow-sm"
              >
                {copiedAccount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAccount ? 'Đã sao chép!' : 'Sao chép số TK'}</span>
              </button>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <div className="text-amber-800 font-bold text-[11px]">Nội dung chuyển khoản CHÍNH XÁC:</div>
                <div className="font-black text-amber-950 font-mono text-base">{transferContent}</div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(transferContent, 'content')}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:underline bg-white px-3 py-1.5 rounded-lg border border-amber-300 shadow-sm"
              >
                {copiedContent ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedContent ? 'Đã sao chép!' : 'Sao chép nội dung'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps Guidance */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <div className="font-black text-slate-900 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#3583b2]" />
          <span>Các Bước Tiếp Theo Để Nhận File CAD</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-[#3583b2]">Bước 1: Chuyển khoản</div>
            <p className="text-slate-600 text-[11px]">Thực hiện chuyển khoản đúng cú pháp <strong>{transferContent}</strong>.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-[#3583b2]">Bước 2: Admin duyệt</div>
            <p className="text-slate-600 text-[11px]">Bộ phận kỹ thuật duyệt đơn và tự động cấp License trong 5-15 phút.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-emerald-700">Bước 3: Tải file CAD</div>
            <p className="text-slate-600 text-[11px]">Truy cập trang <strong>Tài khoản / Đơn hàng</strong> để tải Signed Link (5 lượt tải / 30 ngày).</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <Link
            href="/account"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#69afd7] hover:bg-[#5097c0] text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Xem Đơn Hàng & License Tại Trang Tài Khoản</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/"
            className="text-xs text-slate-600 hover:text-[#3583b2] font-bold"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Đang nạp trang xác nhận...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
