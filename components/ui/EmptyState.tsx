import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  ctaText,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-4 text-primary/30">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-primary/70">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-primary/50">{description}</p>
      {ctaText && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-4 rounded-lg bg-action px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-action/90"
        >
          {ctaText}
        </Link>
      )}
    </div>
  );
}
