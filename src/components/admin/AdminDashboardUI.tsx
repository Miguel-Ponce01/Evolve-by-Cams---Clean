'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ChevronsLeft,
  Edit2,
  Trash2,
  FileText,
  LogOut,
  Menu,
  X,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  User,
  Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type SortDir = 'asc' | 'desc' | null;
type SortKey = 'client' | 'date' | 'type' | 'amount' | 'status' | null;
type TabKey = 'overview' | 'clients' | 'bookings' | 'revenue' | 'reports' | 'settings';
type StatusType = 'paid' | 'pending' | 'cancelled' | 'refunded';

interface Transaction {
  id: string;
  client: string;
  email: string;
  date: string;
  type: string;
  amount: number;
  status: StatusType;
  method: string;
}

// ─── Micro Sparkline SVG ──────────────────────────────────────────────────────
function Sparkline({ data, color, positive }: { data: number[]; color: string; positive: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');
  const fillPts = `0,${h} ${pts} ${w},${h}`;
  const gradId = `sg-${color.replace('#', '')}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={positive ? 0.25 : 0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: StatusType }) {
  const config: Record<StatusType, { label: string; bg: string; text: string; dot: string; icon: React.ReactNode }> = {
    paid:      { label: 'Paid',      bg: '#DCFCE7', text: '#15803D', dot: '#16A34A', icon: <CheckCircle size={11} /> },
    pending:   { label: 'Pending',   bg: '#FEF9C3', text: '#A16207', dot: '#D97706', icon: <Clock size={11} /> },
    cancelled: { label: 'Cancelled', bg: '#FEE2E2', text: '#B91C1C', dot: '#DC2626', icon: <XCircle size={11} /> },
    refunded:  { label: 'Refunded',  bg: '#E0E7FF', text: '#3730A3', dot: '#6366F1', icon: <AlertCircle size={11} /> },
  };
  const c = config[status];
  return (
    <span
      style={{ backgroundColor: c.bg, color: c.text }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold leading-tight whitespace-nowrap"
    >
      <span style={{ color: c.dot }}>{c.icon}</span>
      {c.label}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({
  title, value, trend, trendVal, sparkData, icon, color, prefix,
}: {
  title: string; value: string; trend: 'up' | 'down'; trendVal: string;
  sparkData: number[]; icon: React.ReactNode; color: string; prefix?: string;
}) {
  const isPositive = trend === 'up';
  const trendColor = isPositive ? '#16A34A' : '#DC2626';
  const trendBg = isPositive ? '#DCFCE7' : '#FEE2E2';
  return (
    <div
      className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-md hover:border-[#CBD5E1] group"
      style={{ minWidth: 0 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide leading-none mb-2">{title}</p>
          <p className="text-[24px] font-bold text-[#0F172A] leading-none tracking-tight">
            {prefix && <span className="text-[16px] font-semibold text-[#64748B] mr-0.5">{prefix}</span>}
            {value}
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
          style={{ backgroundColor: trendBg, color: trendColor }}
        >
          {isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {trendVal}
        </span>
        <Sparkline data={sparkData} color={color} positive={isPositive} />
      </div>
    </div>
  );
}

// ─── Sort Icon ─────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUp size={12} className="text-[#CBD5E1]" />;
  if (sortDir === 'asc') return <ArrowUp size={12} className="text-[#2563EB]" />;
  if (sortDir === 'desc') return <ArrowDown size={12} className="text-[#2563EB]" />;
  return <ArrowUp size={12} className="text-[#CBD5E1]" />;
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({
  icon, label, active, collapsed, onClick, badge,
}: {
  icon: React.ReactNode; label: string; active: boolean; collapsed: boolean;
  onClick: () => void; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group relative ${
        active ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
      }`}
    >
      <span className={`flex-shrink-0 w-4 h-4 transition-colors duration-150 ${
        active ? 'text-[#2563EB]' : 'text-[#94A3B8] group-hover:text-[#475569]'
      }`}>
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left leading-none">{label}</span>
          {badge != null && badge > 0 && (
            <span className="flex-shrink-0 min-w-[18px] h-[18px] bg-[#2563EB] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#2563EB] rounded-r-full" />}
    </button>
  );
}

// ─── Static Data ─────────────────────────────────────────────────────────────
const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-0041', client: 'Maria Santos',   email: 'maria@example.com',  date: '2026-07-31', type: 'Membership', amount: 3500,  status: 'paid',      method: 'GCash' },
  { id: 'TXN-0040', client: 'Juan dela Cruz', email: 'juan@example.com',   date: '2026-07-30', type: 'Drop-in',   amount: 500,   status: 'pending',   method: 'Cash' },
  { id: 'TXN-0039', client: 'Ana Reyes',      email: 'ana@example.com',    date: '2026-07-30', type: 'Package',   amount: 7200,  status: 'paid',      method: 'Credit Card' },
  { id: 'TXN-0038', client: 'Carlos Mendoza', email: 'carlos@example.com', date: '2026-07-29', type: 'Membership', amount: 3500, status: 'cancelled', method: 'Maya' },
  { id: 'TXN-0037', client: 'Grace Tan',      email: 'grace@example.com',  date: '2026-07-29', type: 'Drop-in',   amount: 500,   status: 'paid',      method: 'GCash' },
  { id: 'TXN-0036', client: 'Paolo Lim',      email: 'paolo@example.com',  date: '2026-07-28', type: 'Package',   amount: 12500, status: 'paid',      method: 'Credit Card' },
  { id: 'TXN-0035', client: 'Sofia Garcia',   email: 'sofia@example.com',  date: '2026-07-28', type: 'Membership', amount: 3500, status: 'refunded',  method: 'GCash' },
  { id: 'TXN-0034', client: 'Marco Torres',   email: 'marco@example.com',  date: '2026-07-27', type: 'Drop-in',   amount: 500,   status: 'paid',      method: 'Cash' },
  { id: 'TXN-0033', client: 'Lea Mateo',      email: 'lea@example.com',    date: '2026-07-27', type: 'Package',   amount: 7200,  status: 'pending',   method: 'Maya' },
  { id: 'TXN-0032', client: 'Ben Ocampo',     email: 'ben@example.com',    date: '2026-07-26', type: 'Membership', amount: 3500, status: 'paid',      method: 'GCash' },
];

const NAV_ITEMS: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
  { key: 'overview', label: 'Overview',  icon: <LayoutDashboard size={16} /> },
  { key: 'clients',  label: 'Clients',   icon: <Users size={16} />, badge: 14 },
  { key: 'bookings', label: 'Bookings',  icon: <Calendar size={16} /> },
  { key: 'revenue',  label: 'Revenue',   icon: <DollarSign size={16} /> },
  { key: 'reports',  label: 'Reports',   icon: <BarChart3 size={16} /> },
];

const KPI_DATA = [
  {
    title: 'Total Revenue', value: '482,150', prefix: '₱',
    trend: 'up' as const, trendVal: '+12.4% vs last month',
    sparkData: [22, 28, 25, 35, 30, 42, 38, 50, 46, 58, 54, 62],
    icon: <DollarSign size={16} />, color: '#2563EB',
  },
  {
    title: 'Active Members', value: '1,284',
    trend: 'up' as const, trendVal: '+8.1% vs last month',
    sparkData: [80, 85, 82, 90, 88, 95, 93, 100, 98, 105, 102, 110],
    icon: <Users size={16} />, color: '#16A34A',
  },
  {
    title: 'Classes This Month', value: '316',
    trend: 'down' as const, trendVal: '-3.2% vs last month',
    sparkData: [30, 28, 35, 32, 28, 25, 27, 24, 26, 23, 25, 22],
    icon: <Calendar size={16} />, color: '#D97706',
  },
  {
    title: 'Avg. Session Value', value: '1,524', prefix: '₱',
    trend: 'up' as const, trendVal: '+5.6% vs last month',
    sparkData: [140, 148, 145, 155, 152, 162, 158, 168, 165, 175, 172, 180],
    icon: <TrendingUp size={16} />, color: '#7C3AED',
  },
];

// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function AdminDashboardUI() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');

  const ROWS_PER_PAGE = 10;
  const TOTAL_ROWS = 482;
  const TOTAL_PAGES = Math.ceil(TOTAL_ROWS / ROWS_PER_PAGE);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey !== key) { setSortKey(key); setSortDir('asc'); }
      else if (sortDir === 'asc') { setSortDir('desc'); }
      else { setSortKey(null); setSortDir(null); }
    },
    [sortKey, sortDir]
  );

  const filteredData = useMemo(() => {
    let rows = [...SAMPLE_TRANSACTIONS];
    if (statusFilter !== 'all') rows = rows.filter((r) => r.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((r) =>
        r.client.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    }
    if (sortKey && sortDir) {
      rows.sort((a, b) => {
        const av = sortKey === 'amount' ? a.amount : (a[sortKey as keyof Transaction] as string);
        const bv = sortKey === 'amount' ? b.amount : (b[sortKey as keyof Transaction] as string);
        if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }
    return rows;
  }, [searchQuery, sortKey, sortDir, statusFilter]);

  const breadcrumb = useMemo(() => {
    const map: Record<TabKey, string> = {
      overview: 'Overview', clients: 'Client Directory', bookings: 'Bookings',
      revenue: 'Revenue', reports: 'Reports', settings: 'Settings',
    };
    return map[activeTab];
  }, [activeTab]);

  const notifications = [
    { id: 1, title: 'New booking confirmed',  desc: 'Maria Santos — Reformer Pilates 9AM',  time: '2m ago',  unread: true },
    { id: 2, title: 'Payment received',       desc: '₱3,500 via GCash from Ana Reyes',       time: '18m ago', unread: true },
    { id: 3, title: 'Class almost full',      desc: 'Barre Fusion 6PM — 1 spot left',        time: '1h ago',  unread: false },
  ];

  return (
    <div
      className="flex h-screen bg-[#F8FAFC] overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      onClick={() => { setNotifOpen(false); setProfileOpen(false); }}
    >
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 lg:relative flex-shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: sidebarCollapsed ? 64 : 240 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-[60px] border-b border-[#E2E8F0] flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="text-[13px] font-bold text-[#0F172A] leading-none whitespace-nowrap">Evolve Studio</p>
              <p className="text-[10px] text-[#64748B] leading-none mt-0.5 whitespace-nowrap">Admin Console</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-0.5">
          {!sidebarCollapsed && (
            <p className="px-2 mb-2 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest">Main Menu</p>
          )}
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.key}
              collapsed={sidebarCollapsed}
              onClick={() => { setActiveTab(item.key); setMobileMenuOpen(false); }}
              badge={item.badge}
            />
          ))}
          {!sidebarCollapsed && (
            <p className="px-2 mt-5 mb-2 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest">System</p>
          )}
          {sidebarCollapsed && <div className="h-3" />}
          <NavItem
            icon={<Settings size={16} />}
            label="Settings"
            active={activeTab === 'settings'}
            collapsed={sidebarCollapsed}
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
          />
        </nav>

        {/* Collapse Button */}
        <div className="flex-shrink-0 px-2 py-3 border-t border-[#E2E8F0]">
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[12px] font-medium text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] transition-all duration-150"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={15} /> : (<><ChevronsLeft size={15} /><span>Collapse</span></>)}
          </button>
        </div>

        {/* Sidebar User */}
        {!sidebarCollapsed && (
          <div className="flex-shrink-0 px-3 pb-4">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-white">CR</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#1E293B] leading-none truncate">Cams Rivera</p>
                <p className="text-[10px] text-[#64748B] leading-none mt-0.5 truncate">Studio Admin</p>
              </div>
              <button className="flex-shrink-0 text-[#94A3B8] hover:text-[#DC2626] transition-colors">
                <LogOut size={13} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Area ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="h-[60px] flex-shrink-0 bg-white border-b border-[#E2E8F0] flex items-center px-4 gap-3 z-30">
          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
            onClick={(e) => { e.stopPropagation(); setMobileMenuOpen((v) => !v); }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Breadcrumb */}
          <nav className="hidden sm:flex items-center gap-1.5 text-[12px] text-[#64748B] flex-shrink-0">
            <span className="text-[#94A3B8]">Admin</span>
            <ChevronRight size={12} className="text-[#CBD5E1]" />
            <span className="font-semibold text-[#1E293B]">{breadcrumb}</span>
          </nav>
          <div className="hidden sm:block w-px h-5 bg-[#E2E8F0] mx-1 flex-shrink-0" />

          {/* Search */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              <input
                type="text"
                placeholder="Search clients, transactions…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
                style={{ WebkitTextFillColor: '#1E293B' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button
                className="relative p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] transition-all"
                onClick={(e) => { e.stopPropagation(); setNotifOpen((v) => !v); setProfileOpen(false); }}
              >
                <Bell size={17} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full border-2 border-white" />
              </button>
              {notifOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
                    <p className="text-[13px] font-semibold text-[#0F172A]">Notifications</p>
                    <span className="text-[11px] text-[#2563EB] font-medium cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="divide-y divide-[#F1F5F9]">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex gap-3 px-4 py-3 hover:bg-[#F8FAFC] cursor-pointer transition-colors ${n.unread ? 'bg-[#EFF6FF]/40' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-[#1E293B] leading-tight">{n.title}</p>
                          <p className="text-[11px] text-[#64748B] mt-0.5 leading-tight">{n.desc}</p>
                          <p className="text-[10px] text-[#94A3B8] mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-[#E2E8F0] text-center">
                    <span className="text-[11px] text-[#2563EB] font-medium cursor-pointer hover:underline">View all notifications</span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg hover:bg-[#F1F5F9] transition-all group"
                onClick={(e) => { e.stopPropagation(); setProfileOpen((v) => !v); setNotifOpen(false); }}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-white">CR</span>
                </div>
                <span className="hidden sm:block text-[12px] font-medium text-[#475569] group-hover:text-[#1E293B] transition-colors">Cams Rivera</span>
                <ChevronDown size={13} className="hidden sm:block text-[#94A3B8]" />
              </button>
              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-[#E2E8F0]">
                    <p className="text-[13px] font-semibold text-[#0F172A]">Cams Rivera</p>
                    <p className="text-[11px] text-[#64748B]">admin@crtl.com</p>
                  </div>
                  {[
                    { icon: <User size={13} />, label: 'My Profile' },
                    { icon: <Settings size={13} />, label: 'Preferences' },
                    { icon: <FileText size={13} />, label: 'Activity Log' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E293B] transition-colors text-left"
                    >
                      <span className="text-[#94A3B8]">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-[#E2E8F0]">
                    <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-[#DC2626] hover:bg-[#FEF2F2] transition-colors text-left">
                      <LogOut size={13} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Content Viewport ──────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">

            {/* Page Header */}
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[24px] font-bold text-[#0F172A] leading-tight tracking-tight">{breadcrumb}</h1>
                <p className="text-[13px] text-[#64748B] mt-0.5">Real-time studio operations snapshot — July 2026</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all">
                  <Filter size={13} /><span className="hidden sm:inline">Filter</span>
                </button>
                <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all">
                  <Download size={13} /><span className="hidden sm:inline">Export</span>
                </button>
                <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#2563EB] text-[12px] font-semibold text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-all shadow-sm shadow-[#2563EB]/25">
                  + New Transaction
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {KPI_DATA.map((kpi) => <KPICard key={kpi.title} {...kpi} />)}
            </div>

            {/* Stats + Activity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Today summary */}
              <div className="md:col-span-1 bg-white rounded-xl border border-[#E2E8F0] p-4">
                <p className="text-[13px] font-semibold text-[#0F172A] mb-3">Today&apos;s Summary</p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Classes Scheduled', val: '8',       color: '#2563EB' },
                    { label: 'New Bookings',       val: '23',      color: '#16A34A' },
                    { label: 'Revenue Today',      val: '₱14,500', color: '#7C3AED' },
                    { label: 'Active Sessions',    val: '2',       color: '#D97706' },
                    { label: 'Cancellations',      val: '1',       color: '#DC2626' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-[12px] text-[#64748B]">{s.label}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#1E293B]">{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity feed */}
              <div className="md:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-semibold text-[#0F172A]">Recent Activity</p>
                  <button className="text-[11px] text-[#2563EB] font-medium hover:underline">View all</button>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: <CheckCircle size={13} />, color: '#16A34A', bg: '#DCFCE7', msg: 'Maria Santos checked in to Reformer Pilates 9AM', time: '2m ago' },
                    { icon: <DollarSign size={13} />,  color: '#2563EB', bg: '#DBEAFE', msg: 'Payment of ₱3,500 received via GCash from Ana Reyes', time: '18m ago' },
                    { icon: <Users size={13} />,       color: '#7C3AED', bg: '#EDE9FE', msg: 'New client registered: Paolo Lim (paolo@example.com)', time: '34m ago' },
                    { icon: <AlertCircle size={13} />, color: '#D97706', bg: '#FEF9C3', msg: 'Barre Fusion 6PM class is almost full — 1 spot remaining', time: '1h ago' },
                    { icon: <XCircle size={13} />,     color: '#DC2626', bg: '#FEE2E2', msg: 'Booking TXN-0038 cancelled by Carlos Mendoza', time: '2h ago' },
                  ].map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-1.5 border-b border-[#F1F5F9] last:border-0">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: a.bg, color: a.color }}>
                        {a.icon}
                      </div>
                      <p className="flex-1 text-[12px] text-[#475569] leading-snug">{a.msg}</p>
                      <span className="text-[10px] text-[#94A3B8] flex-shrink-0 mt-0.5 whitespace-nowrap">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Transaction Data Table ──────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              {/* Table toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-[#E2E8F0]">
                <div>
                  <p className="text-[14px] font-semibold text-[#0F172A]">Transaction Ledger</p>
                  <p className="text-[12px] text-[#64748B]">All client transactions and payment records</p>
                </div>
                {/* Status filter tabs */}
                <div className="flex items-center gap-1 p-0.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  {(['all', 'paid', 'pending', 'cancelled', 'refunded'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all ${
                        statusFilter === s
                          ? 'bg-white text-[#1E293B] shadow-sm border border-[#E2E8F0]'
                          : 'text-[#64748B] hover:text-[#1E293B]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      {[
                        { key: null as SortKey,     label: 'Txn ID',  w: '10%' },
                        { key: 'client' as SortKey, label: 'Client',  w: '22%' },
                        { key: 'date' as SortKey,   label: 'Date',    w: '12%' },
                        { key: 'type' as SortKey,   label: 'Type',    w: '12%' },
                        { key: 'amount' as SortKey, label: 'Amount',  w: '12%' },
                        { key: 'status' as SortKey, label: 'Status',  w: '13%' },
                        { key: null as SortKey,     label: 'Method',  w: '11%' },
                        { key: null as SortKey,     label: 'Actions', w: '8%'  },
                      ].map((col) => (
                        <th
                          key={col.label}
                          style={{ width: col.w }}
                          className="px-4 py-2.5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap"
                        >
                          {col.key ? (
                            <button
                              className="inline-flex items-center gap-1 hover:text-[#2563EB] transition-colors"
                              onClick={() => handleSort(col.key)}
                            >
                              {col.label}
                              <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                            </button>
                          ) : col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {filteredData.map((row) => (
                      <tr key={row.id} className="hover:bg-[#F8FAFC] transition-colors group">
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-mono font-semibold text-[#2563EB]">{row.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-medium text-[#1E293B] leading-tight">{row.client}</p>
                          <p className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">{row.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-[#64748B] whitespace-nowrap">
                            {new Date(row.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 bg-[#F1F5F9] rounded-md text-[11px] font-medium text-[#475569]">
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[13px] font-semibold text-[#1E293B] tabular-nums">
                            ₱{row.amount.toLocaleString('en-PH')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-[#64748B]">{row.method}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="w-7 h-7 rounded-md flex items-center justify-center text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-all"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="w-7 h-7 rounded-md flex items-center justify-center text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-all"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-[#E2E8F0] bg-[#FAFBFC]">
                <p className="text-[12px] text-[#64748B]">
                  Showing{' '}
                  <span className="font-semibold text-[#1E293B]">
                    {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, TOTAL_ROWS)}
                  </span>
                  {' '}of{' '}
                  <span className="font-semibold text-[#1E293B]">{TOTAL_ROWS.toLocaleString()}</span> transactions
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-7 h-7 rounded-md flex items-center justify-center border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-medium border transition-all ${
                        currentPage === page
                          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                          : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <span className="text-[12px] text-[#94A3B8] px-1">…</span>
                  <button className="w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-medium border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]">
                    {TOTAL_PAGES}
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
                    className="w-7 h-7 rounded-md flex items-center justify-center border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-4" />
          </div>
        </main>
      </div>
    </div>
  );
}
