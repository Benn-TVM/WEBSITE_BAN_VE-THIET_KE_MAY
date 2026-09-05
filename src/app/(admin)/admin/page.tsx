import Link from 'next/link';
import {
  Box,
  HardDrive,
  ShoppingCart,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import AdminHeaderProfile from '@/components/AdminHeaderProfile';

export default async function AdminDashboardPage() {
  const session = await getSessionUser();
  // Fetch System Statistics
  const totalProducts = await prisma.product.count();
  const publishedProducts = await prisma.product.count({ where: { status: 'PUBLISHED' } });
  const draftProducts = await prisma.product.count({ where: { status: 'DRAFT' } });

  // Unverified/Uncertain Rights Products
  const unverifiedRightsProducts = await prisma.product.findMany({
    where: {
      rightsStatus: { in: ['UNKNOWN', 'NOT_FOR_SALE'] }
    },
    select: {
      id: true,
      productName: true,
      cadCode: true,
      rightsStatus: true,
      status: true
    }
  });

  const totalFiles = await prisma.file.count();
  const totalFileSize = await prisma.file.aggregate({
    _sum: { fileSize: true }
  });
  const totalMB = Math.round((totalFileSize._sum.fileSize || 0) / (1024 * 1024));

  const totalOrders = await prisma.order.count();
  const totalRevenueResult = await prisma.order.aggregate({
    _sum: { total: true },
    where: { paymentStatus: 'PAID' }
  });
  const totalRevenue = totalRevenueResult._sum.total || 0;

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, phone: true } },
      items: { include: { product: true, package: true } }
    }
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard Quản Trị KTP CAD</h1>
          <p className="text-xs text-slate-500 font-semibold">
            Giám sát tài sản số bản vẽ, bảo hộ quyền sở hữu bản quyền, doanh thu & đơn hàng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AdminHeaderProfile adminName={session?.name} adminRole={session?.role} />
          <Link
            href="/admin/products/new"
            className="bg-[#69afd7] hover:bg-[#5097c0] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all uppercase tracking-wider"
          >
            <Box className="w-4 h-4" />
            <span>Thêm Bản Vẽ Máy Mới</span>
          </Link>
        </div>
      </div>

      {/* Metrics Panel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider">Tổng Số Bản Vẽ</span>
            <Box className="w-5 h-5 text-[#3583b2]" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalProducts}</div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-bold">
            <span className="text-emerald-700">{publishedProducts} Đã Xuất Bản</span>
            <span>•</span>
            <span className="text-amber-700">{draftProducts} Bản Nháp</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider">Dung Lượng File Private</span>
            <HardDrive className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalMB} MB</div>
          <div className="text-[11px] text-slate-500 font-semibold">
            Tổng cộng <strong className="text-slate-800">{totalFiles} file CAD private</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider">Tổng Đơn Hàng</span>
            <ShoppingCart className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalOrders}</div>
          <div className="text-[11px] text-slate-500 font-semibold">
            Lượt mua gói bản vẽ thành công
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-black uppercase tracking-wider">Tổng Doanh Thu</span>
            <DollarSign className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-[#3583b2]">
            {totalRevenue.toLocaleString('vi-VN')} đ
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-extrabold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Xác nhận thủ công</span>
          </div>
        </div>
      </div>

      {/* Rights Protection Enforcement Alert Panel */}
      {unverifiedRightsProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>CẢNH BÁO BẢO HỘ TÀI SẢN: Phát Hiện {unverifiedRightsProducts.length} Máy Chưa Xác Minh Bản Quyền!</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            Các sản phẩm dưới đây thuộc danh mục <strong>máy nhập khẩu / bản vẽ bên thứ 3 chưa rõ quyền thương mại hóa (UNKNOWN)</strong>. Hệ thống <strong>CƯỠNG CHẾ CHẶN NÚT PUBLISH</strong> để ngăn chặn rủi ro pháp lý. Vui lòng xác minh hồ sơ sở hữu trước khi xuất bản.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {unverifiedRightsProducts.map(p => (
              <div key={p.id} className="bg-white border border-amber-200 px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono">
                <span className="font-black text-slate-900">{p.cadCode}</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-black">
                  {p.rightsStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#3583b2]" />
            <span>Đơn Hàng Mua Bản Vẽ Gần Đây</span>
          </h3>
          <Link href="/admin/orders" className="text-xs text-[#3583b2] hover:underline font-extrabold flex items-center gap-1">
            <span>Xem tất cả đơn hàng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Mã Đơn</th>
                  <th className="p-3">Khách Hàng</th>
                  <th className="p-3">Sản Phẩm & Gói</th>
                  <th className="p-3">Tổng Tiền</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Ngày Tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-black text-[#2c6e98]">{order.orderCode}</td>
                    <td className="p-3 font-bold text-slate-900">{order.user.name} ({order.user.phone || 'N/A'})</td>
                    <td className="p-3">
                      {order.items.map(item => (
                        <div key={item.id} className="text-slate-800 font-medium">
                          <span className="font-bold">{item.product.cadCode}</span> - {item.package.packageName}
                        </div>
                      ))}
                    </td>
                    <td className="p-3 font-black text-slate-900">{order.total.toLocaleString('vi-VN')} đ</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}>
                        {order.paymentStatus === 'PAID' ? 'Đã Thanh Toán' : 'Chờ Chuyển Khoản'}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-500 font-mono">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400 font-medium">
            Chưa có đơn hàng nào trong hệ thống.
          </div>
        )}
      </div>
    </div>
  );
}
