import { Activity } from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminHeaderProfile from '@/components/AdminHeaderProfile';
import AdminAuditLogsTable from './AdminAuditLogsTable';

export default async function AdminAuditLogsPage() {
  const auditLogs = await prisma.auditLog.findMany({
    take: 500,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: { select: { name: true } }
        }
      }
    }
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: { select: { name: true } }
    },
    orderBy: { name: 'asc' }
  });

  const totalLogs = await prisma.auditLog.count();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Audit Log & Nhật Ký An Ninh Hệ Thống</h1>
          <p className="text-xs text-slate-500 font-semibold">
            Giám sát thao tác quản trị, cưỡng chế bản quyền, duyệt thanh toán và các hoạt động bảo mật
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AdminHeaderProfile />
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-mono font-bold">
            <Activity className="w-4 h-4 text-[#3583b2]" />
            <span>Tổng Sự Kiện: <strong className="text-[#2c6e98]">{totalLogs} log</strong></span>
          </div>
        </div>
      </div>

      {/* Interactive Audit Logs Table */}
      <AdminAuditLogsTable initialLogs={auditLogs} users={users} />
    </div>
  );
}
