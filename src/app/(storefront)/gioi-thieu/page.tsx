import Link from 'next/link';
import { Cpu, ShieldCheck, FileCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#eef7fc] border border-[#b8ddf0] px-3 py-1 rounded-full text-xs text-[#2c6e98] font-bold">
          <Cpu className="w-3.5 h-3.5 text-[#3583b2]" />
          <span>VỀ CHÚNG TÔI – KTP CAD</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Thư Viện Bản Vẽ Kỹ Thuật Máy & Phụ Tùng CAD KTP
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium">
          Nền tảng số hóa chính thức cung cấp hồ sơ thiết kế máy cắt gạch, máy ngành đá và phụ tùng Waterjet chuẩn gia công.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed font-medium">
        <div className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#3583b2]" />
            1. Định Vị Nền Tảng Số KTP CAD
          </h2>
          <p>
            KTP CAD ra đời với sứ mệnh phục vụ cộng đồng kỹ sư cơ khí, xưởng chế tạo và doanh nghiệp cần tài liệu kỹ thuật chuẩn xác. Nền tảng tập trung chuyên sâu vào bộ hồ sơ bản vẽ 2D/3D CAD, BOM vật tư và tài liệu lắp ráp chính thức.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#3583b2]" />
            2. Chuẩn Hóa Cấu Trúc Hồ Sơ 9 Thư Mục Kỹ Thuật
          </h2>
          <p>
            Tất cả bản vẽ thiết kế máy trên hệ thống được tổ chức theo quy chuẩn 9 folder kỹ thuật nghiêm ngặt:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900 font-bold">01. Bản Vẽ Tổng Thể (PDF/DWG)</div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900 font-bold">02. Bản Vẽ Lắp Từng Cụm (Assembly)</div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900 font-bold">03. Bản Vẽ Chi Tiết Gia Công (Part)</div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900 font-bold">04. File Cắt Laser/Plasma (DXF)</div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900 font-bold">05. Sơ Đồ Mạch Điện</div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900 font-bold">06. Bảng Kê Vật Tư BOM (Excel)</div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900 font-bold">07. Mô Hình 3D STEP Assembly</div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900 font-bold">08. Hướng Dẫn Vận Hành & Lắp Ráp</div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-slate-600 font-bold">Cần tư vấn trực tiếp với kỹ sư KTP?</span>
          <Link href="/lien-he" className="bg-[#69afd7] hover:bg-[#5097c0] text-white font-extrabold px-5 py-2.5 rounded-xl uppercase text-xs tracking-wider shadow-md">
            Liên Hệ Ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
