interface ListingCardProps {
  title: string;
  area: string;
  capacity: number;
  hostName: string;
}

export default function ListingCard({
  title,
  area,
  capacity,
  hostName,
}: ListingCardProps) {
  return (
    <div className="rounded-xl border border-primary/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 h-40 rounded-lg bg-accent/20" />
      <h3 className="font-bold text-primary">{title}</h3>
      <p className="text-sm text-primary/60">{area}</p>
      <p className="mt-1 text-xs text-primary/50">
        Hosted by {hostName} &middot; {capacity} items
      </p>
    </div>
  );
}
