// SPDX-License-Identifier: MIT
// Pragma
pragma solidity ^0.8.8;
// Imports
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
// Error Codes
error FundMe__NotOwner();

// Interfaces, Library, Contracts
/**
 * @title A contract for crowd funding
 * @author jopaleti
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feed as our library
 */
contract FundMe {
    // Type declarations
    using PriceConverter for uint256; 

    uint256 public MINIMUM_USD = 50 * 1e18;
    // state variables!
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    address public immutable i_owner;

    AggregatorV3Interface public priceFeed;

    // It get called immediately you deployed the contract
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as our library
     */
    function fund() public payable  {
        // Want to be able to strore minimum fund amount in USD
        require(msg.value.getConversionRate(priceFeed) > 1e18, "Didn't send enough "); // 1e18 = 1 * 10 ** 18
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // resetting the funders array to have a BRAND NEW ADDRESS with 0 object in it
        funders = new address[](0);
        // Withdraw Funds

        // transfer
        // payable (msg.sender).transfer(address(this).balance);
        // send
        // bool sendSuccess = payable (msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable (msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "call failed");
    }

    modifier onlyOwner {
        // require(msg.sender == i_owner, "Sender is not the owner");
        if (msg.sender != i_owner) { revert FundMe__NotOwner(); }
        _;
    }

    receive() external payable { 
        fund();
    }

    fallback() external payable { 
        fund();
    }
}