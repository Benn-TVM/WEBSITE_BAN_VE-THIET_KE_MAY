import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#222222] border-t border-[#333333] text-slate-300 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#69afd7] text-white font-black flex items-center justify-center">
              KTP
            </div>
            <span className="font-extrabold text-white text-base tracking-wide uppercase">KTP CAD</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Nền tảng thương mại hóa bản vẽ kỹ thuật máy & phụ tùng CAD chính thức của KTP CAD. Đảm bảo chuẩn xác 2D/3D gia công cơ khí.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Chỉ phát hành bản vẽ sở hữu hoặc có bản quyền</span>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Danh mục CAD</h4>
          <ul className="space-y-2 text-xs text-slate-400 font-medium">
            <li><Link href="/cad/may-nganh-gach" className="hover:text-[#69afd7] transition-colors">Bản vẽ Máy ngành gạch</Link></li>
            <li><Link href="/cad/may-nganh-da" className="hover:text-[#69afd7] transition-colors">Bản vẽ Máy ngành đá</Link></li>
            <li><Link href="/cad/waterjet-cnc" className="hover:text-[#69afd7] transition-colors">Máy Waterjet & CNC 5 trục</Link></li>
            <li><Link href="/cad/phu-tung-waterjet" className="hover:text-[#69afd7] transition-colors">Phụ tùng Waterjet (Ruby, Seal, Valve)</Link></li>
            <li><Link href="/goi-cad" className="hover:text-[#69afd7] transition-colors">Gói CAD Tiết kiệm</Link></li>
          </ul>
        </div>

        {/* Col 3: Policy */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Chính sách & Hỗ trợ</h4>
          <ul className="space-y-2 text-xs text-slate-400 font-medium">
            <li><Link href="/huong-dan-mua" className="hover:text-[#69afd7] transition-colors">Hướng dẫn Mua & Tải bản vẽ</Link></li>
            <li><Link href="/gioi-thieu" className="hover:text-[#69afd7] transition-colors">Giới thiệu KTP CAD</Link></li>
            <li><Link href="/lien-he" className="hover:text-[#69afd7] transition-colors">Liên hệ tư vấn Kỹ thuật</Link></li>
          </ul>
        </div>

        {/* Col 4: Contact info */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Liên hệ KTP</h4>
          <div className="space-y-2 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#69afd7]" />
              <span className="font-bold text-white text-sm">0901 234 567</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#69afd7]" />
              <span>cad-library@ktp.vn</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#69afd7] shrink-0 mt-0.5" />
              <span>TP. Hồ Chí Minh / Bình Dương / Đồng Nai</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#333333] py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} KTP CAD – Thư Viện Bản Vẽ Thiết Kế Máy & Phụ Tùng. All rights reserved.
      </div>
    </footer>
  );
}
