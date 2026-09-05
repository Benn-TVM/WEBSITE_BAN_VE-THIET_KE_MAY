import { PhoneCall, Mail, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-slate-900">Liên Hệ Hỗ Trợ Kỹ Thuật KTP</h1>
        <p className="text-xs text-slate-600 font-medium">
          Đội ngũ kỹ sư KTP CAD sẵn sàng tư vấn về bản vẽ, thông số máy và giải đáp đơn hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <PhoneCall className="w-5 h-5 text-[#3583b2] shrink-0 mt-0.5" />
              <div>
                <div className="font-extrabold text-slate-900">Hotline / Zalo Kỹ Thuật:</div>
                <div className="font-mono text-[#2c6e98] text-base font-black">0901 234 567</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#3583b2] shrink-0 mt-0.5" />
              <div>
                <div className="font-extrabold text-slate-900">Email Tiếp Nhận Hồ Sơ:</div>
                <div className="text-slate-600 font-medium">support@ktpcad.vn</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#3583b2] shrink-0 mt-0.5" />
              <div>
                <div className="font-extrabold text-slate-900">Trụ Sở / Xưởng Sản Xuất KTP:</div>
                <div className="text-slate-600 leading-relaxed font-medium">
                  KTP CAD – Thư Viện Bản Vẽ Thiết Kế Máy & Phụ Tùng<br />
                  Số 123 Đường Cơ Khí, Khu Công Nghiệp, TP. Hồ Chí Minh
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900">Gửi Yêu Cầu Hỗ Trợ Kỹ Thuật</h2>
          <form className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Họ & Tên / Tên Xưởng (*)</label>
              <input
                type="text"
                placeholder="Nhập tên người liên hệ..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#69afd7] font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Số Điện Thoại Zalo (*)</label>
              <input
                type="tel"
                placeholder="Nhập số điện thoại..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#69afd7] font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Mã Máy / Phụ Tùng Cần Tư Vấn</label>
              <input
                type="text"
                placeholder="Ví dụ: MBG-023, Paser 4 Ruby Orifice..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#69afd7] font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Nội dung câu hỏi</label>
              <textarea
                rows={3}
                placeholder="Mô tả thắc mắc về kích thước, file 3D hoặc quy trình mua..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#69afd7] font-medium"
              ></textarea>
            </div>

            <button
              type="button"
              className="w-full bg-[#69afd7] hover:bg-[#5097c0] text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Gửi Yêu Cầu Cho Kỹ Sư KTP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
