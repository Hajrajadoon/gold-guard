import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();

app.use(cors());

app.use(
  express.json({
    limit:"20mb"
  })
);


// ===============================
// RECORDS
// ===============================


app.get("/records",(req,res)=>{

try{

const rows =
db.prepare(
`
SELECT
asset,
weight,
purity,
score,
risk,
tx_hash AS txHash,
date
FROM records
ORDER BY id DESC
LIMIT 200
`
).all();


res.json(rows);


}catch(error){

console.error(
"GET RECORDS ERROR",
error
);

res.status(500).json({
message:error.message
});

}

});




app.post("/records",(req,res)=>{

try{


const {
asset,
weight,
purity,
score,
risk,
txHash,
date

}=req.body;



const info =
db.prepare(
`
INSERT INTO records
(
asset,
weight,
purity,
score,
risk,
tx_hash,
date
)
VALUES(?,?,?,?,?,?,?)
`
)
.run(

asset,
Number(weight),
Number(purity),
Number(score),
risk,
txHash,
date

);



res.json({
id:info.lastInsertRowid
});



}catch(error){

console.error(
"POST RECORD ERROR",
error
);

res.status(500).json({
message:error.message
});

}

});





// ===============================
// DEPLOY
// ===============================


app.post("/deploy",async(req,res)=>{

try{


const deploy =
req.body.deploy ??
req.body;



console.log(
"DEPLOY HASH REQUEST"
);


const rpc =
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
deploy
}

})

});


const result =
await rpc.json();


console.log(
"CASPER RPC RESULT"
);


console.log(
JSON.stringify(
result,
null,
2
)
);



res.json(result);


}catch(error){


console.error(
"DEPLOY ERROR",
error
);


res.status(500).json({
message:error.message
});


}

});





// ===============================
// DEPLOY INFO
// ===============================


app.post("/deploy-info",async(req,res)=>{


try{


const hash =
req.body.hash;


console.log(
"CHECK DEPLOY:",
hash
);



const rpc =
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

method:"info_get_deploy",

params:{
deploy_hash:hash,
finalized_approvals:true
}


})

});


const result =
await rpc.json();



console.log(
"DEPLOY INFO RPC:"
);


console.log(
JSON.stringify(
result,
null,
2
)
);



res.json(result);



}catch(error){


console.error(
"DEPLOY INFO ERROR",
error
);


res.status(500).json({
message:error.message
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