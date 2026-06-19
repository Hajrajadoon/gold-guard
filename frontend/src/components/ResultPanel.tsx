import { generateCertificate } from "../utils/generateCertificate";
import { useWalletStore } from "../store/walletStore";
import { VerificationResult } from "../types/verification";

type Props = {
  result: VerificationResult;
};

export default function ResultPanel({ result }: Props) {
  const { publicKey } = useWalletStore();

  const explorerUrl = (tx: string) =>
    `https://testnet.cspr.live/deploy/${tx}`;

  const handleDownload = () => {
    generateCertificate({
      asset: result.asset,
      score: result.score,
      risk: result.risk,
      weight: result.weight,
      purity: result.purity,
      wallet: publicKey ?? "UNKNOWN",
    });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8">

      <h2 className="text-xl font-semibold mb-6">
        Verification Result
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <div className="bg-slate-950 p-4 rounded-xl">
          <p className="text-slate-400 text-sm">Asset</p>
          <p className="font-semibold">{result.asset}</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl">
          <p className="text-slate-400 text-sm">Weight</p>
          <p className="font-semibold">{result.weight}g</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl">
          <p className="text-slate-400 text-sm">Purity</p>
          <p className="font-semibold">{result.purity}%</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl">
          <p className="text-slate-400 text-sm">Score</p>
          <p className="font-bold text-green-400">
            {result.score}/100
          </p>
        </div>

      </div>

      <div className="mt-6">
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            result.risk === "HIGH"
              ? "bg-red-500/20 text-red-400"
              : result.risk === "MEDIUM"
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-green-500/20 text-green-400"
          }`}
        >
          {result.risk} RISK
        </span>
      </div>

      <div className="mt-6 flex gap-3 flex-wrap">

        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
        >
          📄 Download Certificate
        </button>

        {result.txHash ? (
          <a
            href={explorerUrl(result.txHash)}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            🔗 View Blockchain Record
          </a>
        ) : (
          <div className="px-4 py-2 bg-slate-800 text-slate-500 rounded-lg">
            🔗 Not stored on blockchain yet
          </div>
        )}

      </div>
    </div>
  );
}