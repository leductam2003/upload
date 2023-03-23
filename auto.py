
from web3 import Web3
from datetime import datetime
chainId = 42161
w3 = Web3(Web3.WebsocketProvider('wss://arb-mainnet.g.alchemy.com/v2/K_SI8aUX8zZtHL3mO54m71JiTWFAKvOr'))

private_key = '7b2db0892239eced7cd1aa26cd0ebd3ecbcfd70b602b5659d4631fc1394986c4'
adddress = w3.eth.account.from_key(private_key).address
print(adddress)


nonce = w3.eth.get_transaction_count(adddress)
gasPrice = w3.toWei(0.1,'gwei')
while True:
    try:
        balance = w3.eth.get_balance(adddress)
        ether_balance = w3.fromWei(balance, 'ether')
        if ether_balance:
            print(datetime.today().strftime('%Y-%m-%d %H:%M:%S') + ' '+ str(ether_balance) + ' ETH')
            max_gas_limit = int(balance / gasPrice)
            txn = {
                'from' : adddress,
                'to': adddress,
                'gasPrice': gasPrice,
                'gas' : max_gas_limit,
                'value' : 0,
                'nonce' : nonce + 1
            }
            signed_txn = w3.eth.account.sign_transaction(txn, private_key)
            txn_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            #w3.eth.wait_for_transaction_receipt(txn_hash)
            nonce += 1
            print(datetime.today().strftime('%Y-%m-%d %H:%M:%S') + f' Transaction sent: {txn_hash.hex()}')
        else:
            print(datetime.today().strftime('%Y-%m-%d %H:%M:%S') + ' Account balance is zero.')
    except Exception as error:
        print(datetime.today().strftime('%Y-%m-%d %H:%M:%S') + ' '+ str(error))
