import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Sticky Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <img src="/logo.png" alt="LEAP" className="h-8 w-auto" />
        <button className="border border-gray-300 text-gray-700 rounded-full px-5 py-2 text-sm font-semibold hover:bg-gray-50 transition-all duration-200">
          Sign In
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <p className="text-sm font-semibold tracking-widest uppercase text-[#8B1FA8] mb-4">
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
            className="bg-[#8B1FA8] text-white rounded-full px-8 py-3 font-semibold hover:bg-[#6a177f] transition-all duration-200 shadow-sm"
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
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8B1FA8]/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#8B1FA8]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[#1A1A2E]">AI-Powered Planning</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Every request is reviewed and scoped by the LEAP planning agent.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8B1FA8]/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#8B1FA8]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[#1A1A2E]">Real-Time Visibility</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              See demand, capacity, and pipeline across all Business Units.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8B1FA8]/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#8B1FA8]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
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
