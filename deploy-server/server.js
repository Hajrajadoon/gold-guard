import express from "express";
import cors from "cors";


const app = express();


app.use(cors());


app.use(
  express.json({
    limit:"20mb"
  })
);



app.post("/deploy", async(req,res)=>{


try{


console.log(
  "RECEIVED DEPLOY BODY:"
);


console.log(
  JSON.stringify(
    req.body,
    null,
    2
  )
);




/*
  HANDLE BOTH FORMATS

  1)
  {
    hash,
    header,
    payment,
    session,
    approvals
  }


  2)
  {
    deploy:{
       hash,
       header,
       payment,
       session,
       approvals
    }
  }

*/


const deploy =
req.body.deploy
?
req.body.deploy
:
req.body;



console.log(
  "FINAL DEPLOY SENT TO CASPER:"
);


console.log(
  JSON.stringify(
    deploy,
    null,
    2
  )
);



if(
 !deploy ||
 !deploy.hash ||
 !deploy.header ||
 !deploy.payment ||
 !deploy.session ||
 !deploy.approvals
){

throw new Error(
"Invalid deploy structure"
);

}



console.log(
"SERVER APPROVAL:"
);


console.log(
JSON.stringify(
deploy.approvals[0],
null,
2
)
);





const rpcResponse =
await fetch(
"https://node.testnet.casper.network/rpc",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},


body:JSON.stringify({

jsonrpc:"2.0",

id:1,

method:"account_put_deploy",


params:{
  deploy:deploy
}


})


}
);




const result =
await rpcResponse.json();



console.log(
"CASPER RPC RESULT:"
);


console.log(
JSON.stringify(
result,
null,
2
)
);



res.json(result);



}
catch(error){


console.error(
"SERVER ERROR:",
error
);



res.status(500).json({

message:
error.message

});


}


});





// Look up a deploy's on-chain status/execution result by hash. Used by the
// frontend to build the blockchain certificate.
app.post("/deploy-info", async (req, res) => {

try {

  const hash =
    req.body?.hash;

  if (!hash) {
    throw new Error("Missing deploy hash");
  }

  const rpcResponse =
    await fetch(
      "https://node.testnet.casper.network/rpc",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "info_get_deploy",
          params: {
            deploy_hash: hash,
            finalized_approvals: false
          }
        })
      }
    );

  const result =
    await rpcResponse.json();

  res.json(result);

}
catch (error) {

  console.error(
    "DEPLOY-INFO ERROR:",
    error
  );

  res.status(500).json({
    message: error.message
  });

}

});


app.listen(
4000,
()=>{

console.log(
"Deploy server running on port 4000"
);

}
);