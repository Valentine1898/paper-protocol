// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PaperProtocol is ERC721, Ownable {
    using SafeERC20 for IERC20;

    error TokenAmountCannotBeZero(address token);
    error EtherAmountMustBeZeroForTokenDeposit(
        address token,
        uint256 etherAmount
    );
    error CallerIsNotNFTOwner(address caller, address owner);
    error TokenAlreadyWithdrawn(uint256 tokenId);
    error EtherTransferFailed(uint256 tokenId);
    event Deposited(
        uint256 indexed tokenId,
        address indexed token,
        uint256 amount,
        uint256 priceTarget
    );

    struct Deposit {
        address token;
        uint256 amount;
        uint256 priceTarget;
        uint256 timestamp; // deposited at
        bool isPreset;
    }

    mapping(address token => mapping(uint256 amount => mapping(uint256 priceTarget => bool)))
        public isPreset;

    mapping(uint256 tokenId => bool) public isWithdrawn;

    mapping(uint256 => Deposit) public deposits;

    uint256 public nextTokenId = 1;

    constructor() ERC721("Paper Protocol", "PP") Ownable(msg.sender) {}

    function deposit(
        address token,
        uint256 amount,
        uint256 priceTarget
    ) public payable {
        bool isPreset_ = isPreset[token][amount][priceTarget];

        if (token == address(0)) {
            amount = msg.value;
        }

        if (amount == 0) {
            revert TokenAmountCannotBeZero(token);
        }

        if (token != address(0)) {
            if (msg.value != 0) {
                revert EtherAmountMustBeZeroForTokenDeposit(token, msg.value);
            }

            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        deposits[nextTokenId] = Deposit({
            token: token,
            amount: amount,
            priceTarget: priceTarget,
            timestamp: block.timestamp,
            isPreset: isPreset_
        });

        _mint(msg.sender, nextTokenId);

        nextTokenId++;
    }

    function withdraw(uint256 tokenId) public {
        if (isWithdrawn[tokenId]) {
            revert TokenAlreadyWithdrawn(tokenId);
        }

        address nftOwner = _requireOwned(tokenId);

        if (msg.sender != nftOwner) {
            revert CallerIsNotNFTOwner(msg.sender, nftOwner);
        }

        isWithdrawn[tokenId] = true;

        Deposit memory userDeposit = deposits[tokenId];

        if (userDeposit.token == address(0)) {
            (bool success, ) = payable(msg.sender).call{
                value: userDeposit.amount
            }("");
            if (!success) {
                revert EtherTransferFailed(tokenId);
            }
        } else {
            IERC20(userDeposit.token).safeTransfer(
                msg.sender,
                userDeposit.amount
            );
        }
    }
}
