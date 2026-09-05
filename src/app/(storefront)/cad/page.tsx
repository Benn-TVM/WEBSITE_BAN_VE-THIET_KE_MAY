import Link from 'next/link';
import { Search } from 'lucide-react';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

interface CadCatalogPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
  }>;
}

export default async function CadCatalogPage({ searchParams }: CadCatalogPageProps) {
  const { q, category, type } = await searchParams;

  const categories = await prisma.category.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { id: 'asc' }
  });

  const where: Prisma.ProductWhereInput = {
    status: 'PUBLISHED'
  };

  if (type) {
    where.productType = type;
  }

  if (q) {
    where.OR = [
      { productName: { contains: q } },
      { productCode: { contains: q } },
      { cadCode: { contains: q } },
      { description: { contains: q } }
    ];
  }

  if (category) {
    const selectedCat = categories.find(c => c.slug === category);
    if (selectedCat) {
      const childCatIds = categories.filter(c => c.parentId === selectedCat.id).map(c => c.id);
      where.categories = {
        some: {
          categoryId: { in: [selectedCat.id, ...childCatIds] }
        }
      };
    }
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      assets: true,
      categories: { include: { category: true } },
      packages: { where: { status: 'ACTIVE' }, orderBy: { price: 'asc' } },
      _count: { select: { files: true } }
    },
    orderBy: { id: 'asc' }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#3583b2]">Trang chủ</Link>
          <span>/</span>
          <span className="text-[#3583b2] font-bold">Thư viện Bản vẽ CAD</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          KTP CAD Marketplace – Tất Cả Bản Vẽ Kỹ Thuật
        </h1>
        <p className="text-xs text-slate-600 font-medium">
          Tìm kiếm và tải trọn bộ bản vẽ máy thiết kế, phụ tùng Waterjet chuẩn gia công KTP
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form action="/cad" method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Nhập mã máy (MBG-023), Part No (015849-xx) hoặc từ khóa..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#69afd7] font-medium"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-4">
            <select
              name="category"
              defaultValue={category || ''}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#69afd7]"
            >
              <option value="">Tất cả Danh mục</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>
                  {c.parentId ? `-- ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-[#69afd7] hover:bg-[#5097c0] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Lọc Bản Vẽ
            </button>
          </div>
        </form>

        {/* Quick Filter Tags */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 text-[11px] font-bold">Loại sản phẩm:</span>
          <Link
            href="/cad"
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              !type ? 'bg-[#69afd7] text-white border-[#69afd7] shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả ({products.length})
          </Link>
          <Link
            href="/cad?type=COMPLETE_MACHINE"
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              type === 'COMPLETE_MACHINE' ? 'bg-[#69afd7] text-white border-[#69afd7] shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bản vẽ Máy Hoàn Chỉnh
          </Link>
          <Link
            href="/cad?type=PART_DRAWING"
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              type === 'PART_DRAWING' ? 'bg-[#69afd7] text-white border-[#69afd7] shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bản vẽ Phụ Tùng
          </Link>
        </div>
      </div>

      {/* Product Results Grid */}
      {products.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="text-slate-700 text-base font-bold">Không tìm thấy bản vẽ nào phù hợp</div>
          <p className="text-xs text-slate-500 font-medium">Vui lòng thử tìm kiếm lại với từ khóa khác hoặc bỏ các bộ lọc.</p>
          <Link href="/cad" className="inline-block bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl">
            Xóa bộ lọc
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
