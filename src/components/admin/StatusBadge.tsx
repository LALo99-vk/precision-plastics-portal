import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  draft:         { label: 'Draft',        classes: 'bg-gray-100 text-gray-700 border-gray-200' },
  published:     { label: 'Published',    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  hidden:        { label: 'Hidden',       classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  discontinued:  { label: 'Discontinued', classes: 'bg-red-50 text-red-700 border-red-200' },
  out_of_stock:  { label: 'Out of Stock', classes: 'bg-orange-50 text-orange-700 border-orange-200' },
  archived:      { label: 'Archived',     classes: 'bg-gray-100 text-gray-500 border-gray-200' },
  new:           { label: 'New',          classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_review:     { label: 'In Review',    classes: 'bg-purple-50 text-purple-700 border-purple-200' },
  quoted:        { label: 'Quoted',       classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  closed:        { label: 'Closed',       classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  responded:     { label: 'Responded',    classes: 'bg-teal-50 text-teal-700 border-teal-200' },
  sent:          { label: 'Sent',         classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  viewed:        { label: 'Viewed',       classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  accepted:      { label: 'Accepted',     classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected:      { label: 'Rejected',     classes: 'bg-red-50 text-red-700 border-red-200' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.replace(/_/g, ' '),
    classes: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded text-sm font-medium border whitespace-nowrap',
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
