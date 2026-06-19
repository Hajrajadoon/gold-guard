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
  const riskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "bg-green-500/20 text-green-400";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400";
      case "HIGH":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Verification History</h2>
        <span className="text-sm text-slate-400">
          {history?.length || 0} Records
        </span>
      </div>

      {!history || history.length === 0 ? (
        <p className="text-slate-500 text-sm">No history yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="py-3 text-left">Asset</th>
                <th className="py-3 text-left">Weight</th>
                <th className="py-3 text-left">Purity</th>
                <th className="py-3 text-left">Score</th>
                <th className="py-3 text-left">Risk</th>
                <th className="py-3 text-left">Tx</th>
                <th className="py-3 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item, i) => (
                <tr key={item.txHash || i} className="border-b border-slate-800">

                  <td className="py-3">{item.asset}</td>
                  <td className="py-3">{item.weight} g</td>
                  <td className="py-3">{item.purity}%</td>
                  <td className="py-3">{item.score}/100</td>

                  <td className="py-3">
                    <span className={`px-2 py-1 rounded ${riskColor(item.risk)}`}>
                      {item.risk}
                    </span>
                  </td>

                  <td className="py-3 text-blue-400">
                    {item.txHash ? (
                      <a
                        href={`https://testnet.cspr.live/deploy/${item.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      "Pending"
                    )}
                  </td>

                  <td className="py-3 text-slate-400">
                    {item.date}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}