import { jsPDF } from "jspdf";

type CertificateData = {
  asset: string;
  weight: number;
  purity: number;
  score: number;
  risk: string;
  wallet?: string | null;
};

export function generateCertificate(data: CertificateData) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("GoldGuard AI Certificate", 20, 20);

  doc.setFontSize(12);
  doc.text(`Asset: ${data.asset}`, 20, 40);
  doc.text(`Weight: ${data.weight}g`, 20, 50);
  doc.text(`Purity: ${data.purity}%`, 20, 60);
  doc.text(`Trust Score: ${data.score}/100`, 20, 70);
  doc.text(`Risk: ${data.risk}`, 20, 80);

  if (data.wallet) {
    doc.text(`Wallet: ${data.wallet}`, 20, 90);
  }

  doc.save(`${data.asset}-certificate.pdf`);
}