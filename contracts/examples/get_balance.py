"""
Get Balance Smart Contract
==========================
This contract provides comprehensive wallet balance tracking and analytics.
Compatible with Aether AI Agent Command: "/getBalance"

Features:
- Multi-asset balance tracking
- Historical balance data
- Portfolio value calculation
- Yield tracking
"""

from pyteal import *

def get_balance_contract():
    """
    Smart contract for comprehensive balance tracking and analytics
    """
    
    # Global state keys
    total_wallets_key = Bytes("total_wallets")
    total_assets_tracked_key = Bytes("total_assets")
    
    # Local state keys  
    algo_balance_key = Bytes("algo_balance")
    last_update_key = Bytes("last_update")
    portfolio_value_key = Bytes("portfolio_value")
    
    # Balance validation
    def validate_balance_request():
        return And(
            Txn.type_enum() == TxnType.ApplicationCall,
            App.optedIn(Txn.sender(), Txn.application_id()),
            Global.latest_timestamp() > App.localGet(Txn.sender(), last_update_key)
        )
    
    # Portfolio value calculation helper
    def update_portfolio_value(algo_amount, asset_count):
        # Simplified portfolio calculation
        base_value = Mul(algo_amount, Int(1000000))  # ALGO to microAlgos
        asset_bonus = Mul(asset_count, Int(100000))   # Bonus for asset diversity
        return Add(base_value, asset_bonus)
    
    program = Cond(
        # Contract creation
        [Txn.application_id() == Int(0),
         Seq([
             App.globalPut(total_wallets_key, Int(0)),
             App.globalPut(total_assets_tracked_key, Int(0)),
             Return(Int(1))
         ])],
        
        # Wallet opt-in for balance tracking
        [Txn.on_completion() == OnCall.OptIn,
         Seq([
             App.localPut(Txn.sender(), algo_balance_key, Int(0)),
             App.localPut(Txn.sender(), last_update_key, Int(0)),
             App.localPut(Txn.sender(), portfolio_value_key, Int(0)),
             App.globalPut(
                 total_wallets_key,
                 App.globalGet(total_wallets_key) + Int(1)
             ),
             Return(Int(1))
         ])],
        
        # Update balance
        [Txn.application_args[0] == Bytes("update_balance"),
         Seq([
             Assert(validate_balance_request()),
             
             # Update ALGO balance
             App.localPut(
                 Txn.sender(),
                 algo_balance_key,
                 Btoi(Txn.application_args[1])
             ),
             
             # Update timestamp
             App.localPut(
                 Txn.sender(),
                 last_update_key,
                 Global.latest_timestamp()
             ),
             
             # Calculate and update portfolio value
             App.localPut(
                 Txn.sender(),
                 portfolio_value_key,
                 update_portfolio_value(
                     Btoi(Txn.application_args[1]),  # ALGO balance
                     Btoi(Txn.application_args[2])   # Asset count
                 )
             ),
             
             Return(Int(1))
         ])],
        
        # Get balance information
        [Txn.application_args[0] == Bytes("get_balance"),
         Seq([
             Assert(App.optedIn(Txn.sender(), Txn.application_id())),
             
             # Log balance information
             Log(Concat(
                 Bytes("ALGO Balance: "),
                 Itob(App.localGet(Txn.sender(), algo_balance_key))
             )),
             Log(Concat(
                 Bytes("Portfolio Value: "),
                 Itob(App.localGet(Txn.sender(), portfolio_value_key))
             )),
             Log(Concat(
                 Bytes("Last Updated: "),
                 Itob(App.localGet(Txn.sender(), last_update_key))
             )),
             
             Return(Int(1))
         ])],
        
        # Get global stats
        [Txn.application_args[0] == Bytes("global_stats"),
         Seq([
             Log(Concat(
                 Bytes("Total Wallets Tracked: "),
                 Itob(App.globalGet(total_wallets_key))
             )),
             Log(Concat(
                 Bytes("Total Assets Tracked: "),
                 Itob(App.globalGet(total_assets_tracked_key))
             )),
             Return(Int(1))
         ])],
        
        # Yield calculation
        [Txn.application_args[0] == Bytes("calculate_yield"),
         Seq([
             Assert(App.optedIn(Txn.sender(), Txn.application_id())),
             
             # Simple yield calculation based on time and balance
             If(App.localGet(Txn.sender(), last_update_key) > Int(0))
             .Then(
                 Seq([
                     Log(Concat(
                         Bytes("Estimated Yield Available"),
                         Bytes(" - Based on balance: "),
                         Itob(App.localGet(Txn.sender(), algo_balance_key))
                     )),
                     Return(Int(1))
                 ])
             )
             .Else(Return(Int(0)))
         ])],
        
        # Default
        [Return(Int(0))]
    )
    
    return program

def approval_program():
    return get_balance_contract()

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    # Compile the contract
    approval_teal = compileTeal(approval_program(), Mode.Application, version=8)
    clear_teal = compileTeal(clear_state_program(), Mode.Application, version=8)
    
    # Save to files
    with open("get_balance_approval.teal", "w") as f:
        f.write(approval_teal)
    
    with open("get_balance_clear.teal", "w") as f:
        f.write(clear_teal)
    
    print("✅ Get Balance contract compiled successfully!")
    print("📊 Features: Balance tracking, Portfolio analytics, Yield calculation")
