const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { describe, it } = require("mocha");

describe("FundMe", async function () {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    const sendValue = ethers.utils.parseEther("1");

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContractAt("FundMe", deployer);
        mockV3Aggregator = await ethers.getContractAt("MockV3Aggregator");
    });

    describe("constructor", function () {
        it("sets the aggregator address correctly", async function () {
            const response = await fundMe.getPriceFeed();
            assert.equal(response, mockV3Aggregator.address);
        });
    });

    describe("fund", function () {
        it("Fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!",
            );
        });

        it("Updates the amount funded data structure", async function () {
            const tx = await fundMe.fund({ value: sendValue });
            await tx.wait(1);
            const response = await fundMe.getAddressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds funder to array of funders", async function () {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.getFunder(0);
            assert.equal(response, deployer);
        });
    });

    describe("withdraw", function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue });
        });

        it("withdraws ETH from a single funder", async function () {
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address,
            );
            const startingDeployerBalance =
                await fundMe.provider.getBalance(deployer);

            const tx = await fundMe.withdraw();
            const txReceipt = await tx.wait();
            const gasCost = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address,
            );
            const endingDeployerBalance =
                await fundMe.provider.getBalance(deployer);

            assert.equal(endingFundMeBalance.toString(), "0");
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString(),
            );
        });

        it("allows us to withdraw with multiple funders", async function () {
            const accounts = await ethers.getSigners();
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = fundMe.connect(accounts[i]);
                await fundMeConnectedContract.fund({ value: sendValue });
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address,
            );
            const startingDeployerBalance =
                await fundMe.provider.getBalance(deployer);

            const tx = await fundMe.cheaperWithdraw();
            const txReceipt = await tx.wait();
            const withdrawGasCost = txReceipt.gasUsed.mul(
                txReceipt.effectiveGasPrice,
            );

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address,
            );
            const endingDeployerBalance =
                await fundMe.provider.getBalance(deployer);

            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(withdrawGasCost).toString(),
            );

            await expect(fundMe.getFunder(0)).to.be.reverted;
            for (let i = 1; i < 6; i++) {
                assert.equal(
                    (
                        await fundMe.getAddressToAmountFunded(
                            accounts[i].address,
                        )
                    ).toString(),
                    "0",
                );
            }
        });

        it("Only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners();
            const fundMeConnectedContract = fundMe.connect(accounts[1]);
            await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith(
                "FundMe__NotOwner",
            );
        });
    });
});

