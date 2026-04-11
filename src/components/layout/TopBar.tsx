import React from 'react';
import { Menu, Bell, Sun, Moon, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
interface TopBarProps {
  openMobileSidebar: () => void;
}
export function TopBar({ openMobileSidebar }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="h-16 bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={openMobileSidebar}
          className="lg:hidden p-2 -ml-2 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
          
          <Menu size={20} />
        </button>

        <div className="hidden md:flex items-center gap-2">
          <span className="font-heading font-semibold text-lg text-[var(--text-primary)]">
            Nairobi Electronics Hub
          </span>
          <span className="px-2 py-0.5 rounded-full bg-success-500/10 text-success-600 text-xs font-medium border border-success-500/20">
            Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <div className="hidden sm:flex relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            size={16} />
          
          <input
            type="text"
            placeholder="Search orders, products..."
            className="pl-9 pr-4 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-64 text-[var(--text-primary)]" />
          
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
          aria-label="Toggle dark mode">
          
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive-500 rounded-full border-2 border-[var(--bg-primary)]"></span>
        </button>
      </div>
    </header>);

}