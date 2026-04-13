import Link from "next/link";

export default function CreateListingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-primary">Create New Listing</h1>
        <p className="mt-2 text-primary/60">
          This feature is coming soon. You&apos;ll be able to list your spare
          space for students to store their belongings.
        </p>
        <Link
          href="/dashboard/host"
          className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
