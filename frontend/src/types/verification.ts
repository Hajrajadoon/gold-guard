export type VerificationResult = {
  asset: string;
  weight: number;
  purity: number;
  score: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  txHash: string;
  date: string;
};