import { cn } from '@/core/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  rightContent?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  className,
  rightContent,
}: PageHeaderProps) {
  return (
    <div
      data-testid="page-header"
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div data-testid="page-header-actions" className="flex flex-wrap items-center gap-2 sm:gap-4">
        {action && <div className="flex-shrink-0">{action}</div>}
        {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
      </div>
    </div>
  );
}
