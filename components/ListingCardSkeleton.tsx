export default function ListingCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
      <div className="relative h-36 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="absolute -bottom-6 left-4 h-14 w-14 rounded-full border-[3px] border-white bg-primary/20" />
      </div>

      <div className="px-4 pb-4 pt-8">
        <div className="h-5 w-3/4 rounded bg-primary/10" />
        <div className="mt-2 h-4 w-1/2 rounded bg-primary/5" />
        <div className="mt-1 h-3 w-1/3 rounded bg-primary/5" />

        <div className="mt-3 flex gap-2">
          <div className="h-3 w-24 rounded bg-primary/5" />
          <div className="h-3 w-28 rounded bg-primary/5" />
        </div>

        <div className="mt-3 flex gap-1.5">
          <div className="h-5 w-12 rounded-full bg-accent/10" />
          <div className="h-5 w-16 rounded-full bg-primary/5" />
        </div>

        <div className="mt-4 h-10 w-full rounded-lg bg-primary/5" />
      </div>
    </div>
  );
}
