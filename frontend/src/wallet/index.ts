let walletInstance:any = null;



const getProvider = () => {

  const w =
    window as any;


  const provider =
    typeof w.CasperWalletProvider === "function"
    ?
    w.CasperWalletProvider(window)
    :
    w.CasperWalletProvider;


  return provider || null;

};




// CONNECT WALLET

export const connectWallet =
async ():Promise<string> => {


  const provider =
    getProvider();



  if(!provider){

    throw new Error(
      "Casper Wallet not found"
    );

  }



  walletInstance =
    provider;



  if(
    typeof provider.requestConnection === "function"
  ){

    await provider.requestConnection({

      title:
        document.title

    });

  }
  else{

    throw new Error(
      "Wallet connection not supported"
    );

  }



  await new Promise(
    r => setTimeout(r,800)
  );



  const pk =
    await provider.getActivePublicKey();



  if(!pk){

    throw new Error(
      "No active account selected in wallet"
    );

  }



  return pk;

};





// GET CURRENT WALLET INSTANCE

export const getWalletInstance =
()=>{


  if(!walletInstance){

    const provider =
      getProvider();


    walletInstance =
      provider;

  }


  return walletInstance;

};





// SIGN DEPLOY

export const signDeploy =
async(
  deploy:any,
  publicKey:string
)=>{


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



  return await wallet.sign(

    deploy,

    publicKey

  );

};






// DISCONNECT

export const disconnectWallet =
async()=>{


  try{


    await walletInstance
      ?.disconnectFromSite
      ?.();


  }
  finally{

    walletInstance =
      null;

  }

};





export {
  getProvider
};