import fs from "fs";

const wasmBase64 = fs.readFileSync("wasm_base64.txt", "utf8").trim();

// ⚠️ PUT YOUR REAL PUBLIC KEY HERE
const publicKeyHex = "PUT_YOUR_PUBLIC_KEY_HERE";

const rpcUrl = "https://node.testnet.casper.network/rpc";

const deploy = {
  jsonrpc: "2.0",
  id: 1,
  method: "account_put_deploy",
  params: {
    deploy: {
      hash: null,
      header: {
        account: publicKeyHex,
        timestamp: new Date().toISOString(),
        ttl: "30m",
        gas_price: 1,
        body_hash: null,
        dependencies: [],
        chain_name: "casper-test"
      },
      payment: {
        ModuleBytes: {
          module_bytes: "",
          args: []
        }
      },
      session: {
        ModuleBytes: {
          module_bytes: wasmBase64,
          args: []
        }
      },
      approvals: []
    }
  }
};

const response = await fetch(rpcUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(deploy)
});

const data = await response.json();

console.log("🔥 DEPLOY RESPONSE:");
console.log(JSON.stringify(data, null, 2));