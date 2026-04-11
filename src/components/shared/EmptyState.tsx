import React from 'react';
import { BoxIcon } from 'lucide-react';
interface EmptyStateProps {
  icon: BoxIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)]/50">
      <div className="w-16 h-16 bg-[var(--bg-primary)] rounded-full flex items-center justify-center shadow-sm mb-4">
        <Icon size={32} className="text-[var(--text-secondary)]" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>);

}