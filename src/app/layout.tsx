import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KTP CAD – Thư Viện Bản Vẽ Thiết Kế Máy & Phụ Tùng',
  description: 'Nền tảng thương mại hóa bản vẽ thiết kế máy hoàn chỉnh & phụ tùng CAD chính thức của KTP CAD. File DWG, DXF, PDF, 3D STEP chuẩn xác gia công.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-slate-900 min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
