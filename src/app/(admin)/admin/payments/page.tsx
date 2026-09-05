import prisma from '@/lib/prisma';
import AdminHeaderProfile from '@/components/AdminHeaderProfile';
import AdminPaymentsTable from './AdminPaymentsTable';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: {
            include: {
              product: { select: { productName: true, cadCode: true } }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Xác Nhận & Lịch Sử Giao Dịch VietQR</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Đối soát chuyển khoản MB Bank, bấm nút Xác Nhận Thanh Toán để tự động kích hoạt License tải file CAD cho khách
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AdminHeaderProfile />
        </div>
      </div>

      {/* Interactive Payments Table with Confirm Payment Action */}
      <AdminPaymentsTable initialPayments={payments} />
    </div>
  );
}

