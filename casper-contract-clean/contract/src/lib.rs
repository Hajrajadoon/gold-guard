#![no_std]
#![no_main]

extern crate alloc;

use alloc::{string::String, vec};

use casper_contract::{
    contract_api::{runtime, storage},
};

use casper_types::{
    CLType,
    EntryPoints,
    EntryPointAccess,
    EntryPointType,
    Parameter,
    URef,
};

use casper_types::contracts::EntryPoint;

#[no_mangle]
pub extern "C" fn verify() {
    let asset: String = runtime::get_named_arg("asset");
    let score: u64 = runtime::get_named_arg("score");
    let risk: String = runtime::get_named_arg("risk");

    let asset_uref: URef = storage::new_uref(asset);
    let score_uref: URef = storage::new_uref(score);
    let risk_uref: URef = storage::new_uref(risk);

    runtime::put_key("asset", asset_uref.into());
    runtime::put_key("score", score_uref.into());
    runtime::put_key("risk", risk_uref.into());
}

#[no_mangle]
pub extern "C" fn call() {
    let mut entry_points = EntryPoints::new();

    entry_points.add_entry_point(
        EntryPoint::new(
            "verify",
            vec![
                Parameter::new("asset", CLType::String),
                Parameter::new("score", CLType::U64),
                Parameter::new("risk", CLType::String),
            ],
            CLType::Unit,
            EntryPointAccess::Public,
            EntryPointType::Contract,
        ),
    );

    let (contract_hash, _version) =
        storage::new_contract(entry_points, None, None, None);

    runtime::put_key("goldguard_contract", contract_hash.into());
}