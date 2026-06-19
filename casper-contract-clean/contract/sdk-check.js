import pkg from "casper-js-sdk";

console.log(
  Object.keys(pkg)
    .filter(
      x =>
        x.toLowerCase().includes("deploy") ||
        x.toLowerCase().includes("public") ||
        x.toLowerCase().includes("key")
    )
    .sort()
);