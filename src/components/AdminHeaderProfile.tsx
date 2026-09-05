'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, ArrowLeft, LogOut, Shield } from 'lucide-react';

interface AdminHeaderProfileProps {
  adminName?: string;
  adminRole?: string;
}

export default function AdminHeaderProfile({ adminName: initialName, adminRole: initialRole }: AdminHeaderProfileProps) {
  const router = useRouter();
  const [adminName, setAdminName] = useState<string>(initialName || '');
  const [adminRole, setAdminRole] = useState<string>(initialRole || '');
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Live ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timePart = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentDateTime(`${datePart} • ${timePart}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch admin user info if not passed via props
  useEffect(() => {
    if (!adminName) {
      fetch('/api/auth/me')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.authenticated && data.user) {
            setAdminName(data.user.name);
            setAdminRole(data.user.role);
          }
        })
        .catch(() => {});
    }
  }, [adminName]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const displayName = adminName || 'Admin KTP';
  const displayRole = adminRole || 'ADMIN';
  const initialChar = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-3 bg-white hover:bg-slate-50/80 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs transition-colors text-left"
          title="Bấm để xem tùy chọn tài khoản Admin"
        >
          {/* Avatar Badge */}
          <div className="w-8 h-8 rounded-lg bg-[#eef7fc] border border-[#b8ddf0] text-[#3583b2] flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
            {initialChar}
          </div>

          {/* Admin Name & Date/Time */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-slate-900 leading-tight">
                {displayName}
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 leading-none">
                {displayRole}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono font-medium mt-0.5 min-h-[14px]">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{currentDateTime || 'Đang cập nhật...'}</span>
            </div>
          </div>
        </button>

        {/* Dropdown Menu on Avatar Click */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-2.5 border-b border-slate-100 mb-1">
              <div className="font-extrabold text-xs text-slate-900">{displayName}</div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-purple-600" />
                <span>Quyền: <strong>{displayRole}</strong></span>
              </div>
            </div>

            <Link
              href="/"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#eef7fc] hover:text-[#2c6e98] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về Cửa hàng Public</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors mt-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất Admin</span>
            </button>
          </div>
        )}
    </div>
  );
}
