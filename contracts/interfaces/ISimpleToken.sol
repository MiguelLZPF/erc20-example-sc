// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
interface ISimpleToken is IERC20 {
  // EVENTS
  
  /**
   * @dev constructor
   */
  function initialize() external;

  /**
   * @dev Mintable
   * @param to Address of the recipiant of the amount of the
   * @param amount Amount of tokens to be minted
   */
  function mint(address to, uint256 amount) external;
}
