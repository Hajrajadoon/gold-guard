import { create } from "zustand";

interface WalletState {
  isConnected: boolean;
  publicKey: string | null;

  setConnected: (v: boolean) => void;
  setPublicKey: (key: string | null) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  publicKey: null,

  setConnected: (v) => set({ isConnected: v }),
  setPublicKey: (key) => set({ publicKey: key }),

  reset: () => set({ isConnected: false, publicKey: null }),
}));