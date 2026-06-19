import { useState } from "react";

import Navbar from "./Navbar";
import StatCard from "./StatCard";
import RiskMeter from "./RiskMeter";
import TxBadge from "./TxBadge";
import ResultPanel from "./ResultPanel";
import HistoryTable from "./HistoryTable"; // ✅ FIX 1
import VerificationForm from "./VerificationForm";
declare global {
  interface Window {
    CasperWalletProvider?: any;
  }
}

const getWallet = () => {
  if (!window.CasperWalletProvider) {
    throw new Error("Casper Wallet not installed");
  }

  return window.CasperWalletProvider({
    timeout: 30 * 60 * 1000,
  });
};

export const connectWallet = async () => {
  const wallet = getWallet();
  await wallet.requestConnection();
  return wallet.getActivePublicKey();
};

export const signAndSendDeploy = async (deploy: any) => {
  const wallet = getWallet();

  const signed = await wallet.signDeploy(deploy);
  const result = await wallet.putDeploy(signed);

  return {
    hash: result?.deployHash,
    raw: result,
  };
};

export const disconnectWallet = async () => {
  const wallet = getWallet();
  return wallet.disconnectFromSite();
};

import { HistoryItem } from "../types/history"; // already correct

export default function DashboardCard() {
  const [assetName, setAssetName] = useState("");
  const [weight, setWeight] = useState("");
  const [purity, setPurity] = useState("");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<any>(null);

  // ✅ FIX 2: strongly typed history
  const history: HistoryItem[] = [
    {
      asset: "Gold Bar A1",
      weight: 100,
      purity: 99,
      score: 92,
      risk: "LOW",
      txHash: "",
      date: "2026-06-06",
    },
    {
      asset: "Gold Coin B2",
      weight: 50,
      purity: 85,
      score: 66,
      risk: "MEDIUM",
      txHash: "",
      date: "2026-06-05",
    },
  ];

  const onVerify = () => {
    setLoading(true);

    setTimeout(() => {
      setResult({
        asset: assetName,
        weight: Number(weight),
        purity: Number(purity),
        score: 88,
        risk: "LOW",
      });

      setLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      <Navbar />

      <div className="grid grid-cols-3 gap-4 mt-6">

  <StatCard title="Score" value="88" />

  <StatCard title="Risk" value="Low" />

  <StatCard
    title="Wallet"
    value={<TxBadge isOnChain={false} />}
  />

</div>

      <div className="mt-6">
        <RiskMeter />
      </div>

      <VerificationForm
        assetName={assetName}
        weight={weight}
        purity={purity}
        loading={loading}
        setAssetName={setAssetName}
        setWeight={setWeight}
        setPurity={setPurity}
        onVerify={onVerify}
      />

      <ResultPanel result={result} />

      <div className="mt-8">
        <HistoryTable history={history} />
      </div>

    </div>
  );
}