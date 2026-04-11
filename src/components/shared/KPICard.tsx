import React from 'react';
import { TrendingUp, TrendingDown, BoxIcon } from 'lucide-react';
interface KPICardProps {
  title: string;
  value: string;
  icon: BoxIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}
export function KPICard({ title, value, icon: Icon, trend }: KPICardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {value}
          </h3>
        </div>
        <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-600 dark:text-brand-400">
          <Icon size={20} />
        </div>
      </div>

      {trend &&
      <div className="mt-4 flex items-center text-sm">
          <span
          className={`flex items-center font-medium ${trend.isPositive ? 'text-success-600' : 'text-destructive-600'}`}>
          
            {trend.isPositive ?
          <TrendingUp size={16} className="mr-1" /> :

          <TrendingDown size={16} className="mr-1" />
          }
            {Math.abs(trend.value)}%
          </span>
          <span className="text-[var(--text-secondary)] ml-2">
            vs last month
          </span>
        </div>
      }
    </div>);

}