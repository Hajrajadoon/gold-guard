import pkg from "casper-js-sdk";

console.log("PublicKey:", typeof pkg.PublicKey);
console.log("Deploy:", typeof pkg.Deploy);
console.log("ExecutableDeployItem:", typeof pkg.ExecutableDeployItem);

console.log("\nDeploy methods:");
console.log(Object.getOwnPropertyNames(pkg.Deploy));

console.log("\nExecutableDeployItem methods:");
console.log(Object.getOwnPropertyNames(pkg.ExecutableDeployItem));

console.log("\nPublicKey methods:");
console.log(Object.getOwnPropertyNames(pkg.PublicKey));