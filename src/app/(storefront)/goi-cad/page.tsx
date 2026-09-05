export default function CadPackagesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-slate-900">Các Gói Bản Vẽ Kỹ Thuật CAD</h1>
        <p className="text-xs text-slate-600 font-medium max-w-xl mx-auto">
          Phân tích chi tiết quyền hạn dữ liệu đính kèm trong từng gói bản vẽ thiết kế máy & phụ tùng KTP.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="text-xs font-mono font-black text-slate-500 uppercase">GÓI 01</div>
          <h2 className="text-xl font-black text-slate-900">Gói PDF Basic</h2>
          <div className="text-xs text-[#2c6e98] font-black bg-[#eef7fc] border border-[#b8ddf0] px-2.5 py-1 rounded w-max">
            35% Giá Niêm Yết
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Dành cho khách hàng chỉ có nhu cầu khảo sát tổng quan, nghiên cứu kết cấu ngoại quan và sơ đồ bố trí cụm máy.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="text-xs font-mono font-black text-[#3583b2] uppercase">GÓI 02</div>
          <h2 className="text-xl font-black text-slate-900">Gói CAD Standard</h2>
          <div className="text-xs text-[#2c6e98] font-black bg-[#eef7fc] border border-[#b8ddf0] px-2.5 py-1 rounded w-max">
            70% Giá Niêm Yết
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Dành cho xưởng cơ khí cần file DWG/DXF 2D bộc lót để đưa lên máy cắt Laser/Plasma CNC và gia công cơ bản.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-[#69afd7] space-y-4 shadow-md relative overflow-hidden">
          <div className="bg-[#69afd7] text-white text-[10px] font-black px-3 py-1 uppercase tracking-wider text-center">
            KHUYÊN DÙNG CHO NHÀ MÁY
          </div>
          <div className="text-xs font-mono font-black text-[#3583b2] uppercase">GÓI 03</div>
          <h2 className="text-xl font-black text-slate-900">Full Engineering Pro</h2>
          <div className="text-xs text-white font-black bg-[#69afd7] px-2.5 py-1 rounded w-max">
            100% Giá Trọn Bộ
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Trọn bộ đầy đủ nhất cho nhà máy: PDF, DWG, DXF, mô hình 3D STEP Assembly, BOM bảng kê vật tư & sơ đồ điện.
          </p>
        </div>
      </div>
    </div>
  );
}
