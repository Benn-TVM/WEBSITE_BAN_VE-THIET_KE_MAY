'use client';

import { useState } from 'react';
import { Search, CheckCircle2, ShieldCheck, Clock, User, Phone, Mail } from 'lucide-react';

interface OrderItem {
  id: number;
  orderCode: string;
  subtotal: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string | Date;
  user: { id: number; name: string; email: string; phone?: string | null };
  items: Array<{
    id: number;
    price: number;
    quantity: number;
    product: { productName: string; cadCode: string };
    package: { packageName: string };
  }>;
  licenses: Array<{ id: number; status: string; downloadCount: number }>;
}

export default function AdminOrdersTable({ initialOrders }: { initialOrders: OrderItem[] }) {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = orders.filter(o => {
    const matchesSearch =
      o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.user.phone && o.user.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'ALL' || o.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmPayment = async (orderId: number) => {
    setLoadingId(orderId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/confirm-payment`, {
        method: 'POST'
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(`Lỗi: ${data.error || 'Xác nhận thanh toán thất bại'}`);
        setLoadingId(null);
        return;
      }

      setMessage(data.message || 'Xác nhận thanh toán và sinh License thành công!');
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, paymentStatus: 'PAID', orderStatus: 'COMPLETED' } : o))
      );
    } catch (err) {
      console.error(err);
      setMessage('Đã có lỗi khi kết nối máy chủ');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className="bg-[#eef7fc] border border-[#b8ddf0] text-[#2c6e98] p-4 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="underline text-xs">Đóng</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tìm theo Mã đơn (ORD-...), Tên, SĐT, Email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#69afd7] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'ALL'
                ? 'bg-[#69afd7] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất Cả ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Chờ Thanh Toán
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'PAID'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Đã Duyệt PAID
          </button>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Mã Đơn Hàng</th>
                <th className="p-4">Thông Tin Khách Hàng</th>
                <th className="p-4">Sản Phẩm & Gói CAD</th>
                <th className="p-4">Tổng Tiền</th>
                <th className="p-4">Trạng Thái VietQR</th>
                <th className="p-4">Ngày Tạo</th>
                <th className="p-4 text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-black text-[#2c6e98] text-sm">
                    {order.orderCode}
                  </td>

                  <td className="p-4">
                    <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{order.user.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono space-y-0.5 mt-0.5">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{order.user.email}</span>
                      </div>
                      {order.user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{order.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-4 space-y-1">
                    {order.items.map(item => (
                      <div key={item.id} className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
                        <div className="font-bold text-slate-900">{item.product.productName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Mã CAD: <strong className="text-[#3583b2]">{item.product.cadCode}</strong> • Gói: <strong>{item.package.packageName}</strong>
                        </div>
                      </div>
                    ))}
                  </td>

                  <td className="p-4 font-black text-slate-900 font-mono text-sm">
                    {order.total.toLocaleString('vi-VN')} đ
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black flex items-center gap-1 w-max ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}>
                      {order.paymentStatus === 'PAID' ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ĐÃ XÁC NHẬN PAID</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>CHỜ CHUYỂN KHOẢN</span>
                        </>
                      )}
                    </span>
                  </td>

                  <td className="p-4 text-slate-500 font-mono text-[11px]">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </td>

                  <td className="p-4 text-right">
                    {order.paymentStatus === 'PAID' ? (
                      <span className="text-[11px] text-emerald-700 font-extrabold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Đã Cấp License</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConfirmPayment(order.id)}
                        disabled={loadingId === order.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5 ml-auto"
                      >
                        {loadingId === order.id ? (
                          <span>Đang sinh License...</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Duyệt Tiền & Cấp License</span>
                          </>
                        )}
                      </button>
                    )}
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
