import { useState } from "react";
import { generateCertificate } from "../utils/generateCertificate";
import { waitForDeployInfo } from "../lib/casper/status";
import { useWalletStore } from "../store/walletStore";
import { VerificationResult } from "../types/verification";


type Props = {
  result: VerificationResult;
};


export default function ResultPanel({
  result
}: Props) {


  const { publicKey } =
    useWalletStore();


  const [downloading,setDownloading] =
    useState(false);


  const [progress,setProgress] =
    useState("");



  const explorerUrl = (
    tx:string
  ) =>
    `https://testnet.cspr.live/deploy/${tx}`;



  const onChain =
    Boolean(
      result.txHash &&
      result.txHash !== "FAILED"
    );



  const handleDownload = async()=>{


    setDownloading(true);

    setProgress(
      "Waiting for Casper confirmation..."
    );


    try{


      const info =
        onChain
        ?
        await waitForDeployInfo(
          result.txHash,
          {

            tries:30,

            intervalMs:5000,


            onTick:(attempt,total)=>
            {
              setProgress(
                `Confirming on-chain... (${attempt}/${total})`
              );
            }

          }
        )
        :
        null;



      console.log(
        "FINAL DEPLOY INFO:",
        info
      );



      generateCertificate({

        asset:
          result.asset,


        weight:
          result.weight,


        purity:
          result.purity,


        score:
          result.score,


        risk:
          result.risk,


        network:
          "Casper Testnet (casper-test)",


        deployHash:
          onChain
          ?
          result.txHash
          :
          null,


        blockHash:
          info?.blockHash ?? null,


        blockHeight:
          info?.blockHeight ?? null,


        caller:
          info?.caller ??
          publicKey ??
          null,


        status:
          info?.status ??
          (
            onChain
            ?
            "Pending"
            :
            "Failed"
          ),


        costMotes:
          info?.costMotes ?? null,


        consumedMotes:
          info?.consumedMotes ?? null,


        timestamp:
          info?.timestamp ?? null,


        explorerUrl:
          onChain
          ?
          explorerUrl(result.txHash)
          :
          null

      });



    }
    catch(error){

      console.error(
        "CERTIFICATE ERROR:",
        error
      );

    }
    finally{

      setDownloading(false);

      setProgress("");

    }

  };



return (

<section className="rounded-2xl border border-line bg-vault-800/70 backdrop-blur-sm shadow-vault overflow-hidden">


<header className="flex items-center justify-between px-6 py-4 border-b border-line">

<span className="eyebrow">
Certificate
</span>


<span className="eyebrow">

<span
className="inline-block h-1.5 w-1.5 rounded-full mr-2"
style={{
background:
onChain
?
"#5DD39E"
:
"#F2786F"
}}
/>


{onChain
?
"On-chain"
:
"Off-chain"}

</span>

</header>



<div className="p-6 space-y-5">


<div className="flex items-center justify-between">

<div>

<p className="text-ink font-medium">

{result.asset}

</p>


<p className="font-mono text-xs text-ink-faint">

{result.weight}g · {result.purity}% · score {result.score}/100

</p>

</div>


<span className="font-mono text-xs">

{result.risk} RISK

</span>


</div>




<div className="rounded-xl border border-line bg-vault-900/60 px-4 py-3">

<p className="eyebrow">
Transaction
</p>


{
onChain
?

<a

href={
explorerUrl(result.txHash)
}

target="_blank"

rel="noreferrer"

className="font-mono text-xs text-gold-400 break-all"

>

{result.txHash}

</a>

:

<p className="text-xs">
Not stored
</p>

}


</div>




<button

onClick={handleDownload}

disabled={downloading}

className="w-full rounded-xl py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black"

>


{
downloading
?
progress
:
"Download certificate"
}


</button>



{
onChain
&&

<a

href={
explorerUrl(result.txHash)
}

target="_blank"

rel="noreferrer"

className="block text-center border rounded-xl py-3"

>

View on cspr.live ↗

</a>

}


</div>


</section>

);

}