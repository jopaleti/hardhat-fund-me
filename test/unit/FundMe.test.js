const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe;
          let mockV3Aggregator;
          let deployer;
          let accDeployer;
          const sendValue = ethers.parseEther("1");
          beforeEach(async () => {
              const accounts = await ethers.getSigners();
              accDeployer = accounts[0];
              console.log({ accDeployer: accDeployer });

              await deployments.fixture(["all"]);

              // Get the deployed FundMe contract
              const fundMeDeployment = await deployments.get("FundMe");

                // Getting the contract address
              deployer = fundMeDeployment.address;
              fundMe = await ethers.getContractAt("FundMe", deployer);
              mockV3Aggregator = await ethers.getContractAt(
                  "MockV3Aggregator",
                  deployer,
              );
              console.log({ fundMe: fundMe });
              console.log({ mockV3Aggregator: mockV3Aggregator.target });
          });

          describe("constructor", function () {
              it("sets the aggregator addresses correctly", async () => {
                  //   const response = await fundMe.getPriceFeed();
                  assert.equal(fundMe.target, mockV3Aggregator.target);
              });
          });

          describe("fund", function () {
              // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
              // could also do assert.fail
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send enough ",
                  );
              });
              // we could be even more precise here by making sure exactly $50 works
              // but this is good enough for now
              // it("Updates the amount funded data structure", async () => {
              //     await fundMe.fund({ value: sendValue });
              //     const response =
              //         await fundMe.getAddressToAmountFunded(accDeployer.address);
              //     assert.equal(response.toString(), "14000000000000000000");
              // });
              it("Adds funder to array of funders", async () => {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getFunder(0);
                  assert.equal(response, accDeployer.address);
              });
          });
          describe("withdraw", function () {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });
              it("withdraws ETH from a single funder", async () => {
                  // Arrange
                  const startingFundMeBalance = await fundMe.getBalance(
                      fundMe.target,
                  );
                  const startingDeployerBalance =
                      await fundMe.getBalance(accDeployer);

                  // Act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait();
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  // Check if gasUsed and effectiveGasPrice are available
                  if (!gasUsed || !effectiveGasPrice) {
                      console.error(
                          "gasUsed or effectiveGasPrice is undefined",
                      );
                      return;
                  }
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerBalance =
                      await fundMe.getBalance(accDeployer);

                  // Assert
                  // Maybe clean up to understand the testing
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString(),
                  );
              });
              // this test is overloaded. Ideally we'd split it into multiple tests
              // but for simplicity we left it as one
              it("is allows us to withdraw with multiple funders", async () => {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  for (i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance = await fundMe.getBalance(
                      fundMe.target,
                  );
                  const startingDeployerBalance =
                      await fundMe.getBalance(accDeployer);

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  // Let's comapre gas costs :)
                  // const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait();
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;

                  // Check if gasUsed and effectiveGasPrice are available
                  if (!gasUsed || !effectiveGasPrice) {
                      console.error(
                          "gasUsed or effectiveGasPrice is undefined",
                      );
                      return;
                  }
                  const withdrawGasCost = gasUsed.mul(effectiveGasPrice);
                  console.log(`GasCost: ${withdrawGasCost}`);
                  console.log(`GasUsed: ${gasUsed}`);
                  console.log(`GasPrice: ${effectiveGasPrice}`);
                  const endingFundMeBalance = await fundMe.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerBalance =
                      await fundMe.getBalance(accDeployer);
                  // Assert
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(withdrawGasCost).toString(),
                  );
                  // Make a getter for storage variables
                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address,
                          ),
                          0,
                      );
                  }
              });
              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1],
                  );
                  await expect(
                      fundMeConnectedContract.withdraw(),
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });
          });
      });
