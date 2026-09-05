import Link from 'next/link';
import {
  ShieldCheck,
  Download,
  FolderTree,
  Clock,
  Box,
  ShoppingCart
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
import ChangePasswordModal from '@/components/ChangePasswordModal';

export default async function AccountPage() {
  const session = await getSessionUser();

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Vui lòng đăng nhập để xem License bản vẽ</h2>
        <Link href="/login" className="inline-block bg-[#69afd7] text-white px-6 py-2.5 rounded-xl text-xs font-bold">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  // Fetch logged in user details
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      licenses: {
        include: {
          product: {
            include: {
              files: true
            }
          },
          package: true,
          order: true
        },
        orderBy: { createdAt: 'desc' }
      },
      orders: {
        include: {
          items: { include: { product: true, package: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Vui lòng đăng nhập để xem License bản vẽ</h2>
        <Link href="/login" className="inline-block bg-[#69afd7] text-white px-6 py-2.5 rounded-xl text-xs font-bold">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const activeLicenses = user.licenses.filter(l => l.status === 'ACTIVE');

  return (
    <div className="space-y-8">
      {/* Header Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#eef7fc] border border-[#b8ddf0] text-[#3583b2] flex items-center justify-center font-black text-xl shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-black">
                Tài Khoản Đã Xác Minh
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-3 mt-1">
              <span>Email: <strong>{user.email}</strong></span>
              {user.phone && <span>• SĐT: <strong>{user.phone}</strong></span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-50 p-3 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>License Sở Hữu: <strong className="text-[#3583b2] text-sm">{activeLicenses.length} bản vẽ</strong></span>
          </div>

          <ChangePasswordModal />
          <LogoutButton className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-3 rounded-xl text-xs font-extrabold transition-all shrink-0" />
        </div>
      </div>

      {/* Main License & Orders Content */}
      <div className="space-y-8">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-[#3583b2]" />
            <span>Thư Viện License Bản Vẽ Đã Cấp Quyền Tải</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">Quy định: Tối đa 5 lần tải / 30 ngày có hiệu lực</span>
        </div>

        {activeLicenses.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto">
            <Box className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Bạn chưa có License bản vẽ nào</h3>
              <p className="text-xs text-slate-500">Sau khi mua gói bản vẽ và Admin xác nhận thanh toán, License sẽ tự động xuất hiện tại đây.</p>
            </div>
            <Link href="/cad" className="inline-block bg-[#69afd7] hover:bg-[#5097c0] text-white px-5 py-2.5 rounded-xl text-xs font-bold">
              Khám phá bản vẽ KTP
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {activeLicenses.map((license) => {
              const remainingDays = Math.max(
                0,
                Math.ceil((new Date(license.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              );

              return (
                <div key={license.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                  {/* License Info Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-white bg-[#69afd7] px-2.5 py-0.5 rounded">
                          {license.product.cadCode}
                        </span>
                        <span className="text-xs font-bold text-[#2c6e98] bg-[#eef7fc] border border-[#b8ddf0] px-2 py-0.5 rounded">
                          Gói: {license.package.packageName}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900">
                        {license.product.productName}
                      </h3>
                    </div>

                    {/* Download Counter & Expiry */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center font-mono">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Lượt Tải File</div>
                        <div className="font-black text-[#2c6e98] text-sm">
                          {license.downloadCount} / {license.downloadLimit} lần
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center font-mono">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Hạn License</div>
                        <div className="font-black text-emerald-700 text-sm flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Còn {remainingDays} ngày</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Private File Links Listing */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderTree className="w-4 h-4 text-[#3583b2]" />
                      <span>Danh Sách File Bản Vẽ Đã Mở Khóa ({license.product.files.length} file)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {license.product.files.map((file) => (
                        <div key={file.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
                          <div className="truncate pr-2">
                            <div className="font-bold text-slate-900 truncate">{file.fileName}</div>
                            <div className="text-[10px] text-slate-500">{file.folderCategory} • {(file.fileSize / 1024).toFixed(0)} KB</div>
                          </div>
                          <a
                            href={`/api/download/${file.id}?licenseId=${license.id}`}
                            className="bg-[#69afd7] hover:bg-[#5097c0] text-white font-extrabold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 shrink-0 shadow-sm transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* User Orders History */}
        <div className="space-y-4 pt-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#3583b2]" />
            <span>Lịch Sử Đơn Hàng Của Bạn ({user.orders.length} đơn)</span>
          </h3>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-4">Mã Đơn</th>
                  <th className="p-4">Các Gói Đã Đặt</th>
                  <th className="p-4">Tổng Tiền</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Ngày Đặt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {user.orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-black text-[#2c6e98]">{order.orderCode}</td>
                    <td className="p-4">
                      {order.items.map(item => (
                        <div key={item.id} className="text-slate-900 font-bold">
                          {item.product.productName} ({item.package.packageName})
                        </div>
                      ))}
                    </td>
                    <td className="p-4 font-black font-mono text-slate-900">{order.total.toLocaleString('vi-VN')} đ</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}>
                        {order.paymentStatus === 'PAID' ? 'Đã Duyệt (PAID)' : 'Chờ Chuyển Khoản'}
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-500 font-mono">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
