export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type VerificationResult = {
  asset: string;
  weight: number;
  purity: number;
  score: number;
  risk: RiskLevel;
  txHash?: string;
};