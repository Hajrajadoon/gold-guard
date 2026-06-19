#![no_std]
#![no_main]

extern crate alloc;

use alloc::string::String;

use casper_contract::contract_api::{runtime, storage};

// GoldGuard verification — runs as session code.
//
// `call()` is executed in the caller's account context. It reads the
// verification inputs/result as runtime args (so they are visible on the
// deploy in any block explorer) and persists each one under a named key.
#[no_mangle]
pub extern "C" fn call() {
    let asset: String = runtime::get_named_arg("asset");
    let weight: u64 = runtime::get_named_arg("weight");
    let purity: u64 = runtime::get_named_arg("purity");
    let score: u64 = runtime::get_named_arg("score");
    let risk: String = runtime::get_named_arg("risk");

    runtime::put_key("asset", storage::new_uref(asset).into());
    runtime::put_key("weight", storage::new_uref(weight).into());
    runtime::put_key("purity", storage::new_uref(purity).into());
    runtime::put_key("score", storage::new_uref(score).into());
    runtime::put_key("risk", storage::new_uref(risk).into());
}
