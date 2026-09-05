import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ShieldCheck,
  Package,
  Award,
  Calendar,
  Layers
} from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminHeaderProfile from '@/components/AdminHeaderProfile';

export default async function AdminReportsPage() {
  // Fetch Orders with items, packages, products & licenses
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
          package: true
        }
      },
      user: { select: { name: true, email: true } },
      payments: true,
      licenses: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const paidOrders = orders.filter(o => o.paymentStatus === 'PAID');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalPaidOrdersCount = paidOrders.length;
  const averageOrderValue = totalPaidOrdersCount > 0 ? Math.round(totalRevenue / totalPaidOrdersCount) : 0;

  // Package Revenue Breakdown
  const packageStats: Record<string, { count: number; revenue: number }> = {};
  paidOrders.forEach(o => {
    o.items.forEach(item => {
      const pkgName = item.package.packageName;
      if (!packageStats[pkgName]) {
        packageStats[pkgName] = { count: 0, revenue: 0 };
      }
      packageStats[pkgName].count += item.quantity;
      packageStats[pkgName].revenue += item.price * item.quantity;
    });
  });

  // Top Selling Products
  const productStatsMap: Record<number, { cadCode: string; name: string; type: string; units: number; revenue: number }> = {};
  paidOrders.forEach(o => {
    o.items.forEach(item => {
      const pId = item.productId;
      if (!productStatsMap[pId]) {
        productStatsMap[pId] = {
          cadCode: item.product.cadCode,
          name: item.product.productName,
          type: item.product.productType,
          units: 0,
          revenue: 0
        };
      }
      productStatsMap[pId].units += item.quantity;
      productStatsMap[pId].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productStatsMap).sort((a, b) => b.revenue - a.revenue);

  const totalLicensesCount = await prisma.license.count({ where: { status: 'ACTIVE' } });
  const totalDownloadsCount = await prisma.download.count();

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Báo Cáo Doanh Thu & Analytics Bản Vẽ</h1>
          <p className="text-xs text-slate-500 font-semibold">
            Phân tích chi tiết doanh số bán gói CAD, tỷ lệ chuyển đổi và xếp hạng bản vẽ bán chạy
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AdminHeaderProfile />
          <span className="text-xs font-mono font-black text-[#2c6e98] bg-[#eef7fc] border border-[#b8ddf0] px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#3583b2]" />
            <span>Năm 2026</span>
          </span>
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase">
            <span>Tổng Doanh Thu Realized</span>
            <DollarSign className="w-5 h-5 text-[#3583b2]" />
          </div>
          <div className="text-3xl font-black text-[#2c6e98] font-mono">
            {totalRevenue.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Xác thực từ thanh toán VietQR</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase">
            <span>Giá Trị Đơn Trung Bình (AOV)</span>
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {averageOrderValue.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Dựa trên {totalPaidOrdersCount} đơn đã thanh toán
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase">
            <span>License Hoạt Động</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {totalLicensesCount} bản vẽ
          </div>
          <div className="text-[11px] text-emerald-700 font-bold">
            Hiệu lực 30 ngày / 5 lượt tải
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase">
            <span>Lượt Download Private File</span>
            <Package className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {totalDownloadsCount} lượt
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Ký số Signed URL bảo mật
          </div>
        </div>
      </div>

      {/* Package Breakdown & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Package Type Revenue Distribution */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#3583b2]" />
              <span>Cơ Cấu Doanh Thu Theo Gói CAD</span>
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {Object.keys(packageStats).length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-medium">Chưa có dữ liệu giao dịch</div>
            ) : (
              Object.entries(packageStats).map(([pkgName, data]) => {
                const percentage = totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0;
                return (
                  <div key={pkgName} className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{pkgName} ({data.count} gói)</span>
                      <span className="font-mono text-[#2c6e98]">{data.revenue.toLocaleString('vi-VN')} đ</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#69afd7] h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Tỷ trọng doanh số:</span>
                      <span className="font-bold text-[#3583b2]">{percentage}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Top Best-Selling Products */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Bảng Xếp Hạng Bản Vẽ Bán Chạy Nhất</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Xếp theo doanh thu</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-medium">Chưa có dữ liệu bán sản phẩm</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Mã CAD</th>
                    <th className="p-3">Tên Sản Phẩm</th>
                    <th className="p-3">Số Gói Đã Mua</th>
                    <th className="p-3 text-right">Tổng Doanh Thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {topProducts.map((p, idx) => (
                    <tr key={p.cadCode} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-black text-[#2c6e98] flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          idx === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <span>{p.cadCode}</span>
                      </td>

                      <td className="p-3 font-sans font-bold text-slate-900 max-w-xs truncate">
                        {p.name}
                      </td>

                      <td className="p-3 font-bold text-slate-800">
                        {p.units} lượt mua
                      </td>

                      <td className="p-3 text-right font-black text-slate-900">
                        {p.revenue.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
