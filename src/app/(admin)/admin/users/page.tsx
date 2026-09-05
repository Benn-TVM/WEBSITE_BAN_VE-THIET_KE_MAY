import { Users, Shield } from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminHeaderProfile from '@/components/AdminHeaderProfile';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      role: true,
      _count: { select: { orders: true, licenses: true, downloads: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản Lý Người Dùng & Phân Quyền RBAC</h1>
          <p className="text-xs text-slate-500 font-semibold">
            Danh sách tài khoản khách hàng, nhân viên kỹ thuật (Technical), kinh doanh (Sales) và quản trị viên
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AdminHeaderProfile />
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-mono font-bold">
            <Users className="w-4 h-4 text-[#3583b2]" />
            <span>Tổng Thành Viên: <strong className="text-[#2c6e98]">{users.length} tài khoản</strong></span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Họ Và Tên</th>
                <th className="p-4">Email & SĐT</th>
                <th className="p-4">Vai Trò (Role)</th>
                <th className="p-4">Đơn Hàng</th>
                <th className="p-4">License Sở Hữu</th>
                <th className="p-4">Lượt Download</th>
                <th className="p-4 text-right">Ngày Tham Gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#eef7fc] border border-[#b8ddf0] text-[#3583b2] font-black flex items-center justify-center text-xs">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{u.name}</span>
                  </td>

                  <td className="p-4 font-mono text-slate-600">
                    <div className="font-bold text-slate-900">{u.email}</div>
                    <div className="text-[10px] text-slate-500">{u.phone || 'Chưa cập nhật'}</div>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black flex items-center gap-1 w-max ${
                      u.role.name === 'ADMIN'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : u.role.name === 'TECHNICAL'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : u.role.name === 'SALES'
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      <Shield className="w-3 h-3" />
                      <span>{u.role.name}</span>
                    </span>
                  </td>

                  <td className="p-4 font-mono font-bold text-slate-800">
                    {u._count.orders} đơn
                  </td>

                  <td className="p-4 font-mono font-black text-[#2c6e98]">
                    {u._count.licenses} license
                  </td>

                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {u._count.downloads} lượt
                  </td>

                  <td className="p-4 text-right text-slate-500 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
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
