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

txObjList = [];

network = '';

class Tx {
    constructor(coinAddress, amount, timestamp, symbol) {
        this.coinAddress = coinAddress;
        this.amount = amount;
        this.timestamp = timestamp;
        this.symbol = symbol;
    }
}

function reset() {
    maxPortfolio = {
        coins: {},
        timestamp: 0,
        value: 0
    };

    currentPortfolio = {
        coins: {},
        timestamp: 0,
        value: 0
    };

    txObjList = [];

    coinprices = {};
    coinSymbols = {};
    coinAddresses = {};
}

function createTable(arr) {
    var html = "<tr><td>" + "<b>COIN</b>" +
        "</td><td>" + "<b>HOLDINGS</b>" +
        "</td><td>" + "<b>CURRENT PRICE</b>" +
        "</td><td>" + "<b>VALUE TODAY</b>" +
        "</td></tr>";

    arr.forEach((url, index) => {
        let s = arr[index].symbol;

        let a = arr[index].amount;

        let p = arr[index].price;
        let pV = (a * p);

        p = p.toString();
        p = "$" + p;

        pV = pV.toFixed(2);
        pV = "$" + numberWithCommas(pV);

        if (a % 1 != 0) {
            a = a.toFixed(3);
        }
        a = numberWithCommas(a);

        html = html +
            "<tr><td>" + s +
            "</td><td>" + a +
            "</td><td>" + p +
            "</td><td>" + pV +
            "</td></tr>";
    })


    return html;

}

function orderPortfolio(obj) {

    tableArray = [];

    for (const property in obj) {
        let o = {};
        let sym = coinSymbols[property];
        let amt = obj[property];
        let cPrice = coinprices[property].usd;
        let val = amt * cPrice;

        o.symbol = sym;
        o.amount = amt;
        o.price = cPrice;
        o.value = val;

        tableArray.push(o);
    }

    sortTable(tableArray);
    return tableArray;


}

function sortTable(arr) {
    arr.sort((a, b) => {
        var valueA = a.value;
        var valueB = b.value;
        if (valueA < valueB) return 1;
        if (valueA > valueB) return -1;
        return 0;
    })
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

function getTokenTx(link) {
    let scanner = "";
    let apiKey = "";

    switch (network) {
        case 'eth':
            scanner = "etherscan.io";
            apiKey = "744C6G2WQX78MHG8PXKRJ8D3G9KAXI6ARZ";
            break;
        case 'bsc':
            scanner = "bscscan.com";
            apiKey = "DEJRY487FBI9T81GH6Q4DN3RAM8C2WY7RB";
            break;
        case 'avax':
            scanner = "snowtrace.io";
            apiKey = "VE56HHXDNXA3Y684ZBZZ61HNKRW8BF4JP9";
            break;
    }

    return fetch(`https://api.${scanner}/api?module=account&action=tokentx&address=${link}&sort=asc&apikey=${apiKey}`)
        .then(response => {
            return response.json();
        })
        .then(res => {
            res.result.forEach(function (url, index) {
                let point = res.result[index];
                let pointValue = point.value / Math.pow(10, Number(point.tokenDecimal));

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

function clean(obj) {
    for (const property in obj) {
        if (obj[property].usd == undefined) {
            delete obj[property];
        }
    }
}


//-----------MAIN CALC FUNCTION HERE

async function main(address, chain) {

    txObjList = [];

    const tokenTx = await getTokenTx(address);

    let x = split10(coinAddresses);

    x.forEach(function (url, index) {
        x[index] = x[index].join();
    })

    promises = [];

    x.forEach(function (url, index) {
        let p =
            fetch('https://api.coingecko.com/api/v3/simple/token_price/' + chain + '?contract_addresses=' + x[index] + '&vs_currencies=usd');

        promises.push(p);

    })

    await Promise.all(promises).then(values => {
        return Promise.all(values.map(r => r.json()));
    }).then(values => {
        console.log(values);
        values.forEach(function (url, index) {
            coinprices = {
                ...coinprices,
                ...values[index]
            }
        })
        console.log("Promises complete");
    })

    clean(coinprices);

    txObjList.forEach(function (url, index) {
        let p = txObjList[index];
        currentPortfolio.timestamp = p.timestamp;

        if (currentPortfolio.coins[p.coinAddress] == undefined) {
            //add coin to portfolio
            currentPortfolio.coins[p.coinAddress] = p.amount;
            console.log("Adding: ", p.symbol, " Amount: ", p.amount);
            console.log("...");
        } else {
            //increment/decrement value
            if (p.amount > 0) {
                currentPortfolio.coins[p.coinAddress] = currentPortfolio.coins[p.coinAddress] + p.amount;

                console.log("-> INFLOW: ", p.symbol, " Amount: ", p.amount)
                console.log("Current ", p.symbol, " holdings: ", currentPortfolio.coins[p.coinAddress])
                console.log("...")

            } else {
                let rev = p.amount;
                rev = rev * (-1);

                currentPortfolio.coins[p.coinAddress] = currentPortfolio.coins[p.coinAddress] - rev;

                console.log("<- OUTFLOW: ", p.symbol, " Amount: ", rev)
                console.log("Current ", p.symbol, " holdings: ", currentPortfolio.coins[p.coinAddress])
                console.log("...")

                if (currentPortfolio.coins[p.coinAddress] <= 1e-10) {
                    delete currentPortfolio.coins[p.coinAddress];
                }
            }
        }

        //console.log(calculatePortfolio(currentPortfolio));
        currentPortfolio.value = calculatePortfolio(currentPortfolio);

        if (currentPortfolio.value > maxPortfolio.value) {

            maxPortfolio = _.cloneDeep(currentPortfolio);

            console.log("New max portfolio: ",
                maxPortfolio.value,
                " Timestamp: ", maxPortfolio.timestamp);

            for (const property in maxPortfolio.coins) {
                console.log(coinSymbols[property], ": ", maxPortfolio.coins[property]);
            }

            console.log("...")
        }

    });

    const finalTime = new Date(maxPortfolio.timestamp * 1000);

    var value1 = numberWithCommas(maxPortfolio.value.toFixed(2));
    const finalValue = "$" + value1

    console.log("You should have held on " + finalTime);
    console.log("Your portfolio would be worth " + finalValue + " today.")

    for (const property in maxPortfolio.coins) {
        let sym = coinSymbols[property];
        console.log(sym, ": ", maxPortfolio.coins[property]);
    }

}