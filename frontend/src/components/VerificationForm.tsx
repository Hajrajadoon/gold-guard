type VerificationFormProps = {
  assetName: string;
  weight: string;
  purity: string;
  loading: boolean;
  setAssetName: (value: string) => void;
  setWeight: (value: string) => void;
  setPurity: (value: string) => void;
  onVerify: () => void;
};

export default function VerificationForm({
  assetName,
  weight,
  purity,
  loading,
  setAssetName,
  setWeight,
  setPurity,
  onVerify,
}: VerificationFormProps) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8">

      <h2 className="text-2xl font-bold mb-6">
        Verify Gold Asset
      </h2>

      <div className="space-y-5">

        <input
          type="text"
          placeholder="Asset Name"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none"
        />

        <input
          type="number"
          placeholder="Weight (grams)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none"
        />

        <input
          type="number"
          placeholder="Purity (%)"
          value={purity}
          onChange={(e) => setPurity(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none"
        />

        <button
          onClick={onVerify}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] transition font-semibold"
        >
          {loading ? "Analyzing + Writing to Blockchain..." : "Run AI Verification"}
        </button>

      </div>

    </div>
  );
}