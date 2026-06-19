import {
  DeployUtil,
  CLPublicKey,
  RuntimeArgs,
  CLValueBuilder,
} from "casper-js-sdk";

import { CONTRACT_WASM } from "./wasm";

export const createVerificationDeploy = (
  publicKeyHex: string,
  asset: string,
  score: number,
  risk: string,
  contractHash?: string
) => {

  console.log("SDK CHECK", {
    DeployUtil,
    CLPublicKey,
    RuntimeArgs,
    CLValueBuilder
  });

  const publicKey =
    CLPublicKey.fromHex(
      publicKeyHex
    );

  const deployParams =
    new DeployUtil.DeployParams(
      publicKey,
      "casper-test"
    );

  let session;

  if (!contractHash) {

    console.log(
      "CREATING WASM DEPLOY"
    );

    const wasmBytes =
      Uint8Array.from(
        Buffer.from(
          CONTRACT_WASM,
          "base64"
        )
      );

    session =
      DeployUtil.ExecutableDeployItem
      .newModuleBytes(
        wasmBytes,
        RuntimeArgs.fromMap({})
      );

  } else {

    console.log(
      "CREATING CONTRACT CALL"
    );

    const args =
      RuntimeArgs.fromMap({

        asset:
          CLValueBuilder.string(
            asset || "unknown"
          ),

        score:
          CLValueBuilder.u64(
            Math.floor(score || 0)
          ),

        risk:
          CLValueBuilder.string(
            risk || "LOW"
          )

      });

    session =
      DeployUtil.ExecutableDeployItem
      .newStoredContractByHash(

        Uint8Array.from(
          Buffer.from(
            contractHash.replace(
              "hash-",
              ""
            ),
            "hex"
          )
        ),

        "verify",

        args

      );

  }

 const payment =
  DeployUtil.standardPayment(
    20000000000
  );

  const deploy =
    DeployUtil.makeDeploy(
      deployParams,
      session,
      payment
    );

  console.log(
    "DEPLOY CREATED:",
    deploy
  );

  // ADD THIS
  console.log(
    "DEPLOY JSON:",
    JSON.stringify(
      DeployUtil.deployToJson(deploy),
      null,
      2
    )
  );

  return deploy;
};