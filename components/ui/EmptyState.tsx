import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary/30">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-primary">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-primary/50">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
