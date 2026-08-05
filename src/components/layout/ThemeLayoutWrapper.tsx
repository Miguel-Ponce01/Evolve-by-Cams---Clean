'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LoginModal } from '../auth/LoginModal';
import { Navbar } from './Navbar';
import { 
  Home, 
  Calendar, 
  Sparkles, 
  Users, 
  Activity, 
  DollarSign, 
  UserCheck, 
  LogOut, 
  Menu, 
  X,
  Settings,
  ChevronDown,
  ChevronUp,
  Briefcase,
  LayoutGrid,
  ShoppingBag,
  Heart,
  Megaphone,
  Percent,
  ScanLine,
  LayoutDashboard,
  FileSpreadsheet,
  Award,
  FileText,
  Share2,
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { applyStoredSettings } from '@/lib/themeSettings';

// ─── Secondary Management Panel ───────────────────────────────────────────────
function SecondarySidebar({
  pathname,
  businessMenuItems,
  staffMenuItems,
  servicesMenuItems,
}: {
  pathname: string;
  businessMenuItems: { label: string; href: string }[];
  staffMenuItems: { label: string; href: string }[];
  servicesMenuItems: { label: string; href: string }[];
}) {
  const searchParams = useSearchParams();
  const [isBusinessOpen, setIsBusinessOpen] = useState(true);
  const [isStaffOpen, setIsStaffOpen] = useState(true);
  const [isServicesOpen, setIsServicesOpen] = useState(true);

  const activeTab = searchParams.get('tab') || 'overview';

  const operationsNav = [
    { label: 'Executive Overview', tab: 'overview',  icon: LayoutDashboard },
    { label: 'Client Directory',   tab: 'directory', icon: FileSpreadsheet  },
    { label: 'Member Progress',    tab: 'progress',  icon: Award            },
    { label: 'Online Store',       tab: 'store',     icon: ShoppingBag      },
    { label: 'Reports Suite',      tab: 'reports',   icon: FileText         },
    { label: 'Marketing',          tab: 'marketing', icon: Share2           },
    { label: 'POS Console',        tab: 'console',   icon: ShoppingCart     },
    { label: 'Timetable Grid',     tab: 'timetable', icon: Calendar         },
  ];

  // Reusable sub-link style helper
  const subLink = (isActive: boolean) => ({
    background: isActive ? 'rgba(124,140,242,0.08)' : 'transparent',
    color: isActive ? '#7c8cf2' : '#6B7280',
    fontWeight: isActive ? 600 : 400,
  } as React.CSSProperties);

  const hoverIn  = (e: React.MouseEvent, isActive: boolean) => {
    if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
  };
  const hoverOut = (e: React.MouseEvent, isActive: boolean) => {
    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
  };

  return (
    <aside
      className="w-[240px] h-full flex flex-col shrink-0"
      style={{ background: '#FFFFFF', borderRight: '1px solid #F1F5F9' }}
    >
      {/* Panel header */}
      <div
        className="flex items-center gap-2.5 px-4 h-[60px] flex-shrink-0"
        style={{ borderBottom: '1px solid #F1F5F9' }}
      >
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#7c8cf2,#a78bfa)', color: '#fff' }}
        >
          <LayoutGrid size={12} />
        </span>
        <span className="text-[13px] font-bold text-[#111827] tracking-tight">Management</span>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">

        {/* ── Operations ───────────────────────────────────── */}
        <section>
          <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-[#9CA3AF]">
            Operations
          </p>
          <div className="space-y-0.5">
            {operationsNav.map(({ label, tab, icon: Icon }) => {
              const isActive = pathname === '/portal' && activeTab === tab;
              return (
                <Link
                  key={tab}
                  href={`/portal?tab=${tab}`}
                  className="relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150"
                  style={{ background: isActive ? 'rgba(124,140,242,0.08)' : 'transparent', color: isActive ? '#7c8cf2' : '#374151' }}
                  onMouseEnter={e => hoverIn(e, isActive)}
                  onMouseLeave={e => hoverOut(e, isActive)}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-[18px] rounded-r-full" style={{ background: '#7c8cf2' }} />
                  )}
                  <span
                    className="w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: isActive ? 'rgba(124,140,242,0.15)' : '#F3F4F6', color: isActive ? '#7c8cf2' : '#9CA3AF' }}
                  >
                    <Icon size={12} />
                  </span>
                  <span className="leading-none font-medium truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <div style={{ height: 1, background: '#F1F5F9', margin: '0 8px' }} />

        {/* ── Business Settings ─────────────────────────────── */}
        <section>
          <button
            type="button"
            onClick={() => setIsBusinessOpen(v => !v)}
            className="w-full flex items-center justify-between px-2 py-[7px] rounded-lg hover:bg-[#F9FAFB] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                <Briefcase size={12} />
              </span>
              <span className="text-[13px] font-semibold text-[#111827]">Business Settings</span>
            </div>
            <ChevronDown size={13} className="text-[#9CA3AF] transition-transform duration-200" style={{ transform: isBusinessOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
          </button>
          {isBusinessOpen && (
            <div className="mt-1 ml-[33px] space-y-0.5">
              {businessMenuItems.map(item => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-2 pl-2 pr-3 py-[6px] rounded-lg text-[12px] transition-all duration-150"
                    style={subLink(isActive)}
                    onMouseEnter={e => hoverIn(e, isActive)}
                    onMouseLeave={e => hoverOut(e, isActive)}
                  >
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: isActive ? '#7c8cf2' : '#D1D5DB' }} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Staffing ─────────────────────────────────────── */}
        <section>
          <button
            type="button"
            onClick={() => setIsStaffOpen(v => !v)}
            className="w-full flex items-center justify-between px-2 py-[7px] rounded-lg hover:bg-[#F9FAFB] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                <Sparkles size={12} />
              </span>
              <span className="text-[13px] font-semibold text-[#111827]">Staffing</span>
            </div>
            <ChevronDown size={13} className="text-[#9CA3AF] transition-transform duration-200" style={{ transform: isStaffOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
          </button>
          {isStaffOpen && (
            <div className="mt-1 ml-[33px] space-y-0.5">
              {staffMenuItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-2 pl-2 pr-3 py-[6px] rounded-lg text-[12px] transition-all duration-150"
                    style={subLink(isActive)}
                    onMouseEnter={e => hoverIn(e, isActive)}
                    onMouseLeave={e => hoverOut(e, isActive)}
                  >
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: isActive ? '#7c8cf2' : '#D1D5DB' }} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Services ─────────────────────────────────────── */}
        <section>
          <button
            type="button"
            onClick={() => setIsServicesOpen(v => !v)}
            className="w-full flex items-center justify-between px-2 py-[7px] rounded-lg hover:bg-[#F9FAFB] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                <LayoutGrid size={12} />
              </span>
              <span className="text-[13px] font-semibold text-[#111827]">Services</span>
            </div>
            <ChevronDown size={13} className="text-[#9CA3AF] transition-transform duration-200" style={{ transform: isServicesOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
          </button>
          {isServicesOpen && (
            <div className="mt-1 ml-[33px] space-y-0.5">
              {servicesMenuItems.map(item => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-2 pl-2 pr-3 py-[6px] rounded-lg text-[12px] transition-all duration-150"
                    style={subLink(isActive)}
                    onMouseEnter={e => hoverIn(e, isActive)}
                    onMouseLeave={e => hoverOut(e, isActive)}
                  >
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: isActive ? '#7c8cf2' : '#D1D5DB' }} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

      </nav>
    </aside>
  );
}

// ─── Main Layout Wrapper ───────────────────────────────────────────────────────
export function ThemeLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenLogin = () => setIsLoginModalOpen(true);
    window.addEventListener('open-login-modal', handleOpenLogin);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('login') === 'true') {
        setIsLoginModalOpen(true);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('login');
        window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
      }
    }
    return () => window.removeEventListener('open-login-modal', handleOpenLogin);
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      applyStoredSettings();
      document.documentElement.classList.remove('dark-mode-override');
    }
  }, [pathname]);

  const isLoginPage = pathname === '/admin';
  const isAdminPage = pathname.startsWith('/portal') ||
                      pathname.startsWith('/schedule') ||
                      pathname.startsWith('/roster') ||
                      pathname.startsWith('/analytics') ||
                      pathname.startsWith('/wallet') ||
                      pathname.startsWith('/profile') ||
                      pathname.startsWith('/dashboard');

  const primaryNavGroups = [
    [
      { icon: Home,        href: '/dashboard',        label: 'Home' },
      { icon: Calendar,    href: '/schedule',          label: 'Schedule' },
    ],
    [
      { icon: DollarSign,  href: '/portal/financials', label: 'Sales' },
      { icon: Users,       href: '/profile',           label: 'Customers' },
      { icon: Activity,    href: '/analytics',         label: 'Reports' },
      { icon: ShoppingBag, href: '/portal/store',      label: 'Online Store' },
    ],
    [
      { icon: Megaphone,   href: '/portal/marketing',  label: 'Marketing' },
      { icon: Heart,       href: '/portal/centricity', label: 'Centricity' },
      { icon: Percent,     href: '/portal/promos',     label: 'Promos' },
      { icon: ScanLine,    href: '/portal/scan',       label: 'Scan Customer' },
    ],
    [
      { icon: LayoutGrid,  href: '/portal',            label: 'Management',
        isActive: pathname.startsWith('/portal') },
      { icon: Settings,    href: '/portal/settings',   label: 'Settings' },
    ],
  ];

  const businessMenuItems = [
    { label: 'Business Information',     href: '/portal/business' },
    { label: 'Tax Settings',             href: '/portal/taxes' },
    { label: 'Rooms',                       href: '/portal/outlets' },
    { label: 'Equipments',              href: '/portal/equipments' },
    { label: 'Holidays',                 href: '/portal/holidays' },
    { label: 'Appointment Availability', href: '/portal/availability' },
  ];

  const staffMenuItems = [
    { label: 'Users', href: '/portal/users' },
    { label: 'Roles', href: '/portal/roles' },
  ];

  const servicesMenuItems = [
    { label: 'Classes', href: '/portal/classes' },
  ];

  if (isLoginPage) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6 text-black">
        {children}
      </main>
    );
  }

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] text-black font-sans flex flex-col md:flex-row">

        {/* ── Mobile Header ────────────────────────────────── */}
        <header
          className="md:hidden h-14 flex items-center justify-between px-4 sticky top-0 z-40"
          style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c8cf2,#a78bfa)', boxShadow: '0 2px 8px rgba(124,140,242,0.4)' }}
            >
              <span className="text-white text-[10px] font-black">E</span>
            </div>
            <span className="text-white text-[13px] font-bold tracking-tight">Evolve Studio</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#D1D5DB' }}
          >
            {mobileSidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </header>

        {/* ── Dual-Tier Sidebar ────────────────────────────── */}
        <div className={cn(
          "fixed md:sticky top-14 md:top-0 h-[calc(100vh-56px)] md:h-screen z-30 flex transition-transform duration-300",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>

          {/* Tier 1 — Primary Icon Rail */}
          <aside
            className="w-[60px] flex flex-col items-center pt-4 pb-4 h-full overflow-y-auto"
            style={{ background: '#111827', borderRight: '1px solid rgba(255,255,255,0.05)' }}
          >
            {/* Logo mark */}
            <div className="mb-5 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg,#7c8cf2 0%,#a78bfa 100%)',
                  boxShadow: '0 2px 12px rgba(124,140,242,0.45)',
                }}
              >
                <span className="text-white text-[11px] font-black leading-none">E</span>
              </div>
            </div>

            {/* Icon nav groups */}
            <nav className="flex-1 flex flex-col gap-1 w-full px-2">
              {primaryNavGroups.map((group, gi) => (
                <React.Fragment key={gi}>
                  {group.map(item => {
                    const isActive = 'isActive' in item
                      ? item.isActive
                      : pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        title={item.label}
                        className="relative flex items-center justify-center w-full h-9 rounded-lg transition-all duration-150"
                        style={{
                          background: isActive ? 'rgba(124,140,242,0.18)' : 'transparent',
                          color: isActive ? '#a5b4fc' : '#6B7280',
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                            (e.currentTarget as HTMLElement).style.color = '#D1D5DB';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = '#6B7280';
                          }
                        }}
                      >
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full"
                            style={{ background: '#818cf8' }}
                          />
                        )}
                        <Icon size={16} />
                      </Link>
                    );
                  })}
                  {/* Group divider */}
                  {gi < primaryNavGroups.length - 1 && (
                    <div className="mx-3 my-1.5" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                  )}
                </React.Fragment>
              ))}
            </nav>

            {/* Bottom user avatar */}
            <div className="flex-shrink-0 mt-3">
              <button
                title="Your profile"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white ring-2 ring-transparent transition-all duration-150 hover:ring-[#7c8cf2]/50"
                style={{ background: 'linear-gradient(135deg,#7c8cf2,#a78bfa)' }}
              >
                CR
              </button>
            </div>
          </aside>

          {/* Tier 2 — Management Panel */}
          {pathname.startsWith('/portal') && (
            <Suspense
              fallback={
                <aside
                  className="w-[240px] h-full flex items-center justify-center"
                  style={{ background: '#FFFFFF', borderRight: '1px solid #F1F5F9' }}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-[#7c8cf2]/20 border-t-[#7c8cf2] animate-spin" />
                </aside>
              }
            >
              <SecondarySidebar
                pathname={pathname}
                businessMenuItems={businessMenuItems}
                staffMenuItems={staffMenuItems}
                servicesMenuItems={servicesMenuItems}
              />
            </Suspense>
          )}
        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-56px)] md:min-h-screen overflow-y-auto">
          {children}
        </main>

        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    );
  }

  // Public pages
  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
