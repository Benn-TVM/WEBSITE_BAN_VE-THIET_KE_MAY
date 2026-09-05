'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Cpu, Search, ShoppingCart, User, Shield, Layers, HelpCircle, LogOut } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkAuth = useCallback(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, []);

  // Check Auth state on mount and route changes
  useEffect(() => {
    checkAuth();
  }, [pathname, checkAuth]);

  // Listen for auth state changes & cart changes
  useEffect(() => {
    const handleAuthChanged = () => checkAuth();
    window.addEventListener('auth_changed', handleAuthChanged);

    const updateCart = () => {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('ktp_cart') : null;
        const items = raw ? JSON.parse(raw) : [];
        setCartCount(Array.isArray(items) ? items.length : 0);
      } catch {
        setCartCount(0);
      }
    };

    updateCart();
    window.addEventListener('cart_updated', updateCart);

    return () => {
      window.removeEventListener('auth_changed', handleAuthChanged);
      window.removeEventListener('cart_updated', updateCart);
    };
  }, [checkAuth]);

  // Close dropdown on click outside (support both mouse & touch)
  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setDropdownOpen(false);
      window.dispatchEvent(new Event('auth_changed'));
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDropdown = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDropdownOpen(prev => !prev);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo - #69afd7 Accent */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#69afd7] flex items-center justify-center text-white font-black shadow-md group-hover:bg-[#5097c0] transition-colors">
            KTP
          </div>
          <div>
            <div className="font-black text-lg tracking-wider text-slate-900 uppercase">
              KTP CAD
            </div>
            <div className="text-[10px] text-[#3583b2] font-bold tracking-wider">
              Thư Viện Bản Vẽ Thiết Kế Máy & Phụ Tùng
            </div>
          </div>
        </Link>

        {/* Primary Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-800">
          <Link href="/cad/may-nganh-gach" className="hover:text-[#3583b2] transition-colors flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#3583b2]" />
            Máy ngành gạch
          </Link>
          <Link href="/cad/may-nganh-da" className="hover:text-[#3583b2] transition-colors flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-700" />
            Máy ngành đá
          </Link>
          <Link href="/cad/phu-tung-waterjet" className="hover:text-[#3583b2] transition-colors flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            Phụ tùng Waterjet
          </Link>
          <Link href="/goi-cad" className="hover:text-[#3583b2] transition-colors">
            Gói CAD
          </Link>
          <Link href="/huong-dan-mua" className="hover:text-[#3583b2] transition-colors flex items-center gap-1">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            Hướng dẫn mua
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/cad" className="p-2 text-slate-700 hover:text-[#3583b2] rounded-lg hover:bg-slate-100 transition-colors" title="Tìm kiếm bản vẽ">
            <Search className="w-5 h-5" />
          </Link>

          <Link href="/cart" className="relative p-2 text-slate-700 hover:text-[#3583b2] rounded-lg hover:bg-slate-100 transition-colors" title="Giỏ hàng">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#69afd7] text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="h-4 w-[1px] bg-slate-200"></div>

          {/* Authentication Section */}
          {!user ? (
            <div className="flex items-center gap-2">
              {/* Desktop Direct Login / Register Buttons */}
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#69afd7] hover:bg-[#5097c0] text-white text-xs font-black transition-all shadow-sm active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </Link>
              <Link
                href="/register"
                className="hidden md:inline-flex items-center px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95"
              >
                <span>Đăng Ký</span>
              </Link>

              {/* Mobile Avatar Button for Quick Login / Register */}
              <div className="relative sm:hidden" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={handleToggleDropdown}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-[#eef7fc] border border-slate-200 text-slate-800 flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
                  title="Tài khoản / Đăng nhập"
                  aria-label="Tài khoản"
                >
                  <User className="w-5 h-5 text-[#3583b2]" />
                </button>

                {dropdownOpen && (
                  <div
                    onClick={e => e.stopPropagation()}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="p-2 space-y-1 text-xs font-bold">
                      <Link
                        href="/login"
                        onClick={() => setDropdownOpen(false)}
                        className="block w-full text-center bg-[#69afd7] hover:bg-[#5097c0] text-white py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-sm font-black"
                      >
                        Đăng Nhập
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setDropdownOpen(false)}
                        className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl transition-all font-bold"
                      >
                        Đăng Ký Tài Khoản
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Logged in User Profile Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={handleToggleDropdown}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-[#eef7fc] border border-slate-200 hover:border-[#b8ddf0] text-slate-800 hover:text-[#3583b2] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                title={`Tài khoản: ${user.name}`}
              >
                <div className="w-7 h-7 rounded-lg bg-[#69afd7] text-white font-black text-xs flex items-center justify-center shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:block text-xs font-bold max-w-[120px] truncate">{user.name}</span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  onClick={e => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                    <div className="font-extrabold text-xs text-slate-900 truncate">{user.name}</div>
                    <div className="text-[10px] text-slate-500 truncate font-mono">{user.email}</div>
                    <span className="inline-block mt-1 text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#eef7fc] text-[#2c6e98] border border-[#b8ddf0]">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1 text-xs font-bold text-slate-700">
                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 hover:text-[#3583b2] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#3583b2]" />
                      <span>Hồ sơ tài khoản</span>
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 hover:text-[#3583b2] transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4 text-[#3583b2]" />
                      <span>Đơn hàng của tôi</span>
                    </Link>
                    <Link
                      href="/account/purchased-cad"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 hover:text-[#3583b2] transition-colors"
                    >
                      <Layers className="w-4 h-4 text-[#3583b2]" />
                      <span>Bản vẽ đã mua</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

