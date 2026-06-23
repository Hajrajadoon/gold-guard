import fs from "fs";import {  Deploy,  DeployHeader,  ModuleBytes,  ExecutableDeployItem,  DeployNamedArg,  Args,  CLPublicKey} from "casper-js-sdk";


const PUBLIC_KEY ="0203da4055d0b87120c4dbcd2e96c562455e95fb50c5a7f5e7ad46e1b35bc1f88b01";


const wasmPath ="C:\\Users\\user\\goldguard-ai\\casper-contract-clean\\contract\\target\\wasm32-unknown-unknown\\release\\contract.wasm";


const wasm =fs.readFileSync(wasmPath);


console.log("WASM SIZE:",wasm.length);


const account =CLPublicKey.fromHex(PUBLIC_KEY);


const header =new DeployHeader(account,"casper-test");


const session =new ExecutableDeployItem(new ModuleBytes(wasm,new Args([])));


const payment =new ExecutableDeployItem(new ModuleBytes(new Uint8Array(),new Args([  new DeployNamedArg(    "amount",    "20000000000"  )])));


const deploy =new Deploy(header,payment,session);


console.log("DEPLOY CREATED");

console.log(JSON.stringify(deploy,null,2));