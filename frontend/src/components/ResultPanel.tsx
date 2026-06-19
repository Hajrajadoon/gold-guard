import { useState } from "react";
import { generateCertificate } from "../utils/generateCertificate";
import { getDeployInfo } from "../lib/casper/status";
import { useWalletStore } from "../store/walletStore";
import { VerificationResult } from "../types/verification";

type Props = {
  result: VerificationResult;
};

export default function ResultPanel({ result }: Props) {
  const { publicKey } = useWalletStore();
  const [downloading, setDownloading] = useState(false);

  const explorerUrl = (tx: string) =>
    `https://testnet.cspr.live/deploy/${tx}`;

  const onChain =
    !!result.txHash && result.txHash !== "FAILED";

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Pull the live on-chain record (status, block, gas, caller) so the
      // certificate mirrors what cspr.live shows.
      const info = onChain
        ? await getDeployInfo(result.txHash)
        : null;

      generateCertificate({
        asset: result.asset,
        weight: result.weight,
        purity: result.purity,
        score: result.score,
        risk: result.risk,
        network: "Casper Testnet (casper-test)",
        deployHash: onChain ? result.txHash : null,
        blockHash: info?.blockHash ?? null,
        blockHeight: info?.blockHeight ?? null,
        caller: info?.caller ?? publicKey ?? null,
        status: info?.status ?? (onChain ? "Pending" : "Failed"),
        costMotes: info?.costMotes ?? null,
        consumedMotes: info?.consumedMotes ?? null,
        timestamp: info?.timestamp ?? null,
        explorerUrl: onChain ? explorerUrl(result.txHash) : null,
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-vault-800/70 backdrop-blur-sm shadow-vault overflow-hidden">

      <header className="flex items-center justify-between px-6 py-4 border-b border-line">
        <span className="eyebrow">Certificate</span>
        <span className="eyebrow flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: onChain ? "#5DD39E" : "#F2786F" }}
          />
          {onChain ? "On-chain" : "Off-chain"}
        </span>
      </header>

      <div className="p-6 space-y-5">

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-ink font-medium truncate">
              {result.asset || "Unnamed asset"}
            </p>
            <p className="font-mono text-[11px] text-ink-faint tnum mt-1">
              {result.weight}g · {result.purity}% · score {result.score}/100
            </p>
          </div>
          <span
            className="font-mono text-[11px] px-2.5 py-1 rounded border shrink-0"
            style={{
              color:
                result.risk === "HIGH" ? "#F2786F" : result.risk === "MEDIUM" ? "#FBC54B" : "#5DD39E",
              borderColor:
                result.risk === "HIGH" ? "#F2786F55" : result.risk === "MEDIUM" ? "#FBC54B55" : "#5DD39E55",
              background:
                result.risk === "HIGH" ? "#F2786F14" : result.risk === "MEDIUM" ? "#FBC54B14" : "#5DD39E14",
            }}
          >
            {result.risk} RISK
          </span>
        </div>

        {/* Transaction reference */}
        <div className="rounded-xl border border-line bg-vault-900/60 px-4 py-3">
          <p className="eyebrow mb-1.5">Transaction</p>
          {onChain ? (
            <a
              href={explorerUrl(result.txHash)}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-gold-400 hover:text-gold-500 break-all transition-colors"
            >
              {result.txHash}
            </a>
          ) : (
            <p className="font-mono text-xs text-ink-faint">
              Not stored on the blockchain.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 rounded-xl py-3 font-display font-semibold text-vault-900
                       bg-gradient-to-r from-gold-400 to-gold-600 hover:shadow-glow
                       disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {downloading ? "Fetching on-chain data…" : "Download certificate"}
          </button>

          {onChain ? (
            <a
              href={explorerUrl(result.txHash)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center rounded-xl py-3 font-medium text-ink
                         border border-line hover:border-gold-600/60 hover:text-gold-400 transition-colors"
            >
              View on cspr.live ↗
            </a>
          ) : (
            <div className="flex-1 text-center rounded-xl py-3 text-ink-faint border border-line cursor-not-allowed">
              Not on-chain yet
            </div>
          )}
        </div>
      </div>
    </section>
  );
}