import prisma from '@/lib/prisma';
import AdminHeaderProfile from '@/components/AdminHeaderProfile';
import AdminOrdersTable from './AdminOrdersTable';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: { include: { product: true, package: true } },
      payments: true,
      licenses: true
    }
  });

  const totalOrders = orders.length;
  const paidOrders = orders.filter(o => o.paymentStatus === 'PAID').length;
  const pendingOrders = orders.filter(o => o.paymentStatus === 'PENDING').length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản Lý Đơn Hàng Mua CAD</h1>
          <p className="text-xs text-slate-500 font-semibold">
            Xác nhận chuyển khoản VietQR, quản lý đơn hàng & tự động cấp License tải bản vẽ
          </p>
        </div>
        <AdminHeaderProfile />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-500 font-black uppercase">Tổng Đơn Hàng</div>
          <div className="text-2xl font-black text-slate-900">{totalOrders}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-amber-700 font-black uppercase">Chờ Chuyển Khoản</div>
          <div className="text-2xl font-black text-amber-600">{pendingOrders}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-emerald-700 font-black uppercase">Đã Thanh Toán (PAID)</div>
          <div className="text-2xl font-black text-emerald-600">{paidOrders}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-[#3583b2] font-black uppercase">Doanh Thu Đã Thu</div>
          <div className="text-2xl font-black text-[#2c6e98] font-mono">
            {totalRevenue.toLocaleString('vi-VN')} đ
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <AdminOrdersTable initialOrders={orders} />
    </div>
  );
}
