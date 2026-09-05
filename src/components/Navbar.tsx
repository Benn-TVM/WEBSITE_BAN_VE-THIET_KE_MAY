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
      const items = JSON.parse(localStorage.getItem('ktp_cart') || '[]');
      setCartCount(items.length);
    };

    updateCart();
    window.addEventListener('cart_updated', updateCart);

    return () => {
      window.removeEventListener('auth_changed', handleAuthChanged);
      window.removeEventListener('cart_updated', updateCart);
    };
  }, [checkAuth]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleToggleDropdown = () => {
    if (!dropdownOpen) {
      checkAuth();
    }
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
        <div className="flex items-center gap-3">
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

          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>

          {/* User Icon Button Only (No text inside button as requested) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleToggleDropdown}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-[#eef7fc] border border-slate-200 hover:border-[#b8ddf0] text-slate-800 hover:text-[#3583b2] transition-all flex items-center justify-center shadow-sm"
              title={user ? `Tài khoản: ${user.name}` : "Tài khoản / Đăng nhập"}
            >
              <User className="w-5 h-5 text-[#3583b2]" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {user ? (
                  <>
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
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-2 space-y-1 text-xs font-bold">
                    <Link
                      href="/login"
                      onClick={() => setDropdownOpen(false)}
                      className="block w-full text-center bg-[#69afd7] hover:bg-[#5097c0] text-white py-2 rounded-xl uppercase tracking-wider transition-all shadow-sm"
                    >
                      Đăng Nhập
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setDropdownOpen(false)}
                      className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-xl transition-all"
                    >
                      Đăng Ký Tài Khoản
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
