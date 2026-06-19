type HistoryItem = {
  asset: string;
  weight: number;
  purity: number;
  score: number;
  risk: string;
  txHash: string;
  date: string;
};

type Props = {
  history: HistoryItem[];
};

export default function HistoryTable({ history }: Props) {
  const riskTone = (risk: string) => {
    switch (risk) {
      case "LOW":
        return { color: "#5DD39E" };
      case "MEDIUM":
        return { color: "#FBC54B" };
      case "HIGH":
        return { color: "#F2786F" };
      default:
        return { color: "#9AA0AA" };
    }
  };

  const count = history?.length || 0;

  return (
    <section className="rounded-2xl border border-line bg-vault-800/70 backdrop-blur-sm shadow-vault overflow-hidden h-full flex flex-col">

      <header className="flex items-center justify-between px-6 py-4 border-b border-line">
        <span className="eyebrow">Verification Ledger</span>
        <span className="font-mono text-xs text-ink-dim tnum">
          {String(count).padStart(2, "0")} {count === 1 ? "record" : "records"}
        </span>
      </header>

      {count === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
          <div className="h-10 w-10 rounded-full border border-line flex items-center justify-center mb-4">
            <span className="text-gold-600 text-lg">◆</span>
          </div>
          <p className="text-ink text-sm font-medium">No assays yet</p>
          <p className="text-ink-faint text-xs mt-1 max-w-[16rem]">
            Run a verification and each certified result will be logged here.
          </p>
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto divide-y divide-line">
          {history.map((item, i) => {
            const tone = riskTone(item.risk);
            const onChain = item.txHash && item.txHash !== "FAILED";
            return (
              <li
                key={item.txHash || i}
                className="px-6 py-4 hover:bg-vault-700/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-ink font-medium truncate">
                      {item.asset || "Unnamed asset"}
                    </p>
                    <p className="font-mono text-[11px] text-ink-faint tnum mt-0.5">
                      {item.weight}g · {item.purity}% · {item.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono tnum text-base text-ink">
                      {item.score}
                      <span className="text-ink-faint text-xs">/100</span>
                    </span>
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 rounded border"
                      style={{
                        color: tone.color,
                        borderColor: `${tone.color}55`,
                        background: `${tone.color}14`,
                      }}
                    >
                      {item.risk}
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  {onChain ? (
                    <a
                      href={`https://testnet.cspr.live/deploy/${item.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] text-gold-400/80 hover:text-gold-400 transition-colors"
                    >
                      {item.txHash.slice(0, 10)}…{item.txHash.slice(-6)} ↗
                    </a>
                  ) : (
                    <span className="font-mono text-[11px] text-ink-faint">
                      not recorded on-chain
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
