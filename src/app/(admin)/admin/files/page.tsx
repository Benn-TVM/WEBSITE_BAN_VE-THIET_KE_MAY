import { FolderTree, Lock } from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminHeaderProfile from '@/components/AdminHeaderProfile';

export default async function AdminFilesPage() {
  const files = await prisma.file.findMany({
    include: {
      product: { select: { productName: true, cadCode: true } },
      package: { select: { packageName: true } },
      version: { select: { version: true } }
    },
    orderBy: { id: 'desc' },
    take: 50
  });

  const totalFiles = await prisma.file.count();
  const totalFileSize = await prisma.file.aggregate({ _sum: { fileSize: true } });
  const totalMB = Math.round((totalFileSize._sum.fileSize || 0) / (1024 * 1024));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản Lý File CAD Private & Thư Mục</h1>
          <p className="text-xs text-slate-500 font-medium">
            Giám sát dung lượng lưu trữ private, liên kết file với cấu trúc 9 thư mục kỹ thuật
          </p>
        </div>
        <AdminHeaderProfile />
      </div>

      {/* Metrics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-bold uppercase">Tổng Số File Private</div>
          <div className="text-2xl font-black text-[#2c6e98]">{totalFiles} file</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-bold uppercase">Tổng Dung Lượng Đã Lưu</div>
          <div className="text-2xl font-black text-[#2c6e98]">{totalMB} MB</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-bold uppercase">Cấu Trúc Thư Mục</div>
          <div className="text-2xl font-black text-emerald-600">9 Folder Standard</div>
        </div>
      </div>

      {/* Files List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-[#3583b2]" />
            <span>Danh Sách File Kỹ Thuật Bảo Mật</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Chế độ storage: LOCAL PRIVATE (MinIO/S3 Ready)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Tên File</th>
                <th className="p-4">Thuộc Sản Phẩm (Mã CAD)</th>
                <th className="p-4">Gói Giá</th>
                <th className="p-4">Thư Mục Nguồn</th>
                <th className="p-4">Loại File</th>
                <th className="p-4 text-right">Kích Thước</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono">
              {files.map(f => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{f.fileName}</span>
                  </td>

                  <td className="p-4">
                    <span className="text-[#3583b2] font-black">{f.product.cadCode}</span>
                    <div className="text-[10px] text-slate-500 font-sans truncate max-w-xs">{f.product.productName}</div>
                  </td>

                  <td className="p-4 text-slate-800">
                    {f.package ? f.package.packageName : 'FULL PRO'}
                  </td>

                  <td className="p-4 text-[#2c6e98] font-black text-[11px]">
                    {f.folderCategory}
                  </td>

                  <td className="p-4">
                    <span className="bg-[#eef7fc] border border-[#b8ddf0] px-2 py-0.5 rounded text-[10px] font-black text-[#2c6e98]">
                      {f.fileType}
                    </span>
                  </td>

                  <td className="p-4 text-right text-slate-500 font-mono">
                    {(f.fileSize / 1024).toFixed(0)} KB
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
