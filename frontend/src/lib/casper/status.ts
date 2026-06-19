// Fetches a deploy's on-chain status/execution result from the Casper node
// (via the local deploy-server proxy) so it can be shown on the certificate.

export type DeployInfo = {
  deployHash: string;
  status: "Success" | "Failed" | "Pending";
  blockHash: string | null;
  blockHeight: number | null;
  caller: string | null;
  costMotes: string | null;
  consumedMotes: string | null;
  timestamp: string | null;
  errorMessage: string | null;
};

export const getDeployInfo = async (
  hash: string
): Promise<DeployInfo> => {

  const info: DeployInfo = {
    deployHash: hash,
    status: "Pending",
    blockHash: null,
    blockHeight: null,
    caller: null,
    costMotes: null,
    consumedMotes: null,
    timestamp: null,
    errorMessage: null,
  };

  try {

    const res = await fetch(
      "http://localhost:4000/deploy-info",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      }
    );

    const json = await res.json();
    const r = json?.result ?? json;

    // Deploy header — available as soon as the node knows the deploy.
    const header = r?.deploy?.header;
    if (header) {
      info.caller = header.account ?? null;
      info.timestamp = header.timestamp ?? null;
    }

    // Casper 2.0 execution info.
    const exec = r?.execution_info;
    if (exec) {
      info.blockHash = exec.block_hash ?? null;
      info.blockHeight = exec.block_height ?? null;

      const er = exec.execution_result ?? {};
      const v2 = er.Version2;
      const v1 = er.Version1;

      if (v2) {
        info.costMotes = v2.cost ?? null;
        info.consumedMotes = v2.consumed ?? null;
        info.errorMessage = v2.error_message ?? null;
        info.status = v2.error_message ? "Failed" : "Success";
      } else if (v1) {
        const success = v1.Success;
        const failure = v1.Failure;
        info.costMotes = (success?.cost ?? failure?.cost) ?? null;
        info.errorMessage = failure?.error_message ?? null;
        info.status = success ? "Success" : failure ? "Failed" : "Pending";
      }
    }

    // Legacy execution_results array (older nodes).
    const legacy = r?.execution_results;
    if (Array.isArray(legacy) && legacy.length) {
      const first = legacy[0];
      info.blockHash = info.blockHash ?? first.block_hash ?? null;

      const success = first.result?.Success;
      const failure = first.result?.Failure;
      if (success || failure) {
        info.costMotes = info.costMotes ?? (success?.cost ?? failure?.cost) ?? null;
        info.errorMessage = failure?.error_message ?? null;
        info.status = success ? "Success" : "Failed";
      }
    }

    return info;

  } catch {
    // Server down or deploy not yet known — return what we have.
    return info;
  }
};

// Polls until the deploy is finalized (Success/Failed) or the attempts run
// out. Casper testnet usually finalizes within ~30-90s, so a deploy downloaded
// right after signing would otherwise read "Pending".
export const waitForDeployInfo = async (
  hash: string,
  opts: {
    tries?: number;
    intervalMs?: number;
    onTick?: (attempt: number, tries: number) => void;
  } = {}
): Promise<DeployInfo> => {
  const tries = opts.tries ?? 12;       // ~33s total
  const intervalMs = opts.intervalMs ?? 3000;

  let info = await getDeployInfo(hash);

  for (let attempt = 1; attempt < tries && info.status === "Pending"; attempt++) {
    opts.onTick?.(attempt, tries);
    await new Promise((r) => setTimeout(r, intervalMs));
    info = await getDeployInfo(hash);
  }

  return info;
};
