import RoleSplitCards from "@/components/RoleSplitCards";

const trustIndicators = [
  {
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
        />
      </svg>
    ),
    title: "St Andrews Students Only",
    description: "Verified university email required to join the platform",
  },
  {
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
        />
      </svg>
    ),
    title: "Verified Hosts",
    description: "Every host is identity-checked and reviewed by the community",
  },
  {
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
        />
      </svg>
    ),
    title: "Secure Payments",
    description: "Split payments with deposit protection and payout guarantees",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 pt-20 md:pb-24 md:pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.05]" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/[0.06] blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-action/[0.06] blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm font-medium text-accent">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
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
            University of St Andrews
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl">
            Student Storage
            <br />
            <span className="text-action">Made Simple</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary/60 md:text-xl">
            The peer-to-peer marketplace where St Andrews students store their
            belongings with trusted local hosts — affordable, flexible, and
            right around the corner.
          </p>
        </div>
      </section>

      {/* Role Split Cards */}
      <section className="pb-20">
        <RoleSplitCards />
      </section>

      {/* Trust Indicators */}
      <section className="border-t border-primary/5 bg-white/50 py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold text-primary md:text-3xl">
            Why students trust Space4It
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {trustIndicators.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-primary/60">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/5 bg-primary py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <span className="text-xl font-black text-white">Space4It</span>
              <p className="mt-1 text-sm text-white/50">
                Student storage for the University of St Andrews
              </p>
            </div>
            <div className="flex gap-8 text-sm text-white/50">
              <a href="/browse" className="transition-colors hover:text-white">
                Browse
              </a>
              <a href="#" className="transition-colors hover:text-white">
                How it Works
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Pricing
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/30">
            &copy; {new Date().getFullYear()} Space4It. Built by St Andrews
            students, for St Andrews students.
          </div>
        </div>
      </footer>
    </main>
  );
}
