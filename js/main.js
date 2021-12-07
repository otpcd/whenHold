class Tx {
    constructor(coinAddress, amount, action, timestamp, symbol) {
        this.coinAddress = coinAddress;
        this.amount = amount;
        this.action = action;
        this.timestamp = timestamp;
        this.symbol = symbol;
    }
}

function calculatePortfolio(obj) {
    total = 0;
    for (const property in obj.coins) {
        try {
            let price = coinprices[property].usd;
            total += (price * obj.coins[property]);
        } catch (err) {
            delete obj.coins[property];
        };
    }
    return total;
}

function split10(obj) {
    let split = [];
    let result = [];
    for (const property in obj) {
        split.push(property);
    }

    while (split.length) {
        result.push(split.splice(0, 10));
    }
    return result;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



function getEthPrice() {
    return fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
        .then(response => {
            return response.json();
        })
        .then(res => {
            coinprices['ethereum'] = { usd: res.ethereum.usd };
            console.log(res);
        })
}

function getJSON(link) {
    return fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${link}&sort=asc&apikey=744C6G2WQX78MHG8PXKRJ8D3G9KAXI6ARZ`)
        .then(response => {
            return response.json();
        })
        .then(res => {
            res.result.forEach(function (url, index) {
                let point = res.result[index];
                let pointValue = point.value / Math.pow(10, 18);
                let txFee = (point.gasUsed * point.gasPrice) / Math.pow(10, 18);
                let finalValue = 0;
                let a = "";

                if (point.to == point.from) {
                    a = 'inflow';
                } else if (point.to == walletUrl) {
                    a = 'inflow';
                    txFee = 0;
                } else { a = 'outflow' }

                if (point.isError == 1) {
                    pointValue = 0;
                }

                finalValue = pointValue + txFee;
                if (finalValue < 0) {
                    finalValue = finalValue * (-1)
                    a = 'outflow'
                }

                let p = new Tx(
                    'ethereum',
                    finalValue,
                    a,
                    point.timeStamp,
                    'ETH'
                )

                txObjList.push(p);
            })
            return res;
        })
}

function getJSONtx(link) {
    return fetch(`https://api.etherscan.io/api?module=account&action=tokentx&address=${link}&sort=asc&apikey=744C6G2WQX78MHG8PXKRJ8D3G9KAXI6ARZ`)
        .then(response => {
            return response.json();
        })
        .then(res => {
            res.result.forEach(function (url, index) {
                let point = res.result[index];
                let pointValue = point.value / Math.pow(10, Number(point.tokenDecimal));
                let a = "";

                coinAddresses[point.contractAddress] = 1;

                coinSymbols[point.contractAddress] = point.tokenSymbol;

                if (point.from == point.to) {
                    return;
                } else {
                    if (point.to == walletUrl) {
                        a = "inflow";
                    } else { a = "outflow" };
                };

                let p = new Tx(
                    point.contractAddress,
                    pointValue,
                    a,
                    point.timeStamp,
                    point.tokenSymbol,
                )

                txObjList.push(p);
            })

            return res;
        })
}

//-----------MAIN CALC FUNCTION HERE

async function main(address) {

    const ethPrice = await getEthPrice();

    const normalTx = await getJSON(address);
    console.log(normalTx);
    const tokenTx = await getJSONtx(address);
    console.log(tokenTx);

    //-----------SORT TX ALGORITHM

    // txObjList.sort((a, b) => {
    //     var keyA = a.timestamp;
    //     var keyB = b.timestamp;
    //     if (keyA < keyB) return -1;
    //     if (keyA > keyB) return 1;
    //     return 0;
    // })

    //-----------SORT TX ALGORITHM

    //ORDER PORTFOLIO

    // let response = await fetch(normalTx).then(response => {
    //     return response.json()
    // }).then(res => {
    //     console.log(res.result);
    // })

    // if (response.ok) { // if HTTP-status is 200-299
    //     var json = await response.json();
    // } else {
    //     console.error("HTTP-Error: " + response.status);
    // }

    // let erc20Tx = `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&sort=asc&apikey=744C6G2WQX78MHG8PXKRJ8D3G9KAXI6ARZ`;
    // let response2 = await fetch(erc20Tx);

    // if (response2.ok) { // if HTTP-status is 200-299
    //     var json2 = await response2.json();
    // } else {
    //     console.error("HTTP-Error: " + response.status);
    // }

    //console.log(json2);



}

//-----------MAIN CALC FUNCTION HERE

currentPortfolio = {
    coins: {},
    timestamp: 0,
    value: 0
};

maxPortfolio = {
    coins: {},
    timestamp: 0,
    value: 0
};

coinprices = {};
coinSymbols = {};
coinAddresses = {};

transactions = [];
txObjList = [];
