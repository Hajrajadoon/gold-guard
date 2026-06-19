import { useState } from "react";

import StatCard from "../components/StatCard";
import VerificationForm from "../components/VerificationForm";
import ResultPanel from "../components/ResultPanel";
import HistoryTable from "../components/HistoryTable";
import WalletIndicator from "../components/WalletIndicator";
import TxBadge from "../components/TxBadge";

import { useWallet } from "../web3/walletStore";
import { createTransaction } from "../web3/createTransaction";

type HistoryItem = {
  asset: string;
  score: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  date: string;
  txHash: string;
};

type ResultData = {
  asset: string;
  weight: number;
  purity: number;
  score: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  txHash?: string;
} | null;

export default function Home() {
  const { publicKey, walletName, connect } = useWallet();

  const [assetName, setAssetName] = useState("");
  const [weight, setWeight] = useState("");
  const [purity, setPurity] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const connectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const analyzeAsset = () => {
    if (!assetName || !weight || !purity) return;

    setLoading(true);

    setTimeout(() => {
      const w = Number(weight);
      const p = Number(purity);

      const score = Math.min(
        100,
        Math.round(p * 0.7 + (w > 10 ? 30 : 20))
      );

      const risk: "LOW" | "MEDIUM" | "HIGH" =
        score > 80
          ? "LOW"
          : score > 60
          ? "MEDIUM"
          : "HIGH";

      const txHash =
        "cspr_" + Math.random().toString(36).slice(2, 12);

      createTransaction({
        asset: assetName,
        score,
        risk,
        wallet: publicKey,
        isOnChain: !!publicKey,
      });

      const verificationResult = {
        asset: assetName,
        weight: w,
        purity: p,
        score,
        risk,
        txHash,
      };

      setResult(verificationResult);

      setHistory((prev) => [
        {
          asset: assetName,
          score,
          risk,
          date: new Date().toLocaleString(),
          txHash,
        },
        ...prev,
      ]);

      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            🪙 GoldGuard AI
          </h1>

          <p className="text-slate-400">
            AI + Casper Blockchain Verification System
          </p>

          {publicKey && (
            <div className="mt-3 text-green-400 text-sm">
              <p>
                Connected: {walletName}
              </p>

              <p>
                {publicKey.slice(0, 12)}...
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={connectWallet}
            className={`px-5 py-3 rounded-xl font-semibold transition ${
              publicKey
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {publicKey
              ? "🟢 Wallet Connected"
              : "Connect Casper Wallet"}
          </button>

          <WalletIndicator />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Assets" value="128" />
        <StatCard title="Verified" value="112" />
        <StatCard title="AI" value="ONLINE" />
        <StatCard title="Chain" value="CASPER READY" />
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <VerificationForm
          assetName={assetName}
          weight={weight}
          purity={purity}
          loading={loading}
          setAssetName={setAssetName}
          setWeight={setWeight}
          setPurity={setPurity}
          onVerify={analyzeAsset}
        />

        <ResultPanel result={result} />
      </div>

      {/* BLOCKCHAIN BADGE */}
      {publicKey && (
        <div className="mt-6">
          <TxBadge isOnChain />
        </div>
      )}

      {/* HISTORY */}
      <div className="mt-8">
        <HistoryTable history={history} />
      </div>
    </div>
  );
}