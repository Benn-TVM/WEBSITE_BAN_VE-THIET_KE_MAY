import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Search } from 'lucide-react';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

interface CategoryPageProps {
  params: Promise<{
    categorySlug: string;
  }>;
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categorySlug } = await params;
  const { q, type } = await searchParams;

  // 1. Fetch current Category
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: {
      parent: true,
      children: true
    }
  });

  if (!category) {
    notFound();
  }

  // 2. Fetch all categories for sidebar / filter dropdown
  const allCategories = await prisma.category.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { id: 'asc' }
  });

  // 3. Find subcategory IDs if any
  const childCategoryIds = category.children.map(c => c.id);
  const targetCategoryIds = [category.id, ...childCategoryIds];

  // 4. Build query filter
  const where: Prisma.ProductWhereInput = {
    status: 'PUBLISHED',
    categories: {
      some: {
        categoryId: { in: targetCategoryIds }
      }
    }
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

  // 5. Fetch Products
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
      {/* Breadcrumb Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
          <Link href="/" className="hover:text-[#3583b2]">Trang chủ</Link>
          <span>/</span>
          <Link href="/cad" className="hover:text-[#3583b2]">Thư viện CAD</Link>
          {category.parent && (
            <>
              <span>/</span>
              <Link href={`/cad/${category.parent.slug}`} className="hover:text-[#3583b2]">
                {category.parent.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#3583b2] font-bold">{category.name}</span>
        </div>

        <h1 className="text-3xl font-black text-slate-900">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-xs text-slate-600 font-medium">
            {category.description}
          </p>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form action={`/cad/${categorySlug}`} method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search Input */}
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder={`Tìm kiếm trong ${category.name}...`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#69afd7] font-medium"
            />
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-4">
            <button
              type="submit"
              className="w-full bg-[#69afd7] hover:bg-[#5097c0] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Tìm Kiếm Bản Vẽ
            </button>
          </div>
        </form>

        {/* Child Category Pills */}
        {allCategories.filter(c => c.parentId === category.id).length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 text-[11px] font-bold">Danh mục con:</span>
            {allCategories.filter(c => c.parentId === category.id).map(subCat => (
              <Link
                key={subCat.id}
                href={`/cad/${subCat.slug}`}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-[#eef7fc] border border-slate-200 hover:border-[#b8ddf0] text-slate-800 text-[11px] font-bold transition-all"
              >
                {subCat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Product Results Grid */}
      {products.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="text-slate-700 text-base font-bold">Chưa có bản vẽ nào trong danh mục này</div>
          <p className="text-xs text-slate-500 font-medium">Vui lòng quay lại thư viện bản vẽ chính để tìm sản phẩm khác.</p>
          <Link href="/cad" className="inline-block bg-[#69afd7] hover:bg-[#5097c0] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md">
            Xem tất cả bản vẽ
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
