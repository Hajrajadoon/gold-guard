export type VerificationResult = {
  asset: "gold" | "silver";
  weight: number;
  purity: number;
  score: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  txHash: string;
  date: string;
};