import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-base-700 bg-base-900/50 px-6 py-16 text-center animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-800">
        <Icon className="h-6 w-6 text-base-400" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-base-100">{title}</p>
        <p className="text-sm text-base-400 max-w-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}
