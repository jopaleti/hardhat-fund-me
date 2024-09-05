// SPDX-License-Identifier: MIT
// Pragma
pragma solidity ^0.8.8;
// Imports
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// 3. Interfaces, Libraries, Contracts
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
    address[] public s_funders;
    mapping(address => uint256) public s_addressToAmountFunded;

    address public immutable i_owner;

    AggregatorV3Interface public s_priceFeed;

    // It get called immediately you deployed the contract
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as our library
     */
    function fund() public payable {
        // Want to be able to strore minimum fund amount in USD
        require(
            msg.value.getConversionRate(s_priceFeed) > 1e18,
            "Didn't send enough "
        ); // 1e18 = 1 * 10 ** 18
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

     // Modifiers
    modifier onlyOwner() {
        // require(msg.sender == i_owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        // resetting the funders array to have a BRAND NEW ADDRESS with 0 object in it
        s_funders = new address[](0);
        // Withdraw Funds

        // transfer
        // payable (msg.sender).transfer(address(this).balance);
        // send
        // bool sendSuccess = payable (msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "call failed");
    }

    // CHEAPER WITHDRAW
    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        // Mapping cant be in memory, sorry!
        for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
     /** @notice Gets the amount that an address has funded
     *  @param fundingAddress the address of the funder
     *  @return the amount funded
     */
    function getAddressToAmountFunded(address fundingAddress)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[fundingAddress];
    }
     function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
    function getBalance(address addr) public view returns (uint256) {
        return s_addressToAmountFunded[addr];
    }
}
