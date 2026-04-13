export default function ListingPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-bold text-primary">
          Listing {params.id}
        </h1>
        <p className="mt-2 text-primary/60">Listing details will appear here.</p>
      </div>
    </main>
  );
}
