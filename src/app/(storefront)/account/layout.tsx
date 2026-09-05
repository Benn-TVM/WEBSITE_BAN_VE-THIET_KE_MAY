import Link from 'next/link';
import { User, FileText, ArrowLeft } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-[#3583b2]" />
            Tài Khoản & Quản Lý Bản Vẽ Đã Mua
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Quản lý đơn hàng, cấp quyền tải xuống bản vẽ CAD và lịch sử tải an toàn
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs font-bold text-[#3583b2] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Về Cửa hàng</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <LogoutButton className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-1 space-y-2">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
              Quản lý của tôi
            </div>
            <Link href="/account" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#2c6e98] bg-[#eef7fc] border border-[#b8ddf0] transition-all">
              <FileText className="w-4 h-4 text-[#3583b2]" />
              <span>Bản vẽ đã mua & License</span>
            </Link>

            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-2 mt-4">
              Tài khoản
            </div>
            <LogoutButton className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all w-full text-left" />
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3">
          {children}
        </main>
      </div>
    </div>
  );
}
