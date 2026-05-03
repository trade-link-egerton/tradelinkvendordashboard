import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  RotateCcw,
  BarChart3,
  Wallet,
  Settings,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  Store,
  LogOut,
} from 'lucide-react';
import { getVendorSession, clearVendorSession } from '../../lib/session';
import { toast } from 'sonner';
import { clearAccessToken } from '../../lib/auth';
interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  closeMobile: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: Tags, label: 'Categories', path: '/categories' },
  { icon: ShoppingCart, label: 'Orders', path: '/orders' },
  // { icon: RotateCcw, label: 'Returns', path: '/returns' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Wallet, label: 'Payouts', path: '/payouts' },
  { icon: Settings, label: 'Store Settings', path: '/settings' },
  { icon: LifeBuoy, label: 'Support', path: '/support' },
];

export function Sidebar({
  isCollapsed,
  toggleCollapse,
  isMobileOpen,
  closeMobile,
}: SidebarProps) {
  const navigate = useNavigate();
  const session = getVendorSession();
  const initials =
    session.vendorName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'VU';

const handleLogout = () => {
  // 1. clear local storage session
  clearVendorSession();

  // 2. clear token (VERY IMPORTANT FIX)
  clearAccessToken();

  toast.success('Logged out successfully');

  // 3. force reload clean state
  window.location.href = '/login';
};

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-[var(--bg-primary)] border-r border-[var(--border-color)]
          transition-all duration-300 ease-in-out flex flex-col
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-brand-700 text-white p-2 rounded-lg shrink-0">
              <Store size={20} />
            </div>
            {!isCollapsed && (
              <span className="font-heading font-bold text-xl text-[var(--text-primary)] whitespace-nowrap">
                TradeLink
              </span>
            )}
          </div>

          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobileOpen && closeMobile()}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group
                ${isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                }
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Area with Logout */}
        <div className="p-4 border-t border-[var(--border-color)] shrink-0 space-y-3">
          {/* Vendor Info */}
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-accent-600 text-white flex items-center justify-center font-medium shrink-0">
              {initials}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {session.vendorName}
                </p>
                <p className="text-xs text-[var(--text-secondary)] truncate">
                  ID: {session.vendorId}
                </p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg
              text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30
              transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}