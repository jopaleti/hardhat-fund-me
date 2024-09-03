const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

describe("FundMe", async function () {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    beforeEach(async function () {
        // Deploy our fundMe contract
        // using hardhat-deploy
        // const accounts = await ethers.getSigners();
        // const accountZero = accounts[0];
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        // Getting the most recent deploy of fundMe contract && connect to deployer
        fundMe = await ethers.getContractAt("FundMe", deployer);
        mockV3Aggregator = await ethers.getContractAt(
            "MockV3Aggregator",
            deployer,
        );
        console.log({
            Fundme: fundMe.runner.provider._hardhatProvider._providerFactory,
        });
        // console.log(mockV3Aggregator);
    });

    describe("constructor", async function () {
        it("sets the aggregator address correctly", async function () {
            const response = await fundMe.getPriceFeed;
            assert.equal(response, mockV3Aggregator.address);
        });
    });

    describe("fund", async function () {
        // const sendValue = ethers.utils.parseEther("1");
        it("Fails if you don't send enough ETH", async () => {
            // await expect(fundMe.fund()).to.be.revertedWith(
            //     "You need to spend more ETH!",
            // );
            await fundMe.fund();
        });
        const sendValue = ethers.parseEther("0.01");
        it("Updates the amount funded data structure", async () => {
            const tx = await fundMe.fund({
                value: "1", // The value you're sending
                // gasPrice: ethers.utils.parseUnits("10", "gwei"),
            });
            await tx.wait(1);
            const response =
                await fundMe.getAddressToAmountFunded(
                );
            assert.equal(response.toString(), sendValue.toString());
            // console.log({
            //     response: "fundMe.addressToAmountFunded.target",
            //     response: deployer,
            // });
            // const x = await fundMe.addressToAmountFunded(deployer);
            // console.log({
            //     tx: x,
            // });
        });
        it("Adds funder to array of funders", async () => {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.target;
            assert.equal(response, deployer);
        });
        // it("Adds funder to array of funders", async () => {
        //     const sendValue = ethers.formatEther("1");
        //     await fundMe.fund({ value: sendValue });
        //     const response = await fundMe.founders(0);
        //     assert.equal(response, deployer);
        // });
        // it("Adds funder to array of funders", async () => {
        //     const sendValue = ethers.formatEther("1");
        //     console.log("sendValue")
        //     await fundMe.fund();
        //     console.log(fundMe);
        //     // const response = await fundMe.getFunders[1];
        //     console.log(response, deployer)
        //     assert.equal(response, deployer);
        // });
    });
});
