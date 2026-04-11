import React from 'react';
interface SkeletonProps {
  className?: string;
}
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--border-color)] rounded ${className}`} />);


}
export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>);

}
export function SkeletonTableRow({ columns = 5 }: {columns?: number;}) {
  return (
    <tr className="border-b border-[var(--border-color)]">
      {Array.from({
        length: columns
      }).map((_, i) =>
      <td key={i} className="px-5 py-3">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      )}
    </tr>);

}
export function SkeletonTable({
  rows = 5,
  columns = 5



}: {rows?: number;columns?: number;}) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
            {Array.from({
              length: columns
            }).map((_, i) =>
            <th key={i} className="px-5 py-3">
                <Skeleton className="h-3 w-16" />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from({
            length: rows
          }).map((_, i) =>
          <SkeletonTableRow key={i} columns={columns} />
          )}
        </tbody>
      </table>
    </div>);

}
export function SkeletonChart() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>
      <div className="h-[300px] flex items-end gap-2 px-4">
        {Array.from({
          length: 7
        }).map((_, i) =>
        <div key={i} className="flex-1 flex flex-col justify-end">
            <Skeleton
            className="w-full rounded-t"
            style={{
              height: `${Math.random() * 60 + 30}%`
            }} />
          
          </div>
        )}
      </div>
    </div>);

}