// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Riba.sol";


/*
 * Small bank the gives 10% APY on a deposit from a user
 */
contract Bank{
    
    // ERC20 Token address that we use to pay the interest gained by the user
    Riba private coin; 
    
    mapping (address => uint256) public balancesEth;
    mapping (address => uint256) public startTime;
    
    event Deposited(address who, uint256 amount);
    event Withdrew(address who, uint256 eth);
    
    
    constructor(Riba coin_) {
        coin = coin_;
    }
    
    /*
     * Creates a new eth deposit from wich the user will gain interest over time
     * You can't make multiple deposts
     */
    function deposit() public payable {
       // You can only make one depost
        require(balancesEth[msg.sender] == 0, "You'd already deposited some eth");
        
        // You need to deposit at least 0.01 Eth
        require(msg.value >= 10e15, "You need to deposit at least 0.01 Eth");
        
        balancesEth[msg.sender] = msg.value;
        startTime[msg.sender] = block.timestamp;
        
        emit Deposited(msg.sender, msg.value);
    }
    
    /*
     * Withdraws the ether deposited by the user and mints Riba tokens for the user that
     * correspond to the amount of interest gained by the user
     */
    function withdraw() public{
        require(balancesEth[msg.sender] > 0, "You haven't deposited any eth");
        
        uint256 ethSender = balancesEth[msg.sender];
        
        uint256 interestPerSecond =  ethSender / (10 * 31557600);
        
        coin.mint(msg.sender, (block.timestamp - startTime[msg.sender]) * interestPerSecond);
        
        payable(msg.sender).transfer(balancesEth[msg.sender]);
        balancesEth[msg.sender] = 0;
        startTime[msg.sender] = 0;
        
        emit Withdrew(msg.sender, ethSender);
        
    }
}