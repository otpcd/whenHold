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

//coinprices = {};
coinSymbols = {};
coinAddresses = {};

txObjList = [];

class Tx {
    constructor(coinAddress, amount, timestamp, symbol) {
        this.coinAddress = coinAddress;
        this.amount = amount;
        this.timestamp = timestamp;
        this.symbol = symbol;
    }
}

function getNormal(link) {
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

                coinAddresses[point.contractAddress] = 1;

                coinSymbols[point.contractAddress] = point.tokenSymbol;

                if (point.from == point.to) {
                    return;
                }

                if (point.from == walletUrl) {
                    pointValue = pointValue * (-1);
                }

                let p = new Tx(
                    point.contractAddress,
                    pointValue,
                    point.timeStamp,
                    point.tokenSymbol,
                )

                txObjList.push(p);
            })

            return res;
        })
}