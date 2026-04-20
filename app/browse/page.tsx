import { createServerSupabaseClient } from "@/lib/supabase-server";
import BrowseClient from "@/components/BrowseClient";
import ListingCardSkeleton from "@/components/ListingCardSkeleton";
import type { ListingWithHost } from "@/lib/types";
import { Suspense } from "react";

async function BrowseListings() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*, users!listings_host_id_fkey(name, photo_url, verified)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-700">
          Unable to load listings right now
        </p>
        <p className="mt-1 text-sm text-red-600/70">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  const listings = (data ?? []) as ListingWithHost[];

  return <BrowseClient listings={listings} />;
}

function BrowseSkeletons() {
  return (
    <>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="h-12 flex-1 animate-pulse rounded-xl bg-primary/5" />
        <div className="h-12 w-40 animate-pulse rounded-xl bg-primary/5" />
      </div>
      <div className="mb-4 h-4 w-32 animate-pulse rounded bg-primary/5" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

export default function BrowsePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <Suspense fallback={<BrowseSkeletons />}>
          <BrowseListings />
        </Suspense>
      </div>
    </main>
  );
}
