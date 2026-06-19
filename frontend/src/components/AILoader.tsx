export default function AILoader() {
  return (
    <div className="p-8 rounded-2xl border border-slate-800 bg-black/40 text-center">

      <div className="animate-pulse text-green-400 text-lg">
        🧠 AI THINKING...
      </div>

      <p className="text-slate-400 text-sm mt-3">
        Analyzing blockchain + gold authenticity patterns
      </p>

      <div className="mt-6 flex justify-center">
        <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>

    </div>
  );
}