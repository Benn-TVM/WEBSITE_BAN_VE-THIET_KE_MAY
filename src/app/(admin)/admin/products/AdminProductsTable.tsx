'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Eye, ShieldCheck, ShieldAlert, Lock, Edit3 } from 'lucide-react';

interface ProductItem {
  id: number;
  productName: string;
  productCode: string;
  cadCode: string;
  productType: string;
  rightsStatus: string;
  status: string;
  slug: string;
  categories: Array<{ category: { name: string } }>;
  packages: Array<{ packageName: string; price: number }>;
  _count: { files: number };
}

interface AdminProductsTableProps {
  initialProducts: ProductItem[];
}

export default function AdminProductsTable({ initialProducts }: AdminProductsTableProps) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = products.filter(p => {
    const matchesSearch =
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cadCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'ALL' || p.productType === filterType;
    return matchesSearch && matchesType;
  });

  const handleTogglePublish = async (id: number, currentStatus: string, rightsStatus: string) => {
    setErrorMsg(null);
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

    // Client side check for Rights Protection
    if (newStatus === 'PUBLISHED' && ['UNKNOWN', 'NOT_FOR_SALE'].includes(rightsStatus)) {
      setErrorMsg(`BẢO VỆ TÀI SẢN: Không thể Xuất bản sản phẩm có quyền sở hữu chưa xác minh (${rightsStatus}).`);
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Cập nhật trạng thái thất bại');
        return;
      }

      setProducts(prev => prev.map(p => (p.id === id ? { ...p, status: newStatus } : p)));
    } catch {
      setErrorMsg('Đã có lỗi kết nối khi cập nhật sản phẩm');
    }
  };

  return (
    <div className="space-y-4">
      {/* Error alert */}
      {errorMsg && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-center justify-between font-bold">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="font-bold underline text-xs">
            Đóng
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tìm theo Mã CAD, Mã máy, Tên máy..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#69afd7] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'ALL'
                ? 'bg-[#69afd7] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất Cả ({products.length})
          </button>
          <button
            onClick={() => setFilterType('COMPLETE_MACHINE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'COMPLETE_MACHINE'
                ? 'bg-[#69afd7] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Máy Hoàn Chỉnh
          </button>
          <button
            onClick={() => setFilterType('SPARE_PART')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'SPARE_PART'
                ? 'bg-[#69afd7] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Phụ Tùng CAD
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Mã CAD</th>
                <th className="p-4">Tên Sản Phẩm (Mã Máy)</th>
                <th className="p-4">Loại & Danh Mục</th>
                <th className="p-4">Trạng Thái Quyền (Rights)</th>
                <th className="p-4">Khoảng Giá</th>
                <th className="p-4">Số File</th>
                <th className="p-4">Xuất Bản</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.map(p => {
                const maxPrice = p.packages.length > 0 ? Math.max(...p.packages.map(pkg => pkg.price)) : 0;
                const minPrice = p.packages.length > 0 ? Math.min(...p.packages.map(pkg => pkg.price)) : 0;
                const isRightsRestricted = ['UNKNOWN', 'NOT_FOR_SALE'].includes(p.rightsStatus);

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-black text-[#2c6e98]">{p.cadCode}</td>

                    <td className="p-4">
                      <div className="font-sans font-bold text-slate-900 text-xs">{p.productName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Ref: {p.productCode}</div>
                    </td>

                    <td className="p-4 font-sans">
                      <span className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                        {p.categories[0]?.category.name || 'CAD'}
                      </span>
                    </td>

                    <td className="p-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 w-max ${
                        p.rightsStatus === 'OWNED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : p.rightsStatus === 'LICENSED'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}>
                        {isRightsRestricted ? <Lock className="w-3 h-3 text-amber-600" /> : <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                        {p.rightsStatus}
                      </span>
                    </td>

                    <td className="p-4 text-slate-900 font-black">
                      {minPrice.toLocaleString('vi-VN')} đ - {maxPrice.toLocaleString('vi-VN')} đ
                    </td>

                    <td className="p-4 text-[#3583b2] font-black">
                      {p._count.files} file
                    </td>

                    <td className="p-4 font-sans">
                      <button
                        onClick={() => handleTogglePublish(p.id, p.status, p.rightsStatus)}
                        className={`px-2.5 py-1 rounded text-[10px] font-black transition-all ${
                          p.status === 'PUBLISHED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {p.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'}
                      </button>
                    </td>

                    <td className="p-4 text-right font-sans flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded font-bold transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#3583b2]" />
                        <span>Sửa</span>
                      </Link>
                      <Link
                        href={`/cad/may-thiet-ke/${p.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] text-[#3583b2] hover:underline font-extrabold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem trang</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
