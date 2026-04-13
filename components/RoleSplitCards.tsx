export default function RoleSplitCards() {
  return (
    <section className="mx-auto grid max-w-4xl gap-6 px-4 md:grid-cols-2">
      <div className="rounded-xl border border-primary/10 bg-white p-8 text-center shadow-sm">
        <h3 className="text-xl font-bold text-primary">I need storage</h3>
        <p className="mt-2 text-sm text-primary/60">
          Find a trusted local host to store your belongings over the holidays.
        </p>
        <a
          href="/browse"
          className="mt-4 inline-block rounded-lg bg-action px-6 py-2 text-sm font-semibold text-white hover:bg-action/90"
        >
          Browse Hosts
        </a>
      </div>
      <div className="rounded-xl border border-primary/10 bg-white p-8 text-center shadow-sm">
        <h3 className="text-xl font-bold text-primary">I have space</h3>
        <p className="mt-2 text-sm text-primary/60">
          Earn money by offering spare room in your home during the breaks.
        </p>
        <a
          href="/auth"
          className="mt-4 inline-block rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-white hover:bg-accent/90"
        >
          Become a Host
        </a>
      </div>
    </section>
  );
}
