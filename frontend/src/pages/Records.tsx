import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecords } from "../lib/api/records";
import { generateCertificate } from "../utils/generateCertificate";
import { waitForDeployInfo } from "../lib/casper/status";
import { VerificationResult } from "../types/verification";

const riskColor = (risk: string) =>
  risk === "LOW"
    ? "#5DD39E"
    : risk === "MEDIUM"
    ? "#FBC54B"
    : risk === "HIGH"
    ? "#F2786F"
    : "#9AA0AA";

export default function Records() {
  const [records, setRecords] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingTx, setDownloadingTx] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setRecords(await getRecords());
      } catch {
        setError(
          "Couldn't reach the records server. Make sure deploy-server is running on port 4000."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const downloadCertificate = async (r: VerificationResult) => {
    const onChain = r.txHash && r.txHash !== "FAILED";
    setDownloadingTx(r.txHash);
    try {
      const info = onChain ? await waitForDeployInfo(r.txHash) : null;
      generateCertificate({
        asset: r.asset,
        weight: r.weight,
        purity: r.purity,
        score: r.score,
        risk: r.risk,
        network: "Casper Testnet (casper-test)",
        deployHash: onChain ? r.txHash : null,
        blockHash: info?.blockHash ?? null,
        blockHeight: info?.blockHeight ?? null,
        caller: info?.caller ?? null,
        status: info?.status ?? (onChain ? "Pending" : "Failed"),
        costMotes: info?.costMotes ?? null,
        consumedMotes: info?.consumedMotes ?? null,
        timestamp: info?.timestamp ?? null,
        explorerUrl: onChain ? `https://testnet.cspr.live/deploy/${r.txHash}` : null,
      });
    } finally {
      setDownloadingTx(null);
    }
  };

  return (
    <div className="min-h-screen text-ink">

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-line bg-vault-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="text-gold-400 text-lg leading-none">◆</span>
            <div className="leading-none">
              <p className="font-display font-semibold tracking-tight text-ink">GOLDGUARD</p>
              <p className="eyebrow mt-1">Records</p>
            </div>
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg text-sm text-ink border border-line hover:border-gold-600/60 hover:text-gold-400 transition-colors"
          >
            ← Back to assay
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Verification ledger</p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mt-2">
              All records
            </h1>
          </div>
          <span className="font-mono text-sm text-ink-dim tnum shrink-0">
            {records.length} total
          </span>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-verdict-high/40 bg-verdict-high/10 px-4 py-3 text-sm text-verdict-high">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-line bg-vault-800/70 backdrop-blur-sm shadow-vault overflow-hidden">
          {loading ? (
            <p className="px-6 py-16 text-center text-ink-dim text-sm">Loading records…</p>
          ) : records.length === 0 && !error ? (
            <div className="px-6 py-20 text-center">
              <div className="h-10 w-10 mx-auto rounded-full border border-line flex items-center justify-center mb-4">
                <span className="text-gold-600 text-lg">◆</span>
              </div>
              <p className="text-ink text-sm font-medium">No records yet</p>
              <p className="text-ink-faint text-xs mt-1">
                Run an assay on the dashboard and it will be saved here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-line">
                    {["Asset", "Weight", "Purity", "Score", "Risk", "Transaction", "Date", "Certificate"].map((h) => (
                      <th key={h} className="eyebrow font-normal px-6 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => {
                    const onChain = r.txHash && r.txHash !== "FAILED";
                    const color = riskColor(r.risk);
                    return (
                      <tr
                        key={r.txHash || i}
                        className="border-b border-line/60 hover:bg-vault-700/40 transition-colors"
                      >
                        <td className="px-6 py-4 text-ink font-medium">{r.asset || "—"}</td>
                        <td className="px-6 py-4 font-mono tnum text-ink-dim">{r.weight} g</td>
                        <td className="px-6 py-4 font-mono tnum text-ink-dim">{r.purity}%</td>
                        <td className="px-6 py-4 font-mono tnum text-ink">
                          {r.score}
                          <span className="text-ink-faint text-xs">/100</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="font-mono text-[10px] px-2 py-0.5 rounded border"
                            style={{ color, borderColor: `${color}55`, background: `${color}14` }}
                          >
                            {r.risk}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {onChain ? (
                            <a
                              href={`https://testnet.cspr.live/deploy/${r.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-[11px] text-gold-400/80 hover:text-gold-400 transition-colors"
                            >
                              {r.txHash.slice(0, 8)}…{r.txHash.slice(-6)} ↗
                            </a>
                          ) : (
                            <span className="font-mono text-[11px] text-ink-faint">not on-chain</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-ink-faint whitespace-nowrap">
                          {r.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => downloadCertificate(r)}
                            disabled={downloadingTx === r.txHash}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-vault-900
                                       bg-gradient-to-r from-gold-400 to-gold-600 hover:shadow-glow
                                       disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                          >
                            {downloadingTx === r.txHash ? "Working…" : "PDF"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
