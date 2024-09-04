require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();
require("hardhat-gas-reporter");
// require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
// require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL || "https://www.sepolia.com/example";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key";

module.exports = {
    defaultNetwork: "hardhat",
    allowUnlimitedContractSize: true,
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        hardhat: {
            chainId: 1337,
            gasPrice: 20000000000, // 20 Gwei
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            // accounts: Thanks hardhat!
            chainId: 31337,
        },
    },
    // solidity: "0.8.8",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        // coinmarketcap: COINMARKETCAP_API_KEY,
        token: "SEPOLIA",
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
};
