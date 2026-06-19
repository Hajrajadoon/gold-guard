import { VerificationResult } from "../types/verification";

type Props = {
  result: VerificationResult | null;
};

const RADIUS = 82;
const STROKE = 12;
const CIRC = 2 * Math.PI * RADIUS;
const SWEEP = 0.75; // 270° instrument arc
const ARC = CIRC * SWEEP;

const verdict = (risk?: string) => {
  switch (risk) {
    case "LOW":
      return { label: "Authentic", tone: "text-verdict-low", ring: "#5DD39E", note: "No fraud indicators detected." };
    case "MEDIUM":
      return { label: "Inconclusive", tone: "text-verdict-med", ring: "#FBC54B", note: "Some verification concerns found." };
    case "HIGH":
      return { label: "Suspect", tone: "text-verdict-high", ring: "#F2786F", note: "Potential fraud indicators present." };
    default:
      return { label: "—", tone: "text-ink-faint", ring: "#23262B", note: "Run an assay to read a result." };
  }
};

export default function AssayResult({ result }: Props) {
  const score = result?.score ?? 0;
  const v = verdict(result?.risk);

  // Filled portion of the 270° arc.
  const offset = ARC - (Math.min(100, Math.max(0, score)) / 100) * ARC;

  return (
    <section className="rounded-2xl border border-line bg-vault-800/70 backdrop-blur-sm shadow-vault overflow-hidden">

      <header className="flex items-center justify-between px-6 py-4 border-b border-line">
        <span className="eyebrow">Assay Result</span>
        <span className="eyebrow flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: result ? v.ring : "#2E323A" }}
          />
          {result ? "Reading" : "Idle"}
        </span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 p-7">

        {/* The gauge — purity dial */}
        <div className="relative mx-auto" style={{ width: 208, height: 208 }}>
          <svg width="208" height="208" viewBox="0 0 208 208" className="block">
            <defs>
              <linearGradient id="goldArc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F6C744" />
                <stop offset="100%" stopColor="#C9971F" />
              </linearGradient>
            </defs>
            <g transform="rotate(135 104 104)">
              {/* track */}
              <circle
                cx="104"
                cy="104"
                r={RADIUS}
                fill="none"
                stroke="#1F2329"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${ARC} ${CIRC}`}
              />
              {/* value */}
              <circle
                className="gauge-arc"
                cx="104"
                cy="104"
                r={RADIUS}
                fill="none"
                stroke={result ? "url(#goldArc)" : "#23262B"}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${ARC} ${CIRC}`}
                strokeDashoffset={offset}
              />
            </g>
          </svg>

          {/* center readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono tnum text-[56px] leading-none text-ink font-medium">
              {result ? score : "—"}
            </span>
            <span className="font-mono text-xs text-ink-faint mt-1 tracking-wider">
              / 100
            </span>
            <span className="eyebrow mt-3">Trust Score</span>
          </div>
        </div>

        {/* Verdict + authenticity */}
        <div className="flex flex-col justify-center gap-5 min-w-0">
          <div>
            <p className="eyebrow mb-2">Verdict</p>
            <div className="flex items-baseline gap-3">
              <h2 className={`font-display text-3xl font-semibold ${v.tone}`}>
                {v.label}
              </h2>
              {result && (
                <span
                  className="font-mono text-[11px] px-2 py-0.5 rounded border"
                  style={{ color: v.ring, borderColor: `${v.ring}55`, background: `${v.ring}14` }}
                >
                  {result.risk} RISK
                </span>
              )}
            </div>
            <p className="text-sm text-ink-dim mt-2 max-w-sm">{v.note}</p>
          </div>

          {/* authenticity bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="eyebrow">Authenticity</span>
              <span className="font-mono tnum text-sm text-champagne">
                {result ? `${score}%` : "—"}
              </span>
            </div>
            <div className="h-2 rounded-full bg-vault-700 overflow-hidden">
              <div
                className="gauge-arc h-full rounded-full"
                style={{
                  width: `${result ? score : 0}%`,
                  background: "linear-gradient(90deg, #C9971F, #F6C744)",
                }}
              />
            </div>
          </div>

          {/* on-chain status strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-line">
            <Stat label="Asset" value={result?.asset || "—"} />
            <Stat label="Weight" value={result ? `${result.weight} g` : "—"} mono />
            <Stat label="Purity" value={result ? `${result.purity}%` : "—"} mono />
            <OnChain txHash={result?.txHash} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="eyebrow mb-1">{label}</p>
      <p className={`text-sm text-ink truncate ${mono ? "font-mono tnum" : ""}`}>{value}</p>
    </div>
  );
}

function OnChain({ txHash }: { txHash?: string }) {
  const onChain = !!txHash && txHash !== "FAILED";
  return (
    <div className="ml-auto">
      <p className="eyebrow mb-1">On-chain</p>
      {onChain ? (
        <a
          href={`https://testnet.cspr.live/deploy/${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-sm text-gold-400 hover:text-gold-500 transition-colors"
        >
          {txHash.slice(0, 6)}…{txHash.slice(-4)} ↗
        </a>
      ) : (
        <p className="text-sm text-ink-faint">Not recorded</p>
      )}
    </div>
  );
}
