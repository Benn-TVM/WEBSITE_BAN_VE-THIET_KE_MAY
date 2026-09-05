import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function PurchaseGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-slate-900">
          Hướng Dẫn Mua Bản Vẽ & Cấp Quyền Tải File
        </h1>
        <p className="text-xs text-slate-600 font-medium">
          Quy trình 4 bước đơn giản để mua hồ sơ CAD kỹ thuật số và nhận link tải ký số an toàn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-lg bg-[#eef7fc] border border-[#b8ddf0] text-[#2c6e98] font-black flex items-center justify-center text-xs">
            01
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Chọn Bản Vẽ & Gói Giá</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Duyệt catalog bản vẽ máy hoặc phụ tùng. Lựa chọn gói dữ liệu phù hợp (PDF Basic, CAD Standard hoặc Full Pro).
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-lg bg-[#eef7fc] border border-[#b8ddf0] text-[#2c6e98] font-black flex items-center justify-center text-xs">
            02
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Thanh Toán VietQR / Chuyển Khoản</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Quét mã VietQR hoặc chuyển khoản theo thông tin ngân hàng KTP với cú pháp ghi rõ Mã Đơn Hàng.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-lg bg-[#eef7fc] border border-[#b8ddf0] text-[#2c6e98] font-black flex items-center justify-center text-xs">
            03
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Admin Xác Nhận Đơn Hàng</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Bộ phận kinh doanh & kế toán KTP xác nhận khớp lệnh chuyển khoản và tự động kích hoạt License cho tài khoản.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-black flex items-center justify-center text-xs">
            04
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Tải File An Toàn</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Truy cập khu vực <strong className="text-[#3583b2]">Tài Khoản &gt; Bản Vẽ Đã Mua</strong> để nhận link tải Signed URL (tối đa 5 lượt/30 ngày).
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <h2 className="text-xl font-black text-slate-900">Sẵn Sàng Khám Phá Thư Viện Bản Vẽ?</h2>
        <Link href="/cad" className="inline-flex items-center gap-2 bg-[#69afd7] hover:bg-[#5097c0] text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md">
          <span>Xem Catalog Bản Vẽ KTP</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
