# When Should You Have Held?

Try it out: https://otpcd.github.io/

Sample address: 0x299a0fAF372A6b685a4e8339722f4a5fDC518724

Supported chains: ETH, BSC, AVAX C-Chain

![Homescreen](img.png)

This WebApp takes in an ETH/BSC/AVAX C-Chain address and analyzes every transaction to determine at which point, if any, would have been a better time to stop trading based on a comparison between the portfolio value now and the hypothetical portfolio value at every transaction.

Unfortunately due to the limitations of the Explorer APIs regarding Ether/BNB/AVAX balance at any given point in time (block number), I am unable to include native token holdings in this calculation.  Etherscan (and hence, all other explorer APIs that have forked Etherscan) only allows 2 API calls/second for this particular feature, and most wallets would need 100s or 1000s of these calls.

Powered by Etherscan, BSCScan, Snowtrace and CoinGecko APIs.
