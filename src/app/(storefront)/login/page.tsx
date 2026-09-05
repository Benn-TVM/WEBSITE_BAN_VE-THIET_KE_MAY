'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, AlertCircle } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Đăng nhập không thành công');
        setLoading(false);
        return;
      }

      // Successful login - dispatch auth_changed and navigate
      const targetUrl = ['ADMIN', 'TECHNICAL', 'SALES'].includes(data.user.role)
        ? (redirectPath.startsWith('/admin') ? redirectPath : '/admin')
        : (redirectPath && !redirectPath.startsWith('/account') && redirectPath !== '/login' ? redirectPath : '/');

      window.dispatchEvent(new Event('auth_changed'));
      router.replace(targetUrl);
      router.refresh();
    } catch {
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Card Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#69afd7] text-white font-black text-xl shadow-md">
          KTP
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-wide">
          Đăng Nhập KTP CAD
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Truy cập thư viện bản vẽ kỹ thuật máy & quản lý cấp quyền download file CAD
        </p>
      </div>

      {/* Login Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 border border-slate-200">
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhap-email@domain.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#69afd7] transition-colors font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#69afd7] transition-colors font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#69afd7] hover:bg-[#5097c0] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập vào Hệ Thống'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500">Chưa có tài khoản? </span>
          <Link href="/register" className="text-xs font-bold text-[#3583b2] hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 blueprint-grid-light">
      <Suspense fallback={<div className="text-xs text-slate-400">Đang tải trang đăng nhập...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
