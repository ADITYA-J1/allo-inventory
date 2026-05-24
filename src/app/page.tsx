export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 sm:px-8">
        <span
          className="text-sm font-medium tracking-widest uppercase"
          style={{ color: "#1A4A3A" }}
        >
          Allo
        </span>
      </header>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8">
        <div className="max-w-2xl text-center">
          <p className="animate-fade-in-up text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-400 mb-6">
            INVENTORY SYSTEM
          </p>

          <h1
            className="animate-fade-in-up-delay text-4xl sm:text-5xl md:text-6xl leading-[1.1] text-zinc-900"
            style={{ fontFamily: "var(--font-instrument-serif), serif" }}
          >
            Reservation-safe
            <br />
            inventory at scale.
          </h1>

          <p className="animate-fade-in-up-delay-2 mt-6 text-base text-zinc-500 max-w-md mx-auto">
            Concurrency-safe stock holds for multi-warehouse checkout flows.
          </p>

          {/* Feature chips */}
          <div className="animate-fade-in-up-delay-2 mt-8 flex flex-wrap justify-center gap-3">
            {[
              "Prevents overselling",
              "10-min holds",
              "Auto-expiry",
            ].map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-zinc-600"
                style={{ border: "1px solid #E8E8E4" }}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="#1A4A3A"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                {feature}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="animate-fade-in-up-delay-3 mt-10">
            <a
              href="/inventory"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded"
              style={{ backgroundColor: "#1A4A3A" }}
            >
              Launch Demo
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>

      <footer className="px-6 py-6 text-center">
        <p className="text-[11px] text-zinc-400">
          Built for Allo Health Engineering Exercise
        </p>
      </footer>
    </main>
  );
}
