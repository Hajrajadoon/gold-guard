export type VerificationInput = {
  asset: string;
  weight: number;
  purity: number;
};

export type VerificationResult = {
  score: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  explanation: string[];
};

export class GoldGuardAgent {
  static async analyze(
    input: VerificationInput
  ): Promise<VerificationResult> {
    const score = Math.min(
      100,
      Math.round(input.purity * 0.7 + (input.weight > 10 ? 30 : 20))
    );

    const risk =
      score > 80
        ? "LOW"
        : score > 60
        ? "MEDIUM"
        : "HIGH";

    const explanation = [];

    if (input.purity > 90) {
      explanation.push("Purity within premium gold range");
    }

    if (input.weight > 10) {
      explanation.push("Weight appears commercially realistic");
    }

    if (risk === "LOW") {
      explanation.push("No suspicious fraud indicators detected");
    }

    if (risk === "MEDIUM") {
      explanation.push("Some verification concerns detected");
    }

    if (risk === "HIGH") {
      explanation.push("Potential fraud indicators detected");
    }

    return {
      score,
      risk,
      explanation,
    };
  }
}