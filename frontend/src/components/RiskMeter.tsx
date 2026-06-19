export default function RiskMeter() {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl">

      <h2 className="text-xl font-semibold mb-4">
        AI Risk Analysis
      </h2>

      <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full w-[88%] bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"></div>
      </div>

      <div className="flex justify-between mt-3">
        <span className="text-green-400 text-sm">
          Authenticity Score
        </span>

        <span className="font-bold">
          88%
        </span>
      </div>

      <p className="text-slate-400 mt-4">
        Low risk detected — asset is likely authentic.
      </p>

    </div>
  );
}