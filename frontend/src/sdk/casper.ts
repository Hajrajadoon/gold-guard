import { createVerificationDeploy } from "../lib/casper/deploy";
import { getWalletInstance } from "../wallet";

export async function runAIVerification({
  publicKey,
  asset,
  score,
  risk
}: {
  publicKey: string;
  asset: string;
  score: number;
  risk: string;
}) {
  if (!publicKey) throw new Error("No public key");

  // 1. Create deploy
  const deploy = createVerificationDeploy(
    publicKey,
    asset,
    score,
    risk
  );

  // 2. Get wallet
  const wallet = getWalletInstance();

  // 3. Sign deploy
  const signedDeploy = await wallet.sign(deploy, publicKey);

  // 4. Send deploy
  const result = await wallet.send(signedDeploy);

  return result;
}