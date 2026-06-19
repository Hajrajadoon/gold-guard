import { useState } from "react";
import { useWalletStore } from "../store/walletStore";
import { connectWallet, disconnectWallet } from "../wallet";

export default function Navbar() {
  const { isConnected, publicKey, setConnected, setPublicKey, reset } =
    useWalletStore();

  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);

      const key = await connectWallet();

      setConnected(true);
      setPublicKey(key);
    } catch (err) {
      console.error("Wallet connect failed:", err);
      alert("Casper Wallet not found or user rejected connection");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (err) {
      console.error("Disconnect failed:", err);
    } finally {
      reset();
    }
  };

  const formatKey = (key?: string) => {
    if (!key) return "";
    return `${key.slice(0, 8)}...${key.slice(-6)}`;
  };

  return (
    <div className="flex justify-between items-center py-5 border-b border-slate-800">
      {/* LOGO */}
      <h1 className="text-xl font-bold text-white">
        GoldGuard AI
      </h1>

      {/* WALLET SECTION */}
      {isConnected && publicKey ? (
        <div className="flex gap-3 items-center">
          <span className="text-green-400 text-sm">
            {formatKey(publicKey)}
          </span>

          <button
            onClick={handleDisconnect}
            className="px-3 py-1 bg-red-600 rounded"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 rounded text-white"
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}