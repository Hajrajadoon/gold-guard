export const sendDeploy = async (
  signedDeploy:any
)=>{

try{


console.log(
  "SUBMITTING DEPLOY",
  signedDeploy
);


console.log(
  "SEND DEPLOY JSON",
  JSON.stringify(
    signedDeploy,
    null,
    2
  )
);


const response =
await fetch(
  "https://acre-pediatric-marauding.ngrok-free.dev",
  {
    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify(
      signedDeploy
    )

  }
);



const result =
await response.json();



console.log(
  "CASPER RESPONSE",
  result
);



if(!response.ok){

  throw new Error(
    result?.message ||
    "Server rejected deploy"
  );

}



if(result.error){

  throw new Error(
    result.error.message
  );

}



return (
  result?.result?.deploy_hash ||
  null
);


}
catch(e:any){

console.error(
  "DEPLOY FAILED",
  e
);


return null;

}

};