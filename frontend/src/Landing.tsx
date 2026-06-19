export default function Landing() {
  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-black via-slate-950 to-slate-900">

      <div className="max-w-6xl mx-auto px-6 py-20 text-center">

        <h1 className="text-5xl font-bold">
          🪙 GoldGuard AI
        </h1>

        <p className="text-slate-400 mt-4">
          AI + Blockchain Gold Verification System on Casper
        </p>

        <div className="mt-10 flex justify-center gap-4">

          <button className="px-6 py-3 bg-blue-600 rounded-xl">
            Get Started
          </button>

          <button className="px-6 py-3 border border-slate-700 rounded-xl">
            View Docs
          </button>

        </div>

      </div>

    </div>
  );
}