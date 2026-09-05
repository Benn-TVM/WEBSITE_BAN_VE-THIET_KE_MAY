import Link from 'next/link';
import {
  LayoutDashboard,
  Box,
  FileCode,
  ShoppingCart,
  CreditCard,
  Users,
  BarChart3,
  Download,
  ClipboardList
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-4 space-y-6 flex flex-col shrink-0 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#69afd7] text-white font-black flex items-center justify-center text-xs shadow-md">
              KTP
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 uppercase">ADMIN PORTAL</div>
              <div className="text-[10px] text-[#2c6e98] font-bold font-mono">Control Center v1.0</div>
            </div>
          </div>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto text-xs font-bold text-slate-700">
          <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#2c6e98] bg-[#eef7fc] border border-[#b8ddf0]">
            <LayoutDashboard className="w-4 h-4 text-[#3583b2]" />
            <span>Dashboard Tổng quan</span>
          </Link>

          <div className="pt-3 pb-1 text-[10px] uppercase font-black text-slate-400 tracking-wider">
            Quản lý Sản phẩm & CAD
          </div>
          <Link href="/admin/products" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <Box className="w-4 h-4 text-[#3583b2]" />
            <span>Sản phẩm Bản vẽ</span>
          </Link>
          <Link href="/admin/files" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>Quản lý File Private</span>
          </Link>

          <div className="pt-3 pb-1 text-[10px] uppercase font-black text-slate-400 tracking-wider">
            Đơn hàng & Khách hàng
          </div>
          <Link href="/admin/orders" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <ShoppingCart className="w-4 h-4 text-amber-600" />
            <span>Quản lý Đơn hàng</span>
          </Link>
          <Link href="/admin/payments" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <CreditCard className="w-4 h-4 text-green-600" />
            <span>Xác nhận Thanh toán</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Người dùng & Phân quyền</span>
          </Link>

          <div className="pt-3 pb-1 text-[10px] uppercase font-black text-slate-400 tracking-wider">
            Báo cáo & Bảo mật
          </div>
          <Link href="/admin/reports" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <BarChart3 className="w-4 h-4 text-[#3583b2]" />
            <span>Báo cáo Doanh thu</span>
          </Link>
          <Link href="/admin/downloads" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Thống kê Download Log</span>
          </Link>
          <Link href="/admin/audit-logs" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <ClipboardList className="w-4 h-4 text-slate-500" />
            <span>Audit Log Hệ thống</span>
          </Link>
        </nav>
      </aside>

      {/* Main Admin Workspace */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
