import Link from 'next/link';
import {
  Cpu,
  Layers,
  Shield,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

export default async function HomePage() {
  // Fetch Featured Machine & Spare Part Products
  const brickMachines = await prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      categories: { some: { category: { slug: 'may-nganh-gach' } } }
    },
    include: {
      assets: true,
      categories: { include: { category: true } },
      packages: { where: { status: 'ACTIVE' }, orderBy: { price: 'asc' } },
      _count: { select: { files: true } }
    },
    take: 6
  });

  const stoneMachines = await prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      categories: { some: { category: { slug: 'may-nganh-da' } } }
    },
    include: {
      assets: true,
      categories: { include: { category: true } },
      packages: { where: { status: 'ACTIVE' }, orderBy: { price: 'asc' } },
      _count: { select: { files: true } }
    },
    take: 6
  });

  const waterjetParts = await prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      categories: { some: { category: { slug: 'phu-tung-waterjet' } } }
    },
    include: {
      assets: true,
      categories: { include: { category: true } },
      packages: { where: { status: 'ACTIVE' }, orderBy: { price: 'asc' } },
      _count: { select: { files: true } }
    },
    take: 6
  });

  return (
    <div className="space-y-16 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Section 1: Brick Machines */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-black text-[#3583b2] uppercase tracking-widest">
                Dòng Sản Phẩm Cốt Lõi (Planetary & Brick Series)
              </div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Cpu className="w-6 h-6 text-[#3583b2]" />
                Bản Vẽ Máy Ngành Gạch
              </h2>
            </div>
            <Link href="/cad/may-nganh-gach" className="text-xs font-bold text-[#3583b2] hover:underline flex items-center gap-1">
              <span>Xem tất cả {brickMachines.length} máy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brickMachines.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Section 2: Stone Machines */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-black text-[#3583b2] uppercase tracking-widest">
                Dòng Gia Công Đá Hoa Cương & Granite
              </div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-6 h-6 text-[#3583b2]" />
                Bản Vẽ Máy Ngành Đá
              </h2>
            </div>
            <Link href="/cad/may-nganh-da" className="text-xs font-bold text-[#3583b2] hover:underline flex items-center gap-1">
              <span>Xem tất cả {stoneMachines.length} máy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stoneMachines.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Section 3: Waterjet Spare Parts */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                Linh Kiện Thay Thế Cắt Tia Nước
              </div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-emerald-700" />
                Bản Vẽ Phụ Tùng Waterjet (41 Linh Kiện)
              </h2>
            </div>
            <Link href="/cad/phu-tung-waterjet" className="text-xs font-bold text-[#3583b2] hover:underline flex items-center gap-1">
              <span>Xem toàn bộ 41 phụ tùng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {waterjetParts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Section 4: Package Comparison Table */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              So Sánh 3 Gói Bản Vẽ Kỹ Thuật KTP
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Lựa chọn gói dữ liệu phù hợp với nhu cầu nghiên cứu, cải tiến hoặc gia công thực tế
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gói PDF BASIC */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase">Gói Khảo Sát</div>
              <div className="text-xl font-black text-slate-900">PDF BASIC</div>
              <div className="text-xs text-slate-500">Chiếm 35% giá gốc máy</div>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3583b2] shrink-0" />
                  <span>PDF Bản vẽ tổng thể & Kích thước phủ ngoài</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3583b2] shrink-0" />
                  <span>Sơ đồ bố trí cụm máy</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span>Không có file DWG/DXF 2D</span>
                </li>
              </ul>
            </div>

            {/* Gói CAD STANDARD */}
            <div className="bg-[#eef7fc] border border-[#b8ddf0] p-6 rounded-2xl space-y-4">
              <div className="text-xs font-bold text-[#2c6e98] uppercase">Gói Gia Công 2D</div>
              <div className="text-xl font-black text-[#2c6e98]">CAD STANDARD</div>
              <div className="text-xs text-slate-500">Chiếm 70% giá gốc máy</div>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3583b2] shrink-0" />
                  <span>Trọn bộ PDF 2D + DWG / DXF 2D</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3583b2] shrink-0" />
                  <span>Bản vẽ bộc lót cắt laser/plasma</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3583b2] shrink-0" />
                  <span>Kích thước gia công chi tiết</span>
                </li>
              </ul>
            </div>

            {/* Gói FULL PRO */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-xl border border-slate-800">
              <div className="text-xs font-black text-[#69afd7] uppercase tracking-widest">Trọn Bộ Hoàn Chỉnh</div>
              <div className="text-xl font-black">FULL ENGINEERING PRO</div>
              <div className="text-xs text-slate-300">Gói đầy đủ nhất cho nhà máy</div>
              <ul className="space-y-2 text-xs text-slate-200 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#69afd7] shrink-0" />
                  <span>PDF, DWG, DXF + Mô hình 3D STEP Assembly</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#69afd7] shrink-0" />
                  <span>BOM bảng kê vật tư linh kiện</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#69afd7] shrink-0" />
                  <span>Sơ đồ mạch điện & Hướng dẫn lắp ráp</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
