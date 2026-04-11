import React, { Fragment } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
interface BreadcrumbItem {
  label: string;
  path?: string;
}
interface BreadcrumbProps {
  items: BreadcrumbItem[];
}
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-[var(--text-secondary)] mb-6">
      <Link
        to="/"
        className="hover:text-[var(--text-primary)] transition-colors">
        
        <Home size={16} />
      </Link>

      {items.map((item, index) =>
      <Fragment key={index}>
          <ChevronRight size={16} className="text-[var(--border-color)]" />
          {item.path ?
        <Link
          to={item.path}
          className="hover:text-[var(--text-primary)] transition-colors">
          
              {item.label}
            </Link> :

        <span className="text-[var(--text-primary)] font-medium">
              {item.label}
            </span>
        }
        </Fragment>
      )}
    </nav>);

}