export const CASPER_RPCS = [
  "https://node.testnet.casper.network/rpc",
  "https://rpc.testnet.casperlabs.io/rpc"
];

let index = 0;

export const getRpc = () => CASPER_RPCS[index];

export const switchRpc = () => {
  index = (index + 1) % CASPER_RPCS.length;
  return CASPER_RPCS[index];
};