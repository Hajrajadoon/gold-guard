import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AssayResult from "../components/AssayResult";
import ResultPanel from "../components/ResultPanel";
import HistoryTable from "../components/HistoryTable";
import VerificationForm from "../components/VerificationForm";

import {
  DeployUtil,
  CLPublicKey
} from "casper-js-sdk";

import { createVerificationDeploy } from "../lib/casper/deploy";

import {
  connectWallet,
  disconnectWallet,
  getProvider,
  getWalletInstance
} from "../wallet";

import { sendDeploy } from "../lib/casper/send";

import { VerificationResult } from "../types/verification";

import { getRecords, saveRecord } from "../lib/api/records";


export default function Dashboard() {


  const [assetName, setAssetName] =
    useState("");

  const [weight, setWeight] =
    useState("");

  const [purity, setPurity] =
    useState("");


  const [wallet, setWallet] =
    useState<string | null>(null);


  const [result, setResult] =
    useState<VerificationResult | null>(null);


  const [history, setHistory] =
    useState<VerificationResult[]>([]);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState<string | null>(null);



  useEffect(() => {

    // Load from the database; fall back to the local cache if the
    // server is unreachable.
    (async () => {
      try {
        const rows = await getRecords();
        setHistory(rows);
      } catch {
        const saved = localStorage.getItem("gg_history");
        if (saved) {
          setHistory(JSON.parse(saved));
        }
      }
    })();

  }, []);



  useEffect(() => {

    localStorage.setItem(
      "gg_history",
      JSON.stringify(history)
    );

  }, [history]);




  const calculateScore = (
    w:number,
    p:number
  ) => {


    const safeW =
      Number.isFinite(w)
      ? w
      : 0;


    const safeP =
      Number.isFinite(p)
      ? p
      : 0;


    return Math.min(
      100,
      Math.round(
        safeP * 0.8 +
        (safeW > 50 ? 15 : 5)
      )
    );

  };




  const calculateRisk =
  (
    score:number
  ):
  "LOW"|"MEDIUM"|"HIGH" => {


    if(score > 80)
      return "LOW";


    if(score > 60)
      return "MEDIUM";


    return "HIGH";

  };




  const handleConnect = async () => {

    try {

      const pk =
        await connectWallet();


      setWallet(pk);

      setError(null);


    } catch(e:any){

      setError(
        e?.message ||
        "Wallet connection failed"
      );

    }

  };




  const handleDisconnect = async () => {

    try {

      await disconnectWallet();

      setWallet(null);

      setResult(null);


    } catch(e){

      console.error(
        "Disconnect failed",
        e
      );

    }

  };


const onVerify = async () => {

  setLoading(true);
  setError(null);

  try {

    let activeWallet:string =
      wallet || "";


    if(!activeWallet){

      activeWallet =
        await connectWallet();

      setWallet(activeWallet);

    }


    activeWallet =
      activeWallet.trim();



    const w =
      parseFloat(
        weight || "0"
      );


    const p =
      parseFloat(
        purity || "0"
      );


    const score =
      calculateScore(
        w,
        p
      );


    const risk =
      calculateRisk(
        score
      );



    let txHash:string | null =
      null;



    try {


      const provider =
        getProvider();


      console.log(
        "PROVIDER",
        provider
      );


      if(
        !provider ||
        typeof provider.sign !== "function"
      ){

        throw new Error(
          "Casper Wallet signing unavailable"
        );

      }



      const deploy =
        createVerificationDeploy(
          activeWallet,
          assetName,
          w,
          p,
          score,
          risk
        );



      console.log(
        "DEPLOY OBJECT:",
        deploy
      );



      const deployJson:any =
        DeployUtil.deployToJson(
          deploy
        );



      console.log(
        "DEPLOY JSON:",
        deployJson
      );



      console.log(
        "ACTIVE WALLET:",
        activeWallet
      );



      console.log(
        "DEPLOY ACCOUNT:",
        deployJson.deploy.header.account
      );



      console.log(
        "EQUAL?",
        activeWallet.toLowerCase() ===
        deployJson.deploy.header.account.toLowerCase()
      );



      const wallet =
        getWalletInstance();



      if(
        !wallet ||
        typeof wallet.sign !== "function"
      ){

        throw new Error(
          "Wallet signing unavailable"
        );

      }


const deployHash =
  deployJson.deploy.hash;

console.log(
  "DEPLOY HASH:",
  deployHash
);

console.log(
  "DEPLOY JSON:",
  JSON.stringify(
    deployJson,
    null,
    2
  )
);

const signed =
  await wallet.sign(
    JSON.stringify(deployJson),
    activeWallet
  );

console.log(
  "SIGNED OBJECT FROM WALLET:",
  signed
);

if(signed?.cancelled){

  throw new Error(
    "Signing was cancelled in the wallet"
  );

}

if(
  !signed ||
  !signed.signatureHex
){

  throw new Error(
    "Wallet did not return signature"
  );

}

// Raw signature bytes from the wallet (no algorithm prefix).
const signatureBytes =
  signed.signature instanceof Uint8Array
  ?
  signed.signature
  :
  Uint8Array.from(
    Buffer.from(
      signed.signatureHex,
      "hex"
    )
  );

// setSignature attaches the approval with the correct algorithm
// prefix (01 = Ed25519, 02 = secp256k1) derived from the key.
const signedDeployObj =
  DeployUtil.setSignature(
    deploy,
    signatureBytes,
    CLPublicKey.fromHex(activeWallet)
  );

const signedDeploy:any =
  DeployUtil.deployToJson(
    signedDeployObj
  );

console.log(
  "FINAL SIGNED DEPLOY:",
  signedDeploy
);

txHash =
  await sendDeploy(
    signedDeploy
  );

console.log(
  "TX HASH:",
  txHash
);


    }
    catch(chainErr){

      console.error(
        "BLOCKCHAIN ERROR:",
        chainErr
      );

    }




    const item:VerificationResult =
    {

      asset:
        assetName,


      weight:
        w,


      purity:
        p,


      score:
        score,


      risk:
        risk,


      txHash:
        txHash ||
        "FAILED",


      date:
        new Date()
        .toLocaleString()

    };



    setResult(item);



    setHistory(
      prev =>
      [
        item,
        ...prev
      ]
    );


    // Persist to the database (non-blocking).
    saveRecord(item).catch(() => {});



    setAssetName("");
    setWeight("");
    setPurity("");



  }
  catch(e:any){

    setError(
      e?.message ||
      "Verification failed"
    );

  }
  finally{

    setLoading(false);

  }

};


  const shortKey = (k: string) => `${k.slice(0, 6)}…${k.slice(-4)}`;

  return (
    <div className="min-h-screen text-ink">

      {/* ── Header ───────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-line bg-vault-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <span className="text-gold-400 text-lg leading-none">◆</span>
            <div className="leading-none">
              <p className="font-display font-semibold tracking-tight text-ink">
                GOLDGUARD
              </p>
              <p className="eyebrow mt-1">Assay · Casper</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/records"
              className="px-3 py-1.5 rounded-lg text-sm text-ink border border-line hover:border-gold-600/60 hover:text-gold-400 transition-colors"
            >
              Records
            </Link>

            <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-line bg-vault-800/60">
              <span className="h-1.5 w-1.5 rounded-full bg-verdict-low animate-pulse" />
              <span className="font-mono text-[11px] text-ink-dim">Testnet</span>
            </span>

            {!wallet ? (
              <button
                onClick={handleConnect}
                className="px-4 py-2 rounded-lg font-medium text-vault-900
                           bg-gradient-to-r from-gold-400 to-gold-600 hover:shadow-glow transition-all"
              >
                Connect wallet
              </button>
            ) : (
              <div className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-lg border border-line bg-vault-800/60">
                <span className="h-1.5 w-1.5 rounded-full bg-verdict-low" />
                <span className="font-mono text-xs text-ink-dim">{shortKey(wallet)}</span>
                <button
                  onClick={handleDisconnect}
                  className="px-2 py-1 rounded-md text-xs text-ink-faint hover:text-verdict-high transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Page intro */}
        <div className="mb-8 rise">
          <p className="eyebrow">Precious-metal verification</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mt-2 text-ink">
            Assay an asset, certify it on-chain
          </h1>
          <p className="text-ink-dim text-sm mt-2 max-w-xl">
            Score authenticity, read the risk, and write a tamper-proof record to the Casper network.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-verdict-high/40 bg-verdict-high/10 px-4 py-3 text-sm text-verdict-high">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left — assay + form + certificate */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rise"><AssayResult result={result} /></div>

            <VerificationForm
              assetName={assetName}
              weight={weight}
              purity={purity}
              loading={loading}
              setAssetName={setAssetName}
              setWeight={setWeight}
              setPurity={setPurity}
              onVerify={onVerify}
            />

            {result && (
              <div className="rise"><ResultPanel result={result} /></div>
            )}
          </div>

          {/* Right — ledger */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 h-[calc(100vh-8rem)]">
              <HistoryTable history={history} />
            </div>
          </div>
        </div>

        <footer className="mt-12 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-2">
          <p className="eyebrow">GoldGuard · On-chain assay</p>
          <p className="font-mono text-[11px] text-ink-faint">Casper testnet · casper-test</p>
        </footer>
      </main>
    </div>
  );

}