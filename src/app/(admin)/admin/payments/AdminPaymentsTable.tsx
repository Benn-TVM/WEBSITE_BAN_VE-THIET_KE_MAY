'use client';

import { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export interface PaymentWithOrder {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  transactionId?: string | null;
  status: string;
  paidAt?: string | Date | null;
  createdAt: string | Date;
  order: {
    id: number;
    orderCode: string;
    total: number;
    paymentStatus: string;
    user: {
      name: string;
      email: string;
      phone?: string | null;
    };
    items: Array<{
      id: number;
      product: {
        productName: string;
        cadCode: string;
      };
    }>;
  };
}

interface AdminPaymentsTableProps {
  initialPayments: PaymentWithOrder[];
}

export default function AdminPaymentsTable({ initialPayments }: AdminPaymentsTableProps) {
  const [payments, setPayments] = useState<PaymentWithOrder[]>(initialPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Thống kê nhanh
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const paidCount = payments.filter(p => p.status === 'PAID').length;
  const totalPaidAmount = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  // Lọc dữ liệu
  const filtered = payments.filter(p => {
    const matchesSearch =
      p.order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `ktpcad ${p.order.orderCode}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.order.user.phone && p.order.user.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmPayment = async (orderId: number, orderCode: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xác nhận đã nhận tiền cho đơn hàng ${orderCode}? Hệ thống sẽ tự động kích hoạt bản quyền License tải file CAD cho khách hàng ngay lập tức.`)) {
      return;
    }

    setLoadingOrderId(orderId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/confirm-payment`, {
        method: 'POST'
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: 'error',
          text: `Lỗi: ${data.error || 'Xác nhận thanh toán thất bại'}`
        });
        return;
      }

      setMessage({
        type: 'success',
        text: data.message || `Đã xác nhận thanh toán đơn hàng ${orderCode} thành công!`
      });

      // Cập nhật trạng thái payment & order ngay trên UI
      setPayments(prev =>
        prev.map(p => {
          if (p.order.id === orderId) {
            return {
              ...p,
              status: 'PAID',
              paidAt: new Date(),
              order: {
                ...p.order,
                paymentStatus: 'PAID'
              }
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: 'Đã có lỗi kết nối máy chủ khi xác nhận thanh toán.'
      });
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Alert thông báo kết quả */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border shadow-sm transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="underline text-xs opacity-75 hover:opacity-100 ml-4 shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Cards thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đã Nhận Chuyển Khoản</div>
            <div className="text-lg font-mono font-black text-[#2c6e98] mt-0.5">
              {totalPaidAmount.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#eef7fc] border border-[#b8ddf0] flex items-center justify-center text-[#2c6e98]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chờ Duyệt Tiền</div>
            <div className="text-lg font-mono font-black text-amber-600 mt-0.5">
              {pendingCount} giao dịch
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đã Khớp Lệnh & Cấp License</div>
            <div className="text-lg font-mono font-black text-emerald-600 mt-0.5">
              {paidCount} giao dịch
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo Cú pháp (KTPCAD...), Tên, Email, SĐT..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 pl-10 pr-3 py-2.5 focus:outline-none focus:border-[#69afd7] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'ALL'
                ? 'bg-[#69afd7] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất Cả ({payments.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Chờ Duyệt Tiền</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === 'PENDING' ? 'bg-white text-amber-600' : 'bg-amber-600 text-white'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'PAID'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Đã Khớp PAID ({paidCount})
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Cú Pháp Chuyển Khoản</th>
                <th className="p-4">Khách Hàng</th>
                <th className="p-4">Sản Phẩm CAD</th>
                <th className="p-4">Số Tiền</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4">Ngày Tạo</th>
                <th className="p-4 text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    Không tìm thấy giao dịch chuyển khoản nào phù hợp
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const isPending = p.status === 'PENDING';
                  const isProcessing = loadingOrderId === p.order.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Cú pháp */}
                      <td className="p-4 font-mono">
                        <div className="font-black text-[#2c6e98] text-sm">
                          KTPCAD {p.order.orderCode}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          MB Bank • {p.method}
                        </div>
                      </td>

                      {/* Khách hàng */}
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.order.user.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono space-y-0.5 mt-0.5">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{p.order.user.email}</span>
                          </div>
                          {p.order.user.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{p.order.user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Sản phẩm */}
                      <td className="p-4">
                        <div className="space-y-1 max-w-[200px]">
                          {p.order.items.map(item => (
                            <div key={item.id} className="text-[11px] leading-tight">
                              <span className="font-bold text-slate-800 line-clamp-1">
                                {item.product.productName}
                              </span>
                              <span className="font-mono text-[10px] text-[#3583b2] font-semibold">
                                [{item.product.cadCode}]
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Số tiền */}
                      <td className="p-4 font-black text-slate-900 font-mono text-sm">
                        {p.amount.toLocaleString('vi-VN')} đ
                      </td>

                      {/* Trạng thái */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black flex items-center gap-1 w-max ${
                          p.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}>
                          {p.status === 'PAID' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>ĐÃ KHỚP LỆNH PAID</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>CHỜ CHUYỂN KHOẢN</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Ngày */}
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        <div>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(p.createdAt).toLocaleTimeString('vi-VN')}
                        </div>
                      </td>

                      {/* Thao tác xác nhận */}
                      <td className="p-4 text-right">
                        {isPending ? (
                          <button
                            onClick={() => handleConfirmPayment(p.order.id, p.order.orderCode)}
                            disabled={isProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 ml-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Xác nhận đã nhận tiền chuyển khoản và kích hoạt License cho khách hàng"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Đang duyệt & Cấp License...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Xác Nhận Thanh Toán</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 text-emerald-700 font-extrabold text-xs">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Đã Cấp License</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
