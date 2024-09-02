# 💰 Hardhat Fund Me Project
A decentralized crowdfunding platform built with Solidity and 
Hardhat. This project demonstrates how to create and manage a 
smart contract that allows users to fund and withdraw from the 
contract on the Ethereum blockchain. It also integrates Chainlink 
price feeds to ensure accurate and up-to-date conversions.

## Features
1. **🚀 Fund Contract**: Users can easily send ETH to the contract, 
supporting decentralized projects.
2. **💵 Withdraw Funds**: Authorized users can withdraw the collected 
funds from the contract.
3. **🔗 Chainlink Integration**: Ensures accurate ETH to USD conversion 
using Chainlink price feeds.

##  Installation
To get started with the project, follow these steps:
1. Clone the repository:
```bash
git clone https://github.com/jopaleti/hardhat-fund-me.git
cd hardhat-fund-me
```
2. Install dependencies:
```bash
yarn install
```
3. Compile the smart contracts:
```bash
yarn hardhat compile
```
4. Run tests:
```bash
yarn hardhat test
```
5. Deployment
To deploy the smart contract to a local or live Ethereum network, 
follow these steps:
1. Set up environment variables:
Create a .env file in the root directory and add your network and account details.
```bash
SEPOLIA_RPC_URL=<RPC_URL>
PRIVATE_KEY=<PRIVATE_KEY>
ETHERSCAN_API_KEY=<ETHERSCAN_API_KEY>
COINMARKETCAP_API_KEY=<COINMARKETCAP_API_KEY>
2. Deploy to the network:
```bash
yarn hardhat run scripts/deploy.js --network sepolia
```
## Usage
1. Funding the Contract
Users can fund the contract by sending ETH directly to the contract's address. 
The minimum funding amount is determined by the contract's logic.
2. Withdrawing Funds
Only the owner of the contract can withdraw the accumulated funds. 
The withdrawal can be done by calling the withdraw function from the contract.
3. Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License.