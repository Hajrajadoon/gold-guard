import {
  DeployUtil,
  CLPublicKey,
  RuntimeArgs,
  CLValueBuilder,
} from "casper-js-sdk";

import { CONTRACT_WASM } from "./wasm";

// Builds a GoldGuard verification deploy.
//
// The WASM runs as session code: its `call()` reads these runtime args and
// stores them under named keys in the caller's account. The args travel with
// the deploy, so asset / weight / purity / score / risk are visible on the
// transaction in any Casper block explorer (e.g. cspr.live).
export const createVerificationDeploy = (
  publicKeyHex: string,
  asset: string,
  weight: number,
  purity: number,
  score: number,
  risk: string
) => {

  const publicKey =
    CLPublicKey.fromHex(
      publicKeyHex
    );

  const deployParams =
    new DeployUtil.DeployParams(
      publicKey,
      "casper-test"
    );

  const wasmBytes =
    Uint8Array.from(
      Buffer.from(
        CONTRACT_WASM,
        "base64"
      )
    );

  const args =
    RuntimeArgs.fromMap({

      asset:
        CLValueBuilder.string(
          asset || "unknown"
        ),

      weight:
        CLValueBuilder.u64(
          Math.max(0, Math.floor(weight || 0))
        ),

      purity:
        CLValueBuilder.u64(
          Math.max(0, Math.floor(purity || 0))
        ),

      score:
        CLValueBuilder.u64(
          Math.max(0, Math.floor(score || 0))
        ),

      risk:
        CLValueBuilder.string(
          risk || "LOW"
        )

    });

  const session =
    DeployUtil.ExecutableDeployItem
    .newModuleBytes(
      wasmBytes,
      args
    );

  // Session/WASM deploys are charged the full payment amount. This contract is
  // small (~17 KB) and only writes a few named keys, so 10 CSPR is comfortable.
  const payment =
    DeployUtil.standardPayment(
      10000000000
    );

  const deploy =
    DeployUtil.makeDeploy(
      deployParams,
      session,
      payment
    );

  return deploy;
};
