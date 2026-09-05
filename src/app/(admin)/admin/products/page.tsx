import Link from 'next/link';
import { Plus } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import AdminHeaderProfile from '@/components/AdminHeaderProfile';
import AdminProductsTable from './AdminProductsTable';

export default async function AdminProductsPage() {
  const session = await getSessionUser();
  const products = await prisma.product.findMany({
    include: {
      categories: { include: { category: true } },
      packages: { orderBy: { price: 'asc' } },
      _count: { select: { files: true } }
    },
    orderBy: { id: 'desc' }
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản Lý Sản Phẩm Bản Vẽ KTP</h1>
          <p className="text-xs text-slate-500 font-medium">
            Quản lý máy thiết kế, phụ tùng CAD, kiểm tra quyền thương mại hóa và thiết lập gói giá
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <AdminHeaderProfile adminName={session?.name} adminRole={session?.role} />
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </Link>
        </div>
      </div>

      {/* Interactive Products Management Table */}
      <AdminProductsTable initialProducts={products} />
    </div>
  );
}
