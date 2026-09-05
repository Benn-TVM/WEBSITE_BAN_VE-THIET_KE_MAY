import { Download, ShieldCheck } from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminHeaderProfile from '@/components/AdminHeaderProfile';

export default async function AdminDownloadsPage() {
  const downloads = await prisma.download.findMany({
    take: 50,
    orderBy: { downloadedAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { productName: true, cadCode: true } },
      file: { select: { fileName: true, fileType: true, fileSize: true } }
    }
  });

  const totalDownloads = await prisma.download.count();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Giám Sát Download Log Private File</h1>
          <p className="text-xs text-slate-500 font-medium">
            Theo dõi nhật ký tải file bản vẽ, kiểm soát IP, thiết bị và bảo hộ tài sản trí tuệ KTP
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AdminHeaderProfile />
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-mono font-bold">
            <Download className="w-4 h-4 text-[#3583b2]" />
            <span>Tổng Lượt Tải: <strong className="text-[#2c6e98]">{totalDownloads} lượt</strong></span>
          </div>
        </div>
      </div>

      {/* Downloads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Nhật Ký Tải Signed Link Bản Vẽ Kỹ Thuật (Gần Đây)</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Bảo mật Signed URL Active</span>
        </div>

        {downloads.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">
            Chưa có nhật ký tải file nào được ghi nhận.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-4">Thời Gian Tải</th>
                  <th className="p-4">Người Tải (Email)</th>
                  <th className="p-4">Sản Phẩm (Mã CAD)</th>
                  <th className="p-4">Tên File & Loại</th>
                  <th className="p-4">Địa Chỉ IP</th>
                  <th className="p-4 text-right">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {downloads.map(dl => (
                  <tr key={dl.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-500 text-[11px]">
                      {new Date(dl.downloadedAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-4 font-sans font-bold text-slate-900">
                      <div>{dl.user.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{dl.user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-[#3583b2] font-black">{dl.product.cadCode}</span>
                      <div className="text-[10px] text-slate-500 font-sans truncate max-w-xs">{dl.product.productName}</div>
                    </td>
                    <td className="p-4 font-sans font-bold text-slate-800">
                      <div>{dl.file.fileName}</div>
                      <span className="text-[10px] bg-[#eef7fc] border border-[#b8ddf0] text-[#2c6e98] px-1.5 py-0.5 rounded font-mono font-bold">
                        {dl.file.fileType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 text-[11px]">
                      {dl.ipAddress}
                    </td>
                    <td className="p-4 text-right">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-black font-sans">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
