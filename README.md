# ⚙️ SÀN THƯƠNG MẠI ĐIỆN TỬ BẢN VẼ THIẾT KẾ MÁY KTP (KTP CAD PLATFORM)

Nền tảng thương mại điện tử chuyên nghiệp cung cấp thư viện hồ sơ bản vẽ cơ khí, dây chuyền máy công nghiệp, máy ngành gạch, đá, máy cắt tia nước CNC và phụ tùng thay thế. Hệ thống tích hợp **trình xem trước 3D tương tác đa chế độ**, bảo vệ bản quyền watermark, quản lý giấy phép tải file (License), thanh toán VietQR và **nhật ký an ninh Audit Log thời gian thực**.

---

## 📑 MỤC LỤC
1. [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
2. [Cài đặt & Khởi chạy siêu tốc (1-Click)](#-cài-đặt--khởi-chạy-siêu-tốc-1-click)
3. [Tài khoản trải nghiệm mẫu](#-tài-khoản-trải-nghiệm-mẫu)
4. [Hướng dẫn trải nghiệm các tính năng chính](#-hướng-dẫn-trải-nghiệm-các-tính-năng-chính)
   - [A. Dành cho Khách hàng (Storefront)](#a-dành-cho-khách-hàng-storefront)
   - [B. Dành cho Quản trị viên (Admin Portal)](#b-dành-cho-quản-trị-viên-admin-portal)
5. [Cấu trúc thư mục dự án](#-cấu-trúc-thư-mục-dự-án)
6. [Lưu ý bảo mật & Bản quyền](#-lưu-ý-bảo-mật--bản-quyền)

---

## 🚀 CÔNG NGHỆ SỬ DỤNG

- **Framework:** [Next.js 16 (Turbopack, App Router)](https://nextjs.org/)
- **Giao diện:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Đồ họa 3D tương tác:** [Three.js](https://threejs.org/) (Hỗ trợ GLB, GLTF, OBJ, STL)
- **Biểu tượng:** [Lucide React](https://lucide.dev/)
- **Cơ sở dữ liệu:** [Prisma ORM](https://www.prisma.io/) với **SQLite** (Zero-configuration, chạy trực tiếp không cần cài đặt SQL Server ngoài)
- **Xác thực & Bảo mật:** JSON Web Token (JWT) lưu trữ HttpOnly Cookie an toàn, mã hóa mật khẩu BCrypt.

---

## ⚡ CÀI ĐẶT & KHỞI CHẠY SIÊU TỐC (1-CLICK)

### Cách 1: Chạy tự động bằng file `.bat` (Khuyên dùng cho Windows)
Dự án đã tích hợp sẵn file kịch bản **`CHAY_WEB.bat`** tại thư mục gốc. Bạn chỉ cần:
1. Tải hoặc clone mã nguồn về máy tính.
2. **Nhấp đúp chuột (Double click)** vào file **`CHAY_WEB.bat`**.
3. File sẽ tự động thực hiện từ A - Z:
   - Kiểm tra môi trường Node.js.
   - Tự động sinh file cấu hình `.env` nếu chưa có.
   - Cài đặt thư viện dependencies (`npm install`).
   - Khởi tạo Database SQLite và nạp sẵn **71 bản vẽ máy công nghiệp mẫu**.
   - Khởi chạy máy chủ và **tự động mở trình duyệt web** vào địa chỉ `http://localhost:3000`.

---

### Cách 2: Khởi chạy thủ công qua dòng lệnh (Terminal / PowerShell)

```bash
# 1. Cài đặt các gói thư viện
npm install

# 2. Tạo file môi trường .env (nếu chưa có)
cp .env.example .env

# 3. Đồng bộ Prisma Client & Nạp cơ sở dữ liệu mẫu
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Khởi chạy máy chủ phát triển
npm run dev
```
Truy cập trình duyệt: **`http://localhost:3000`**

---

## 🔑 TÀI KHOẢN TRẢI NGHIỆM MẪU

Hệ thống đã nạp sẵn các tài khoản phân quyền mẫu để bạn trải nghiệm đầy đủ:

| Vai Trò | Email Đăng Nhập | Mật Khẩu Mặc Định | Quyền Hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@ktp.vn` | `123456` | Toàn quyền quản trị, duyệt đơn, xem Audit Log, sửa sản phẩm |
| **Kỹ thuật viên (Technical)** | `tech@ktp.vn` | `123456` | Quản lý file CAD, phiên bản tệp, upload mô hình 3D |
| **Kinh doanh (Sales)** | `sales@ktp.vn` | `123456` | Quản lý đơn hàng, chăm sóc khách hàng |
| **Khách hàng mẫu (User)** | `namphat@gmail.com` | `123456` | Mua bản vẽ, tải file CAD, quản lý License sở hữu |

> 💡 *Bạn cũng có thể tự tạo tài khoản khách hàng mới bất kỳ lúc nào tại trang **`/register`**.*

---

## 🎯 HƯỚNG DẪN TRẢI NGHIỆM CÁC TÍNH NĂNG CHÍNH

### A. DÀNH CHO KHÁCH HÀNG (STOREFRONT)

1. **Khám phá Thư viện Bản vẽ (`/cad`):**
   - Danh mục phân loại: Máy ngành gạch, Máy ngành đá, Máy cắt tia nước Waterjet, Phụ tùng máy, v.v.
   - Tìm kiếm bản vẽ theo tên máy, mã CAD (`CAD-MCT025`, `CAD-VENUS024P`,...).
   - Lọc theo quyền sở hữu bản vẽ (OWNED, LICENSED, AUTHORIZED).

2. **Trình xem trước đa chế độ (Interactive 3D Preview Player):**
   - 🧊 **Chế độ 3D:** Xoay 360 độ, phóng to thu nhỏ, lật các góc máy cơ khí, nút **Bật/Tắt lưới kỹ thuật** ở góc dưới.
   - 📷 **Chế độ Ảnh Thực Tế:** Xem ảnh chụp máy vận hành thực tế tại nhà xưởng.
   - 📐 **Chế độ Bản Vẽ 2D:** Sơ đồ bố trí mặt bằng máy, kích thước kỹ thuật.
   - 📑 **Chế độ Hồ Sơ Kỹ Thuật:** Tài liệu phụ lục đính kèm.
   - *Tính năng bảo vệ bản quyền: Watermark lưới chéo hiển thị chống sao chép trái phép.*

3. **Chọn Gói Bản Quyền Linh Hoạt (Product Package Selector):**
   - **Gói 1 - PDF Xem Trước (35% giá):** Bản vẽ PDF kích thước tổng quan, sơ đồ nền móng.
   - **Gói 2 - CAD Tiêu Chuẩn (70% giá):** File CAD 2D/3D (DWG, DXF, STEP) sẵn sàng gia công.
   - **Gói 3 - FULL PRO (100% giá):** Toàn bộ file gốc 3D Assembly, Part chi tiết, BOM vật tư và hướng dẫn lắp ráp.

4. **Đặt Hàng & Thanh Toán VietQR (`/cart` -> `/checkout`):**
   - Thêm vào giỏ hàng nhiều bản vẽ cùng lúc.
   - Điền thông tin đặt hàng -> Hệ thống tự động tạo mã đơn (ví dụ: `ORD-20260905-8941`) và hiển thị mã chuyển khoản ngân hàng chuẩn VietQR.

5. **Quản Lý Bản Quyền & Hồ Sơ Tài Khoản (`/account`):**
   - **Thư viện License đã cấp quyền tải:**
     - Xem danh sách các file bản vẽ đã mua bản quyền.
     - Đồng hồ đếm ngược thời hạn License (30 ngày).
     - Giới hạn số lượt tải (tối đa 5 lượt tải/license theo quy định bảo mật).
     - Tải tệp bản vẽ CAD an toàn qua luồng xác thực bản quyền (`/api/download/[fileId]`).
   - **Lịch sử đơn hàng:** Theo dõi tình trạng duyệt đơn hàng.
   - **Đổi mật khẩu tài khoản:** Nút **Đổi Mật Khẩu** trực tiếp trong hồ sơ để tự cập nhật mật khẩu mới.

---

### B. DÀNH CHO QUẢN TRỊ VIÊN (ADMIN PORTAL - `/admin`)

*Đăng nhập bằng tài khoản `admin@ktp.vn` / mật khẩu `123456` để vào thẳng Trang Quản Trị.*

1. **Dashboard Tổng Quan (`/admin`):**
   - Thống kê doanh thu thực tế, số lượng đơn hàng, số bản vẽ đang phát hành và tổng lượt tải file CAD.

2. **Quản Lý Sản Phẩm Bản Vẽ (`/admin/products`):**
   - Bảng danh sách 71 sản phẩm có đầy đủ mã CAD, phân loại máy, giá niêm yết và trạng thái bản quyền.
   - **Khu vực Chỉnh sửa Media thu gọn:** Thiết kế dạng lưới 4 cột trực quan, nhấp tải trực tiếp ảnh thực tế, mô hình 3D (.glb), ảnh 2D và ảnh bản vẽ từ máy tính mà không cần nhập URL rườm rà.

3. **Xác Nhận Thanh Toán & Kích Hoạt License (`/admin/orders` và `/admin/payments`):**
   - Khi khách hàng chuyển khoản, Admin bấm **Xác nhận thanh toán**.
   - Hệ thống tự động:
     - Chuyển trạng thái đơn hàng sang `PAID`.
     - Tự động sinh `License` bản quyền cho khách hàng (thời hạn 30 ngày, 5 lượt tải).
     - Ghi nhận vào nhật ký an ninh hệ thống.

4. **Quản Lý Người Dùng & Phân Quyền (`/admin/users`):**
   - Quản lý danh sách thành viên, cấp vai trò (ADMIN, TECHNICAL, SALES, USER).
   - Khóa (Disable) hoặc Mở khóa tài khoản ngay tức thì.

5. **Hệ Thống Audit Log & Nhật Ký Hoạt Động (`/admin/audit-logs`):**
   - Toàn bộ thao tác được dịch sang **Tiếng Việt dễ hiểu** kèm biểu tượng trực quan:
     - 🔴 **Đăng nhập thất bại:** Cảnh báo sai mật khẩu, đếm số lần sai trong 24 giờ.
     - 🛒 **Đặt mua bản vẽ:** Hiện rõ mã đơn, tên từng bản vẽ, gói cước và số tiền.
     - ✅ **Duyệt đơn & Cấp License:** Ghi nhận người duyệt và khách được cấp quyền.
     - 🔒 **Đổi mật khẩu:** Ghi nhận thời điểm tài khoản đổi mật khẩu.
     - ⬇️ **Tải file CAD:** Ghi nhận tên file, lượt tải thứ mấy.
   - **Bộ lọc thông minh:** Lọc nhanh sự kiện Đăng nhập sai, Đơn hàng, Đổi mật khẩu,...
   - **Xem Dòng Thời Gian Hoạt Động (User Timeline):** Nhấp vào bất kỳ tên tài khoản nào để mở trục thời gian hiển thị xuyên suốt mọi hành vi của tài khoản đó từ khi đăng ký đến nay.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
WEBSITE_BAN_VE-THIET_KE_MAY/
├── CHAY_WEB.bat                  # File 1-click tự động cài đặt & chạy web (Windows)
├── prisma/
│   ├── schema.prisma             # Định nghĩa cấu trúc Database (Users, Roles, Products, Orders, Licenses, AuditLog)
│   ├── dev.db                    # Database SQLite tích hợp sẵn
│   └── seed.js                   # Dữ liệu nạp mẫu 71 bản vẽ & người dùng
├── public/
│   ├── images/products/          # Hình ảnh bản vẽ máy công nghiệp
│   ├── models/                   # Tệp mô hình 3D (.glb, .gltf)
│   └── uploads/                  # Tệp người dùng / admin tải lên
├── src/
│   ├── app/
│   │   ├── (admin)/admin/        # Toàn bộ phân hệ Quản trị Admin
│   │   ├── (storefront)/         # Toàn bộ phân hệ Khách hàng (Trang chủ, Chi tiết CAD, Giỏ hàng, Tài khoản)
│   │   └── api/                  # Các REST APIs xác thực, đơn hàng, tải file, upload
│   ├── components/               # Các UI components tái sử dụng (3D Viewer, Player, Media, Navbar, Modals)
│   ├── lib/                      # Các tiện ích (Prisma Client, JWT Auth, xử lý giỏ hàng)
│   └── middleware.ts             # Bộ lọc bảo vệ đường dẫn Admin / Phân quyền
├── .env.example                  # File cấu hình môi trường mẫu
└── package.json                  # Cấu hình dự án & thư viện
```

---

## 🛡️ LƯU Ý BẢO MẬT & BẢN QUYỀN

1. File `.env` chứa khóa mã hóa `JWT_SECRET` đã được cấu hình trong `.gitignore` để tránh rò rỉ dữ liệu khi làm việc nhóm.
2. File CAD thật được bảo vệ trong thư mục nội bộ; khách hàng chỉ có thể tải về khi đơn hàng đã được xác nhận thanh toán thành công và license còn lượt tải.
3. Khi đưa lên máy chủ công khai (Production Server), bạn có thể đổi `provider = "postgresql"` trong `schema.prisma` sang cơ sở dữ liệu PostgreSQL mà không cần chỉnh sửa lại logic code.

---

*Chúc bạn có trải nghiệm tuyệt vời với nền tảng Thư viện Bản vẽ KTP CAD!*
