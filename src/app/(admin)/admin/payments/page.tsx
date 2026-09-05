import { CheckCircle2, Clock, DollarSign } from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminHeaderProfile from '@/components/AdminHeaderProfile';

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalPaidAmount = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Xác Nhận & Lịch Sử Giao Dịch VietQR</h1>
          <p className="text-xs text-slate-500 font-semibold">
            Đối soát danh sách chuyển khoản ngân hàng, khớp mã đơn hàng và kiểm tra lịch sử biến động số dư
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AdminHeaderProfile />
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-mono font-bold">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Đã Nhận Chuyển Khoản: <strong className="text-[#2c6e98]">{totalPaidAmount.toLocaleString('vi-VN')} đ</strong></span>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Cú Pháp / Mã Đơn</th>
                <th className="p-4">Khách Hàng Thanh Toán</th>
                <th className="p-4">Phương Thức</th>
                <th className="p-4">Số Tiền</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-right">Ngày Chuyển</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-black text-[#2c6e98] text-sm">
                    KTPCAD {p.order.orderCode}
                  </td>

                  <td className="p-4 font-sans">
                    <div className="font-bold text-slate-900">{p.order.user.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.order.user.email}</div>
                  </td>

                  <td className="p-4">
                    <span className="bg-[#eef7fc] border border-[#b8ddf0] text-[#2c6e98] px-2 py-0.5 rounded text-[10px] font-black">
                      {p.method} (MB Bank)
                    </span>
                  </td>

                  <td className="p-4 font-black text-slate-900 text-sm">
                    {p.amount.toLocaleString('vi-VN')} đ
                  </td>

                  <td className="p-4 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 w-max ${
                      p.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}>
                      {p.status === 'PAID' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{p.status === 'PAID' ? 'ĐÃ KHỚP LỆNH PAID' : 'CHỜ CHUYỂN KHOẢN'}</span>
                    </span>
                  </td>

                  <td className="p-4 text-right text-slate-500 text-[11px]">
                    {p.paidAt ? new Date(p.paidAt).toLocaleString('vi-VN') : new Date(p.createdAt).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
