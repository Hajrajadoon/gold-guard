import { jsPDF } from "jspdf";

export type CertificateData = {
  asset: string;
  weight: number;
  purity: number;
  score: number;
  risk: string;

  // Casper on-chain data
  network?: string;
  deployHash?: string | null;
  blockHash?: string | null;
  blockHeight?: number | null;
  caller?: string | null;
  status?: string | null; // Success | Failed | Pending
  costMotes?: string | null;
  consumedMotes?: string | null;
  timestamp?: string | null;
  explorerUrl?: string | null;
};

type RGB = [number, number, number];

const motesToCspr = (m?: string | null) =>
  m
    ? (Number(m) / 1e9).toLocaleString(undefined, {
        maximumFractionDigits: 5,
      }) + " CSPR"
    : "—";

export function generateCertificate(data: CertificateData) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  let y = 0;

  // Header band
  doc.setFillColor(11, 16, 32); // #0B1020
  doc.rect(0, 0, pageW, 34, "F");
  doc.setTextColor(245, 197, 24); // gold
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("GoldGuard AI", margin, 16);
  doc.setTextColor(200, 208, 224);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Blockchain Verification Certificate", margin, 25);

  y = 48;

  const sectionTitle = (t: string) => {
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(t, margin, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 2, pageW - margin, y + 2);
    y += 10;
  };

  const row = (
    label: string,
    value: string,
    opts?: { mono?: boolean; color?: RGB }
  ) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(label, margin, y);

    const color = opts?.color ?? ([15, 23, 42] as RGB);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont(opts?.mono ? "courier" : "helvetica", opts?.mono ? "normal" : "bold");
    doc.setFontSize(opts?.mono ? 9 : 11);

    const valX = margin + 42;
    const lines = doc.splitTextToSize(value, pageW - margin - valX);
    doc.text(lines, valX, y);
    y += lines.length * 5 + 3;
  };

  // --- Asset section ---
  sectionTitle("Asset Verification");
  row("Asset", data.asset || "—");
  row("Weight", `${data.weight} g`);
  row("Purity", `${data.purity} %`);
  row("Trust Score", `${data.score} / 100`);
  const riskColor: RGB =
    data.risk === "HIGH"
      ? [220, 38, 38]
      : data.risk === "MEDIUM"
      ? [202, 138, 4]
      : [22, 163, 74];
  row("Risk Level", data.risk, { color: riskColor });

  // --- Blockchain section ---
  y += 6;
  sectionTitle("Blockchain Record");
  row("Network", data.network || "Casper Testnet (casper-test)");
  const statusColor: RGB =
    data.status === "Success"
      ? [22, 163, 74]
      : data.status === "Failed"
      ? [220, 38, 38]
      : [202, 138, 4];
  row("Status", data.status || "Pending", { color: statusColor });
  row("Transaction Hash", data.deployHash || "—", { mono: true });
  row("Block Hash", data.blockHash || "—", { mono: true });
  if (data.blockHeight != null) row("Block Height", String(data.blockHeight));
  row("Caller", data.caller || "—", { mono: true });
  row("Consumed Gas", motesToCspr(data.consumedMotes));
  if (data.timestamp)
    row("Timestamp", new Date(data.timestamp).toLocaleString());

  // --- Footer ---
  const footY = pageH - 20;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footY - 6, pageW - margin, footY - 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  if (data.explorerUrl) {
    doc.textWithLink(
      "Verify on cspr.live: " + data.explorerUrl,
      margin,
      footY,
      { url: data.explorerUrl }
    );
  }
  doc.text("Generated " + new Date().toLocaleString(), margin, footY + 5);

  const safe = (data.asset || "asset").replace(/[^a-z0-9-_]+/gi, "_");
  doc.save(`goldguard-${safe}-certificate.pdf`);
}
