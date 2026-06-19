import { connectWallet, disconnectWallet } from "../wallet";
import { useState } from "react";

export default function WalletIndicator() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    try {
      const pk = await connectWallet();
      setPublicKey(pk);
      setConnected(true);
    } catch (err) {
      console.error(err);
      setConnected(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setPublicKey(null);
    setConnected(false);
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`px-3 py-2 rounded-lg text-sm border ${
          connected
            ? "bg-green-500/10 border-green-500 text-green-400"
            : "bg-red-500/10 border-red-500 text-red-400"
        }`}
      >
        {connected && publicKey
          ? `🟢 ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`
          : "🔴 Not Connected"}
      </div>

      {!connected ? (
        <button
          onClick={handleConnect}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
        >
          Connect
        </button>
      ) : (
        <button
          onClick={handleDisconnect}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}