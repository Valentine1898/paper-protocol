/*
................................................................................
................................................................................
................................................................................
................................................................................
.................:::::::::::::::::::::::::::::::::::::::::::::..................
...............=*++++++++++++++++++++++++++++++++++++++++#%*++*+:...............
.............:#=........................................*+:....=#-..............
............-%-........................................#=.......:#=.............
...........:%-........................................#=.........:%:............
...........*+........................................=#...........-#............
..........-%.........................................%:............#=...........
..........*+........................................+*.............-%...........
.........:%.........................................%-..............%-..........
.........=#........................................:%......:-:......+*..........
.........*+........................................=*.....+#+#+.....-%..........
.........#-........................................*=....-%=-=%-.....%:.........
.........%:........................................#-....#*-=-*#.....%-.........
........:%-....:::....:::....:::....:::...::::...::%:....%=====%.....#-.........
........:@=-..-===-..-===-..-===:..-===:..-===:..-=@:...:%=====@.....#=.........
........:%.........................................%:...:%=====@.....#=.........
........:%.........................................%:....%====+%.....#-.........
........:%.........................................%-....#*-=-**.....%-.........
........:%.........................................@=....-%=-=@:.....%:.........
........:%.........................................@*.....+#*%=.....-%..........
........:%.........................................@%......:-:......+*..........
........:%.........................................%@:..............%-..........
........:%.........................................%%*.............:%...........
........:%.........................................%+%:............#=...........
........:%.........................................%=**...........-%............
........:%.........................................%+=%=..........%-............
........:%.........................................%+-=%=.......:#=.............
........:%.........................................%+--=#+.....=#-..............
........:%.........................................%#****%%*=+*+:...............
........:%.........................................%-:::::::::..................
........:%.........................................%:...........................
........:%.........................................%:...........................
........:%.........................................%:...........................
........:%.........................................%:...........................
........:%.........................................%:...........................
........:%...:................:................:...%:...........................
........:%:=***+:..-+**+-..:=*+*=:..-+**+-..:+*+*=:%:...........................
........:%*=:..-+**+:..:=**+-:..-+**=:..:=**+-..:=*%:...........................
................................................................................
................................................................................
................................................................................
................................................................................
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {OracleAdapter} from "./OracleAdapter.sol";

import {URIUtils} from "./URIUtils.sol";

import {IPaperProtocol} from "./interfaces/IPaperProtocol.sol";

/**
 * @title Paper Protocol
 * @notice Paper Protocol is a protocol for locking assests untill target price is reached. While assts are locked user receives dynamic NFT which changes according to your position status.
 * @dev use OracleAdapter to get price of the asset.
 */
contract PaperProtocol is ERC721, Ownable, IPaperProtocol {
    using SafeERC20 for IERC20;

    /****************************************/
    /*            State Variables           */
    /****************************************/

    /**
     * @notice returns true if deposit is withdrawn
     */
    mapping(uint256 tokenId => bool) public isWithdrawn;

    /**
     * @notice returns deposit data for a given tokenId
     */
    mapping(uint256 => Deposit) public deposits;

    OracleAdapter public oracleAdapter;

    uint256 public nextTokenId = 1;

    /****************************************/
    /*             Constructor              */
    /****************************************/

    constructor() ERC721("Paper Protocol", "PP") Ownable(msg.sender) {}

    /****************************************/
    /*            Owner Functions           */
    /****************************************/

    function setOracleAdapter(address _oracleAdapter) public onlyOwner {
        oracleAdapter = OracleAdapter(_oracleAdapter);
        emit OracleAdapterSet(_oracleAdapter);
    }

    /****************************************/
    /*             User Functions           */
    /****************************************/

    /**
     * @notice Creates a new deposit with the specified token, amount, and target price
     * @param token The address of the token to deposit
     * @param amount The amount of tokens to deposit
     * @param priceTarget The target price for the deposit
     * @dev Mints a new NFT token representing the deposit
     */
    function deposit(
        address token,
        uint256 amount,
        uint256 priceTarget
    ) public payable {
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

        uint256 currentPrice = oracleAdapter.getPrice(token);

        deposits[nextTokenId] = Deposit({
            token: token,
            amount: amount,
            priceAtDeposit: currentPrice,
            priceTarget: priceTarget,
            timestamp: block.timestamp
        });

        _mint(msg.sender, nextTokenId);

        emit Deposited(nextTokenId, token, amount, priceTarget);
        nextTokenId++;
    }

    /**
     * @notice Withdraws tokens from a deposit
     * @param tokenId The ID of the NFT token representing the deposit
     * @dev Burns the NFT token and transfers the deposited tokens back to the owner
     */
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

        uint256 currentPrice = oracleAdapter.getPrice(userDeposit.token);

        if (currentPrice < userDeposit.priceTarget) {
            revert PriceTargetNotReached(
                tokenId,
                userDeposit.priceTarget,
                currentPrice
            );
        }

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

        emit Withdrawn(tokenId, userDeposit.token, userDeposit.amount);
    }

    /****************************************/
    /*         NFT Metadata Functions       */
    /****************************************/

    /**
     * @notice returns tokenURI for a given tokenId
     * @param tokenId tokenId of the NFT (deposit) to get the URI for
     * @return tokenURI is generated dynamically based on deposit data using URIUtils
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);

        Deposit memory dep = deposits[tokenId];

        return URIUtils.tokenURI(tokenId, dep, 18);
    }

    function contractURI() public pure returns (string memory) {
        return URIUtils.contractURI();
    }
}
