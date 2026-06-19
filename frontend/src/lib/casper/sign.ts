export async function signDeploy(provider: any, deploy: any) {
  try {
    if (!provider) throw new Error("Wallet not found");

    const signed = await provider.sign(deploy);

    return signed;
  } catch (err) {
    console.error("Sign error:", err);
    throw err;
  }
}