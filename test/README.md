# 🎉 FundMe Smart Contract Testing Suite 🚀

## 👨‍💻 Explanation of important cases in contract deployment 🚀
```bash
const fundMeDeployment = await deployments.get("FundMe");
```
1. This line retrieves the deployment details of the FundMe 
contract, which includes the **contract's address**, **ABI**, and  
**other metadata**.
2. The object returned by ```deployments.get("FundMe")``` contains all 
the information needed for the contract, not just the address.
### Example of fundMeDeployment object:
```json
{
  "address": "0x123...abc", // The deployed contract address
  "abi": [...],             // Contract ABI
  "transactionHash": "0x...", // Transaction that deployed the contract
  // Other metadata
}
```
So, you can access the contract's address by using fundMeDeployment.address.

```2. deployer = fundMeDeployment.address;```
- This assigns the address of the deployed ```FundMe``` contract to the 
```deployer``` variable.
- ```deployer``` in this case refers to the contract's address (not the deployer account).

```3. fundMe = await ethers.getContractAt("FundMe", deployer);```
- This line uses the contract address stored in ```deployer``` (which is 
actually the ```FundMe``` contract address) to retrieve a contract instance.
- ```ethers.getContractAt()``` takes two arguments: the contract name 
(or ABI) and the contract address. This allows you to interact 
with the deployed ```FundMe``` contract at the specified address.


This project contains a Hardhat test suite for the FundMe smart contract. The contract allows users to fund and withdraw Ether (ETH) under specific conditions, and only the owner can initiate a withdrawal. The tests ensure that the contract behaves as expected in various scenarios.

## 📚 Table of Contents
🔧 Requirements
1. 📜 Test Summary
2. 🛠️ Setup
3. 🔍 Key Functions Tested
4. 🚀 Running the Tests
5. 👨‍💻 Author
6. 🔧 Requirements
To run these tests, ensure you have the following installed:

Node.js
Hardhat
Chai for assertions
## 📜 Test Summary
This test suite verifies the behavior of the FundMe contract under different scenarios:

Correct initialization of the contract.
Funding and withdrawal operations.
Only the contract owner can withdraw funds.
Gas usage during withdrawal is correctly calculated.

## 🛠️ Setup
To set up and run the tests:

Clone the repo:

```bash
Copy code
git clone https://github.com/jopaleti/hardhat-fund-me.git
cd FundMe
```
Install dependencies:

```bash
Copy code
yarn install
```
Deploy contracts: Run the deployment scripts provided to deploy the FundMe contract and its dependencies.

## 🔍 Key Functions Tested
1. Constructor Initialization 🎯
Ensures that the FundMe contract correctly sets the price feed address during deployment.

```javascript
Copy code
assert.equal(fundMe.target, mockV3Aggregator.target);
```
2. Funding the Contract 💸
Ensures that the contract reverts when insufficient ETH is sent.

```javascript
Copy code
await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough");
```
3. Withdrawals by Owner Only 🔐
Verifies that only the contract owner can initiate a withdrawal.

```javascript
Copy code
await expect(fundMeConnectedContract.withdraw())
    .to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
```
4. Gas Usage Calculation ⛽
Checks the gas cost of the withdraw function to ensure efficiency.

```javascript
Copy code
const gasCost = gasUsed.mul(effectiveGasPrice);
assert.equal(startingBalance.add(gasCost).toString(), endingBalance.toString());
```
🚀 Running the Tests
To run the entire test suite, use the following command:

```bash
Copy code
npx hardhat test
```
This will run all the test cases defined in the FundMe test suite.

## 👨‍💻 Author
This testing suite was written by Opaleti Oluwatobi.

