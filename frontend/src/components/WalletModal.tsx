import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<void>;
};

export default function WalletModal({
  isOpen,
  onClose,
  onConnect,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async () => {
    try {
      setLoading(true);
      await onConnect();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const walletInstalled =
    typeof window !== "undefined" &&
    (window as any).CasperWalletProvider;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">

      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6">

        <h2 className="text-2xl font-bold mb-2">
          Connect Wallet
        </h2>

        <p className="text-slate-400 mb-6">
          Connect your Casper Wallet to verify assets on-chain.
        </p>

        {!walletInstalled ? (
          <div className="space-y-4">

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              Casper Wallet not detected.
            </div>

            <a
              href="https://www.casperwallet.io/"
              target="_blank"
              rel="noreferrer"
              className="block text-center bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl"
            >
              Install Casper Wallet
            </a>

          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold"
          >
            {loading
              ? "Connecting..."
              : "Connect Casper Wallet"}
          </button>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full border border-slate-700 py-3 rounded-xl"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}