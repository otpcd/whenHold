# When Should You Have Held?

Try it out: https://otpcd.github.io/

Supported chains: ETH, BSC

![Homescreen](img.png)

This WebApp takes in an Ethereum or Binance Smart Chain wallet address and analyzes every transaction to determine at which point, if any, would have been a better time to stop trading based on a comparison between the portfolio value now and the hypothetical portfolio value at every transaction.

Unfortunately due to the limitations of the Etherscan/BSCScan API regarding Ether/BNB balance at any given point in time (block number), I am unable to include ETH/BNB holdings in this calculation.  The Etherscan/BSCScan API only allows 2 API calls/second for this particular feature, and most wallets would need 100s or 1000s of these calls.

Powered by Etherscan, BSCScan and CoinGecko APIs.
