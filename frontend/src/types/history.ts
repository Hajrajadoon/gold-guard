export type HistoryItem = {
  asset: string;
  weight: number;
  purity: number;
  score: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  txHash?: string;
  date: string;
};