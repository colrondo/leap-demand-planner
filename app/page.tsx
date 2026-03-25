import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Sticky Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight text-[#1A1A2E]">LEAP</span>
        <button className="border border-gray-300 text-gray-700 rounded-full px-5 py-2 text-sm font-semibold hover:bg-gray-50 transition-all duration-200">
          Sign In
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <p className="text-sm font-semibold tracking-widest uppercase text-[#CC0066] mb-4">
          Bristol Myers Squibb · LEAP Program
        </p>
        <h1 className="text-5xl font-bold text-[#1A1A2E] leading-tight mb-6 max-w-2xl">
          Learning Demand,{' '}
          <br />
          Simplified.
        </h1>
        <p className="text-xl text-gray-500 max-w-lg leading-relaxed mb-10">
          Plan, track, and prioritize learning initiatives across all Business Units — powered by AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            href="/dashboard"
            className="bg-[#CC0066] text-white rounded-full px-8 py-3 font-semibold hover:bg-[#aa0055] transition-all duration-200 shadow-sm"
          >
            View Dashboard
          </Link>
          <Link
            href="/new-entry"
            className="border border-gray-300 text-gray-700 rounded-full px-8 py-3 font-semibold hover:bg-gray-50 transition-all duration-200"
          >
            Submit a Request
          </Link>
        </div>
      </main>

      {/* Feature Highlights */}
      <section className="bg-gray-50 border-t border-gray-100 px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl">🎯</span>
            <h3 className="text-base font-semibold text-[#1A1A2E]">AI-Powered Planning</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Every request is reviewed and scoped by the LEAP planning agent.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl">📊</span>
            <h3 className="text-base font-semibold text-[#1A1A2E]">Real-Time Visibility</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              See demand, capacity, and pipeline across all Business Units.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl">⚡</span>
            <h3 className="text-base font-semibold text-[#1A1A2E]">Fast Intake</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Submit a learning request in under 2 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center">
        <p className="text-xs text-gray-400">
          learning@BMS · LEAP Demand Planning · Powered by Accenture
        </p>
      </footer>
    </div>
  )
}
