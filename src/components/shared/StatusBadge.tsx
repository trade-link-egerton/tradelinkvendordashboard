import React from 'react';
type StatusVariant = 'success' | 'warning' | 'destructive' | 'info' | 'neutral';
interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
}
export function StatusBadge({ status, variant = 'neutral' }: StatusBadgeProps) {
  const getVariantStyles = (v: StatusVariant) => {
    switch (v) {
      case 'success':
        return 'bg-success-500/10 text-success-600 dark:text-success-500 border-success-500/20';
      case 'warning':
        return 'bg-warning-500/10 text-warning-600 dark:text-warning-500 border-warning-500/20';
      case 'destructive':
        return 'bg-destructive-500/10 text-destructive-600 dark:text-destructive-500 border-destructive-500/20';
      case 'info':
        return 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20';
      case 'neutral':
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantStyles(variant)}`}>
      
      {status}
    </span>);

}