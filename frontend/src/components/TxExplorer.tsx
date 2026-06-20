type Props = {
  txHash: string;
};

export default function TxExplorer({ txHash }: Props) {
  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">

      <h3 className="font-semibold text-sm text-slate-300">
        🔗 Blockchain Transaction
      </h3>

      <p className="text-xs text-slate-400 mt-2 break-all">
        {txHash}
      </p>

      <a
       href={`https://testnet.cspr.live/transaction/${txHash}`}
        target="_blank"
        className="text-blue-400 text-xs mt-3 inline-block hover:underline"
      >
        View on Explorer →
      </a>

    </div>
  );
}