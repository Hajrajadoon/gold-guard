import { useEffect, useState } from "react";

import StatCard from "../components/StatCard";
import RiskMeter from "../components/RiskMeter";
import ResultPanel from "../components/ResultPanel";
import HistoryTable from "../components/HistoryTable";
import VerificationForm from "../components/VerificationForm";

import {
  DeployUtil
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

    const saved =
      localStorage.getItem(
        "gg_history"
      );


    if(saved){

      setHistory(
        JSON.parse(saved)
      );

    }

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

if(
  !signed ||
  !signed.signatureHex
){

  throw new Error(
    "Wallet did not return signature"
  );

}

const signature =
  signed.signatureHex.startsWith("01")
  ?
  signed.signatureHex
  :
  "01" + signed.signatureHex;

const signedDeploy:any = {

  deploy: {

    ...deployJson.deploy,

    approvals:[
      {
        signer:
          deployJson.deploy.header.account,

        signature:
          signature
      }
    ]

  }

};

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


  return (

<div className="min-h-screen bg-[#070A12] text-white">


<div className="flex justify-between px-8 py-5 border-b border-white/10 bg-[#0B1020]">


<h1 className="text-xl font-semibold">
GoldGuard AI
</h1>



{

!wallet ?


<button

onClick={handleConnect}

className="bg-yellow-500 px-4 py-2 rounded text-black"

>

Connect Wallet

</button>


:


<div className="flex gap-3 items-center">


<span className="text-green-400 text-xs">
Connected
</span>


<button

onClick={handleDisconnect}

className="text-red-400 text-xs"

>

Disconnect

</button>


</div>

}


</div>





{

error &&

<div className="px-8 py-2 text-red-400 text-sm">

{error}

</div>

}







<div className="px-8 py-6 grid grid-cols-12 gap-6">


<div className="col-span-8 space-y-6">



<div className="grid grid-cols-2 gap-4">


<StatCard
title="AI Score"
value={result?.score ?? 0}
/>



<StatCard
title="Risk Level"
value={result?.risk ?? "-"}
/>


</div>



<RiskMeter />



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





{

result &&

<ResultPanel result={result}/>

}



</div>





<div className="col-span-4">


<HistoryTable history={history}/>


</div>



</div>



</div>


  );

}