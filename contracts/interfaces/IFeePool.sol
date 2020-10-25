// SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;

interface IFeePool {
    function feeValue() external view returns (uint256);

    function feeDecimals() external view returns (uint8);

    function getCollectable(uint256 amount) external view returns (uint256);

    function setFee(uint256 value, uint8 decimals) external;

    function collect(uint256 amount) external;

    function withdraw(address to, uint256 amount) external;

    function mint(address to, uint256 amount) external;
}