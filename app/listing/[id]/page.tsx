import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import ListingBookingCTA from "@/components/ListingBookingCTA";
import type { ListingWithHost } from "@/lib/types";

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*, users!listings_host_id_fkey(name, photo_url, verified)")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const listing = data as ListingWithHost;
  const host = listing.users;

  const hostInitials = host.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const startDate = new Date(listing.availability_start).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );
  const endDate = new Date(listing.availability_end).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-8">
        {/* Photo gallery / placeholder */}
        <div className="mb-8 overflow-hidden rounded-2xl">
          {listing.photos && listing.photos.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {listing.photos.slice(0, 4).map((photo, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden ${
                    i === 0 ? "sm:col-span-2 sm:row-span-2" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={`${listing.title} photo ${i + 1}`}
                    className="h-48 w-full object-cover sm:h-64"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center bg-gradient-to-br from-accent/20 to-primary/10 sm:h-64">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-primary/20"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                  />
                </svg>
                <p className="mt-2 text-sm text-primary/30">
                  No photos available
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-primary md:text-3xl">
                {listing.title}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-primary/60">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                {listing.area}
              </p>
            </div>

            {/* Availability */}
            <div className="rounded-xl border border-primary/10 bg-white p-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary/40">
                Availability
              </h2>
              <div className="flex items-center gap-2 text-primary">
                <svg
                  className="h-5 w-5 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
                <span className="font-medium">
                  {startDate} — {endDate}
                </span>
              </div>
            </div>

            {/* Capacity */}
            <div className="rounded-xl border border-primary/10 bg-white p-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary/40">
                Capacity
              </h2>
              <p className="flex items-center gap-2 text-primary">
                <svg
                  className="h-5 w-5 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                  />
                </svg>
                <span className="font-medium">
                  Up to {listing.capacity} items
                </span>
              </p>
            </div>

            {/* What's accepted */}
            <div className="rounded-xl border border-primary/10 bg-white p-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary/40">
                What&apos;s Accepted
              </h2>
              <div className="flex flex-wrap gap-2">
                <AcceptsBadge label="Standard Boxes" accepted />
                <AcceptsBadge
                  label="Bulky Items"
                  accepted={listing.accepts_bulky}
                />
                <AcceptsBadge
                  label="Bikes"
                  accepted={listing.accepts_bikes}
                />
              </div>
            </div>

            {/* House Rules */}
            {listing.rules && (
              <div className="rounded-xl border border-primary/10 bg-white p-5">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary/40">
                  House Rules
                </h2>
                <p className="text-sm leading-relaxed text-primary/70">
                  {listing.rules}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar — Host info + CTA */}
          <div className="space-y-6">
            {/* Host card */}
            <div className="rounded-xl border border-primary/10 bg-white p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary/40">
                Your Host
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {hostInitials}
                </div>
                <div>
                  <p className="font-semibold text-primary">{host.name}</p>
                  {host.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Verified Host
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="sticky top-20 rounded-xl border border-primary/10 bg-white p-5">
              <p className="mb-4 text-sm text-primary/60">
                Interested in this space? Send a booking request to the host.
              </p>
              <ListingBookingCTA
                listingTitle={listing.title}
                listingId={listing.id}
                hostId={listing.host_id}
                hostName={host.name}
                hostPhotoUrl={host.photo_url}
                availabilityStart={listing.availability_start}
                availabilityEnd={listing.availability_end}
                acceptsBulky={listing.accepts_bulky}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AcceptsBadge({
  label,
  accepted,
}: {
  label: string;
  accepted: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        accepted
          ? "bg-green-50 text-green-700"
          : "bg-gray-50 text-gray-400 line-through"
      }`}
    >
      {accepted ? (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {label}
    </span>
  );
}
