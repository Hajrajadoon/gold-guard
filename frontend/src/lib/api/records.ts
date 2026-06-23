import { VerificationResult } from "../../types/verification";

const BASE = "https://acre-pediatric-marauding.ngrok-free.dev";

// Load saved verification records from the server (newest first).
export const getRecords = async (): Promise<VerificationResult[]> => {
  const res = await fetch(`${BASE}/records`);
  if (!res.ok) throw new Error("Failed to load records");
  return (await res.json()) as VerificationResult[];
};

// Persist a single verification record.
export const saveRecord = async (item: VerificationResult): Promise<void> => {
  await fetch(`${BASE}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
};
