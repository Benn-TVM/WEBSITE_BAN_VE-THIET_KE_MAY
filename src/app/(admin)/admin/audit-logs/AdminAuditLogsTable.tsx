'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  ShieldAlert,
  Key,
  Lock,
  ShoppingCart,
  CheckCircle,
  Download,
  Box,
  Plus,
  Trash2,
  User,
  UserX,
  Clock,
  Eye,
  X,
  UserCheck,
  Filter,
  FileText,
  Activity,
  ChevronRight
} from 'lucide-react';

interface AuditLogUser {
  id?: number;
  name: string;
  email: string;
  role?: { name: string } | null;
}

interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: { name: string };
}

export interface AuditLogItem {
  id: number;
  action: string;
  module: string;
  targetId?: number | null;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress: string;
  createdAt: string | Date;
  user?: AuditLogUser | null;
}

interface AuditParsedPayload {
  attemptCount?: number;
  reason?: string;
  email?: string;
  name?: string;
  role?: string;
  orderCode?: string;
  total?: number;
  customerName?: string;
  customerEmail?: string;
  products?: string[];
  productName?: string;
  cadCode?: string;
  fileName?: string;
  turn?: string;
  status?: string;
  items?: Array<{
    productName: string;
    packageName: string;
    price?: number;
    quantity?: number;
  }>;
  [key: string]: unknown;
}

interface ParsedDetails {
  label: string;
  badgeClass: string;
  icon: React.ReactNode;
  summary: string;
  isAlert?: boolean;
  parsedJson?: AuditParsedPayload | null;
}

function parseLogInfo(log: AuditLogItem): ParsedDetails {
  let parsed: AuditParsedPayload | null = null;
  if (log.newValue) {
    try {
      parsed = JSON.parse(log.newValue) as AuditParsedPayload;
    } catch {
      parsed = null;
    }
  }

  const action = log.action.toUpperCase();

  // 1. LOGIN_FAILED (Đăng nhập thất bại)
  if (action === 'LOGIN_FAILED') {
    const attempt = parsed?.attemptCount || 1;
    const reason = parsed?.reason || 'Sai mật khẩu hoặc thông tin đăng nhập';
    const email = parsed?.email || log.oldValue || log.user?.email || 'N/A';
    return {
      label: `Đăng nhập thất bại (Lần ${attempt})`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold',
      icon: <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />,
      summary: `Email thử: ${email} • Lý do: ${reason} (Lần thứ ${attempt} trong 24h)`,
      isAlert: true,
      parsedJson: parsed
    };
  }

  // 2. LOGIN_BLOCKED (Bị chặn đăng nhập)
  if (action === 'LOGIN_BLOCKED') {
    return {
      label: 'Bị chặn đăng nhập',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      icon: <UserX className="w-4 h-4 text-amber-600 shrink-0" />,
      summary: `Tài khoản ${parsed?.email || log.oldValue || ''} đang bị KHÓA (DISABLED)`,
      isAlert: true,
      parsedJson: parsed
    };
  }

  // 3. LOGIN_SUCCESS / LOGIN
  if (action === 'LOGIN_SUCCESS' || action === 'LOGIN') {
    const roleName = parsed?.role || log.user?.role?.name || 'USER';
    return {
      label: 'Đăng nhập thành công',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
      icon: <Key className="w-4 h-4 text-emerald-600 shrink-0" />,
      summary: `Đăng nhập quyền: ${roleName} • ${parsed?.name || log.user?.name || ''} (${parsed?.email || log.user?.email || ''})`,
      parsedJson: parsed
    };
  }

  // 4. PASSWORD_CHANGED (Đổi mật khẩu)
  if (action === 'PASSWORD_CHANGED') {
    return {
      label: 'Đổi mật khẩu',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold',
      icon: <Lock className="w-4 h-4 text-indigo-600 shrink-0" />,
      summary: `Tài khoản đã cập nhật mật khẩu mới an toàn vào hệ thống`,
      parsedJson: parsed
    };
  }

  // 5. PASSWORD_CHANGE_FAILED
  if (action === 'PASSWORD_CHANGE_FAILED') {
    return {
      label: 'Đổi mật khẩu thất bại',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      icon: <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />,
      summary: `Nhập sai mật khẩu cũ hiện tại khi cố gắng đổi mật khẩu`,
      isAlert: true,
      parsedJson: parsed
    };
  }

  // 6. ORDER_CREATED (Đặt mua bản vẽ)
  if (action === 'ORDER_CREATED') {
    const orderCode = parsed?.orderCode || `#${log.targetId}`;
    const total = parsed?.total ? parsed.total.toLocaleString('vi-VN') + ' đ' : '';
    let itemNames = '';
    if (parsed?.items && Array.isArray(parsed.items)) {
      itemNames = parsed.items.map((i) => `${i.productName} (${i.packageName})`).join(', ');
    }
    return {
      label: 'Đặt mua bản vẽ',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 font-bold',
      icon: <ShoppingCart className="w-4 h-4 text-sky-600 shrink-0" />,
      summary: `Đơn ${orderCode} • Mua: ${itemNames || 'Bản vẽ CAD'} • Tổng tiền: ${total}`,
      parsedJson: parsed
    };
  }

  // 7. CONFIRM_PAYMENT (Duyệt đơn & Cấp License)
  if (action === 'CONFIRM_PAYMENT') {
    const orderCode = parsed?.orderCode || `#${log.targetId}`;
    const total = parsed?.total ? parsed.total.toLocaleString('vi-VN') + ' đ' : '';
    const customer = parsed?.customerName || parsed?.customerEmail || '';
    const products = parsed?.products ? parsed.products.join(', ') : '';
    return {
      label: 'Duyệt đơn & Cấp License',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
      icon: <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />,
      summary: `Duyệt đơn ${orderCode} (${total}) • Cấp quyền cho: ${customer} ${products ? `[${products}]` : ''}`,
      parsedJson: parsed
    };
  }

  // 8. DOWNLOAD_CAD (Tải file CAD)
  if (action === 'DOWNLOAD_CAD') {
    const fileName = parsed?.fileName || 'File CAD';
    const prodName = parsed?.productName || parsed?.cadCode || '';
    const turn = parsed?.turn ? `(Lượt ${parsed.turn})` : '';
    return {
      label: 'Tải file bản vẽ',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
      icon: <Download className="w-4 h-4 text-purple-600 shrink-0" />,
      summary: `Tải: ${fileName} • Thuộc bản vẽ: ${prodName} ${turn}`,
      parsedJson: parsed
    };
  }

  // 9. DOWNLOAD_BLOCKED (Chặn tải)
  if (action === 'DOWNLOAD_BLOCKED') {
    return {
      label: 'Chặn tải bản vẽ',
      badgeClass: 'bg-red-100 text-red-800 border-red-300 font-bold',
      icon: <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />,
      summary: `Bị chặn tải file: ${parsed?.fileName || ''} • Lý do: ${parsed?.reason || 'Chưa mua bản quyền'}`,
      isAlert: true,
      parsedJson: parsed
    };
  }

  // 10. REGISTER (Đăng ký)
  if (action === 'REGISTER') {
    return {
      label: 'Đăng ký tài khoản',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 font-bold',
      icon: <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />,
      summary: `Đăng ký mới thành công: ${parsed?.name || log.user?.name} (${parsed?.email || log.user?.email})`,
      parsedJson: parsed
    };
  }

  // 11. UPDATE_PRODUCT
  if (action === 'UPDATE_PRODUCT') {
    const title = parsed?.productName || parsed?.cadCode || `Sản phẩm #${log.targetId}`;
    const status = parsed?.status ? `Trạng thái: ${parsed.status}` : '';
    return {
      label: 'Cập nhật sản phẩm',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-200 font-medium',
      icon: <Box className="w-4 h-4 text-slate-600 shrink-0" />,
      summary: `Cập nhật thông tin: ${title} ${status ? `• ${status}` : ''}`,
      parsedJson: parsed
    };
  }

  // 12. CREATE_PRODUCT
  if (action === 'CREATE_PRODUCT') {
    return {
      label: 'Tạo sản phẩm mới',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-300 font-bold',
      icon: <Plus className="w-4 h-4 text-teal-600 shrink-0" />,
      summary: `Thêm bản vẽ mới: ${parsed?.productName || parsed?.cadCode || ''}`,
      parsedJson: parsed
    };
  }

  // 13. DELETE_PRODUCT
  if (action === 'DELETE_PRODUCT') {
    return {
      label: 'Xóa sản phẩm',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      icon: <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />,
      summary: `Đã xóa sản phẩm #${log.targetId} khỏi hệ thống`,
      isAlert: true,
      parsedJson: parsed
    };
  }

  // Fallback
  return {
    label: log.action,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <Activity className="w-4 h-4 text-slate-500 shrink-0" />,
    summary: log.newValue || log.oldValue || 'Thao tác hệ thống',
    parsedJson: parsed
  };
}

export default function AdminAuditLogsTable({
  initialLogs,
  users = []
}: {
  initialLogs: AuditLogItem[];
  users?: UserSummary[];
}) {
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'LOGIN_FAILED' | 'ORDERS' | 'AUTH' | 'PASSWORD' | 'DOWNLOAD' | 'CATALOG'>('ALL');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('ALL');

  // Modals state
  const [inspectLog, setInspectLog] = useState<AuditLogItem | null>(null);
  const [timelineUser, setTimelineUser] = useState<{ email: string; name?: string } | null>(null);

  // Quick statistics counts
  const counts = useMemo(() => {
    let loginFailed = 0;
    let orders = 0;
    let password = 0;
    let download = 0;
    let auth = 0;

    logs.forEach(l => {
      const act = l.action.toUpperCase();
      if (act === 'LOGIN_FAILED' || act === 'LOGIN_BLOCKED') loginFailed++;
      if (act === 'ORDER_CREATED' || act === 'CONFIRM_PAYMENT') orders++;
      if (act.includes('PASSWORD')) password++;
      if (act.includes('DOWNLOAD')) download++;
      if (act.includes('LOGIN') || act === 'REGISTER') auth++;
    });

    return { loginFailed, orders, password, download, auth };
  }, [logs]);

  // Filtered logs
  const filtered = useMemo(() => {
    return logs.filter(log => {
      const parsed = parseLogInfo(log);
      const searchLower = searchTerm.toLowerCase();

      // Search match
      const userMatch = log.user
        ? log.user.name.toLowerCase().includes(searchLower) || log.user.email.toLowerCase().includes(searchLower)
        : false;
      const actionMatch = log.action.toLowerCase().includes(searchLower) || parsed.label.toLowerCase().includes(searchLower);
      const summaryMatch = parsed.summary.toLowerCase().includes(searchLower);
      const ipMatch = log.ipAddress.includes(searchLower);
      const oldValMatch = log.oldValue?.toLowerCase().includes(searchLower) || false;

      const matchesSearch = !searchTerm || userMatch || actionMatch || summaryMatch || ipMatch || oldValMatch;

      // Filter by type
      let matchesType = true;
      const act = log.action.toUpperCase();
      if (filterType === 'LOGIN_FAILED') {
        matchesType = act === 'LOGIN_FAILED' || act === 'LOGIN_BLOCKED' || act === 'DOWNLOAD_BLOCKED';
      } else if (filterType === 'ORDERS') {
        matchesType = act === 'ORDER_CREATED' || act === 'CONFIRM_PAYMENT' || log.module === 'ORDERS';
      } else if (filterType === 'AUTH') {
        matchesType = act.includes('LOGIN') || act === 'REGISTER' || act.includes('PASSWORD') || log.module === 'AUTH';
      } else if (filterType === 'PASSWORD') {
        matchesType = act.includes('PASSWORD');
      } else if (filterType === 'DOWNLOAD') {
        matchesType = act.includes('DOWNLOAD');
      } else if (filterType === 'CATALOG') {
        matchesType = log.module === 'CATALOG' || act.includes('PRODUCT');
      }

      // Filter by user email
      let matchesUser = true;
      if (selectedUserEmail !== 'ALL') {
        const logEmail = log.user?.email || log.oldValue || parsed.parsedJson?.email || '';
        matchesUser = logEmail.toLowerCase() === selectedUserEmail.toLowerCase();
      }

      return matchesSearch && matchesType && matchesUser;
    });
  }, [logs, searchTerm, filterType, selectedUserEmail]);

  // Timeline logs when viewing specific user timeline
  const userTimelineLogs = useMemo(() => {
    if (!timelineUser) return [];
    const targetEmail = timelineUser.email.toLowerCase();
    return logs.filter(l => {
      const logEmail = l.user?.email || l.oldValue || '';
      if (logEmail.toLowerCase() === targetEmail) return true;
      try {
        if (l.newValue) {
          const parsed = JSON.parse(l.newValue);
          if (parsed.email && parsed.email.toLowerCase() === targetEmail) return true;
          if (parsed.customerEmail && parsed.customerEmail.toLowerCase() === targetEmail) return true;
        }
      } catch {
        // ignore
      }
      return false;
    });
  }, [logs, timelineUser]);

  // Timeline stats
  const timelineStats = useMemo(() => {
    let loginSuccess = 0;
    let loginFailed = 0;
    let ordersCount = 0;
    let downloadCount = 0;
    let passwordCount = 0;

    userTimelineLogs.forEach(l => {
      const act = l.action.toUpperCase();
      if (act === 'LOGIN_SUCCESS' || act === 'LOGIN') loginSuccess++;
      if (act === 'LOGIN_FAILED' || act === 'LOGIN_BLOCKED') loginFailed++;
      if (act === 'ORDER_CREATED') ordersCount++;
      if (act === 'DOWNLOAD_CAD') downloadCount++;
      if (act === 'PASSWORD_CHANGED') passwordCount++;
    });

    return { loginSuccess, loginFailed, ordersCount, downloadCount, passwordCount };
  }, [userTimelineLogs]);

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Tìm theo tên người dùng, email, mã đơn, file, IP..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 pl-10 pr-4 py-3 focus:outline-none focus:border-[#3583b2] font-medium transition-all"
            />
          </div>

          {/* User selector dropdown */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedUserEmail}
              onChange={e => setSelectedUserEmail(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 px-3 py-2.5 font-bold focus:outline-none focus:border-[#3583b2]"
            >
              <option value="ALL">Tất cả tài khoản ({users.length} người dùng)</option>
              {users.map(u => (
                <option key={u.id} value={u.email}>
                  {u.name} ({u.email}) - [{u.role.name}]
                </option>
              ))}
            </select>

            {selectedUserEmail !== 'ALL' && (
              <button
                onClick={() => {
                  const u = users.find(x => x.email === selectedUserEmail);
                  setTimelineUser({ email: selectedUserEmail, name: u?.name });
                }}
                className="bg-[#2c6e98] hover:bg-[#205272] text-white px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Xem Dòng Thời Gian</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc nhanh:
          </span>

          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất Cả ({logs.length})
          </button>

          <button
            onClick={() => setFilterType('LOGIN_FAILED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filterType === 'LOGIN_FAILED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Đăng Nhập Sai ({counts.loginFailed})</span>
          </button>

          <button
            onClick={() => setFilterType('ORDERS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filterType === 'ORDERS'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Đơn Hàng & Mua ({counts.orders})</span>
          </button>

          <button
            onClick={() => setFilterType('PASSWORD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filterType === 'PASSWORD'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Đổi Mật Khẩu ({counts.password})</span>
          </button>

          <button
            onClick={() => setFilterType('AUTH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filterType === 'AUTH'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Đăng Nhập ({counts.auth})</span>
          </button>

          <button
            onClick={() => setFilterType('DOWNLOAD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filterType === 'DOWNLOAD'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải File ({counts.download})</span>
          </button>

          <button
            onClick={() => setFilterType('CATALOG')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filterType === 'CATALOG'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Sản Phẩm CAD</span>
          </button>
        </div>
      </div>

      {/* Main Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">
            Không tìm thấy sự kiện nhật ký nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-4 w-36">Thời Gian</th>
                  <th className="p-4 w-56">Hành Động (Sự Kiện)</th>
                  <th className="p-4 w-52">Tài Khoản Liên Quan</th>
                  <th className="p-4">Nội Dung Chi Tiết (Dễ Hiểu)</th>
                  <th className="p-4 w-28 text-center">IP</th>
                  <th className="p-4 w-20 text-center">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(log => {
                  const info = parseLogInfo(log);
                  const logEmail = log.user?.email || log.oldValue || info.parsedJson?.email || '';
                  const logName = log.user?.name || info.parsedJson?.name || (log.user ? '' : 'Khách vãng lai / Ẩn');

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        info.isAlert ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* 1. Time */}
                      <td className="p-4 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                        <div className="font-bold text-slate-700">
                          {new Date(log.createdAt).toLocaleTimeString('vi-VN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(log.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* 2. Action Badge & Icon */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border ${info.badgeClass}`}
                          >
                            {info.icon}
                            <span>{info.label}</span>
                          </span>
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 mt-1 pl-1">
                          [{log.module}] {log.action}
                        </div>
                      </td>

                      {/* 3. Account / User */}
                      <td className="p-4">
                        {logEmail ? (
                          <button
                            onClick={() => setTimelineUser({ email: logEmail, name: logName })}
                            className="text-left group block"
                            title="Bấm để xem dòng thời gian hoạt động của tài khoản này"
                          >
                            <div className="font-extrabold text-slate-900 group-hover:text-[#2c6e98] transition-colors flex items-center gap-1">
                              <span>{logName || logEmail}</span>
                              <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#2c6e98]" />
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">{logEmail}</div>
                          </button>
                        ) : (
                          <div className="text-slate-400 italic text-[11px]">Hệ thống System</div>
                        )}
                      </td>

                      {/* 4. Human-readable Detailed Summary */}
                      <td className="p-4">
                        <div className="font-sans text-xs text-slate-800 font-medium leading-relaxed">
                          {info.summary}
                        </div>
                      </td>

                      {/* 5. IP Address */}
                      <td className="p-4 text-center font-mono text-[11px] text-slate-500">
                        {log.ipAddress}
                      </td>

                      {/* 6. View Raw details modal button */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setInspectLog(log)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Xem dữ liệu gốc JSON"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: INSPECT RAW LOG DETAILS */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#3583b2]" />
                <h3 className="font-black text-slate-900 text-base">
                  Chi Tiết Nhật Ký Sự Kiện #{inspectLog.id}
                </h3>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Hành Động:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{inspectLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Phân Hệ:</span>
                  <span className="font-bold text-[#2c6e98]">{inspectLog.module}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Thời Gian:</span>
                  <span className="font-mono text-slate-700">{new Date(inspectLog.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Địa Chỉ IP:</span>
                  <span className="font-mono text-slate-700">{inspectLog.ipAddress}</span>
                </div>
                {inspectLog.user && (
                  <div className="col-span-2 border-t border-slate-200 pt-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Tài Khoản Thực Hiện:</span>
                    <span className="font-bold text-slate-900">{inspectLog.user.name}</span> ({inspectLog.user.email})
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-black text-slate-900 mb-1">Dữ liệu chi tiết (newValue):</h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-60">
                  {inspectLog.newValue
                    ? (() => {
                        try {
                          return JSON.stringify(JSON.parse(inspectLog.newValue), null, 2);
                        } catch {
                          return inspectLog.newValue;
                        }
                      })()
                    : 'Không có'}
                </pre>
              </div>

              {inspectLog.oldValue && (
                <div>
                  <h4 className="font-black text-slate-900 mb-1">Dữ liệu đối chiếu (oldValue):</h4>
                  <pre className="bg-slate-100 text-slate-800 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                    {inspectLog.oldValue}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setInspectLog(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: USER ACTIVITY TIMELINE (DÒNG THỜI GIAN HOẠT ĐỘNG TÀI KHOẢN) */}
      {timelineUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-[#eef7fc] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#b8ddf0] text-[#2c6e98] flex items-center justify-center font-black text-xl shadow-sm">
                  {(timelineUser.name || timelineUser.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-lg">
                      {timelineUser.name || 'Tài khoản người dùng'}
                    </h3>
                    <span className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                      Hồ Sơ Hoạt Động
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-mono font-bold">
                    {timelineUser.email}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setTimelineUser(null)}
                className="p-2 rounded-full hover:bg-white text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Activity Summary Stats */}
            <div className="p-6 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50/60">
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Đăng Nhập Đúng</div>
                <div className="text-base font-black text-emerald-700">{timelineStats.loginSuccess} lần</div>
              </div>

              <div className={`p-3 rounded-xl border text-center ${
                timelineStats.loginFailed > 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
              }`}>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Đăng Nhập Sai</div>
                <div className={`text-base font-black ${
                  timelineStats.loginFailed > 0 ? 'text-rose-700' : 'text-slate-600'
                }`}>
                  {timelineStats.loginFailed} lần
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Đơn Hàng Mua</div>
                <div className="text-base font-black text-[#2c6e98]">{timelineStats.ordersCount} đơn</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Tải File CAD</div>
                <div className="text-base font-black text-purple-700">{timelineStats.downloadCount} lượt</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Đổi Mật Khẩu</div>
                <div className="text-base font-black text-indigo-700">{timelineStats.passwordCount} lần</div>
              </div>
            </div>

            {/* Timeline Feed */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3583b2]" />
                <span>Trình Tự Hoạt Động Của Tài Khoản ({userTimelineLogs.length} sự kiện)</span>
              </h4>

              {userTimelineLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">
                  Chưa ghi nhận hoạt động nào của tài khoản này trong hệ thống.
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pb-4">
                  {userTimelineLogs.map(log => {
                    const info = parseLogInfo(log);
                    return (
                      <div key={log.id} className="relative pl-6 group">
                        {/* Timeline Point */}
                        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                          info.isAlert ? 'border-rose-500' : 'border-[#3583b2]'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            info.isAlert ? 'bg-rose-500' : 'bg-[#3583b2]'
                          }`} />
                        </div>

                        {/* Content Card */}
                        <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200 transition-all space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border font-bold ${info.badgeClass}`}>
                              {info.icon}
                              <span>{info.label}</span>
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              {new Date(log.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>

                          <div className="text-xs text-slate-800 font-medium">
                            {info.summary}
                          </div>

                          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-200/60">
                            <span>Địa chỉ IP: <strong>{log.ipAddress}</strong></span>
                            <span>Mã sự kiện: #{log.id}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setTimelineUser(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
