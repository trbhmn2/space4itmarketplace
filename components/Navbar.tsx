export default function Navbar() {
  return (
    <nav className="border-b border-primary/10 bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <span className="text-xl font-bold text-primary">Space4It</span>
        <div className="flex items-center gap-6 text-sm text-primary/70">
          <a href="/browse" className="hover:text-primary">
            Browse
          </a>
          <a href="/auth" className="hover:text-primary">
            Sign In
          </a>
        </div>
      </div>
    </nav>
  );
}
