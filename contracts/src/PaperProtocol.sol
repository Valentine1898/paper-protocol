// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {OracleAdapter} from "./OracleAdapter.sol";

import {URIUtils} from "./URIUtils.sol";

/**
 * @title Paper Protocol
 * @notice Paper Protocol is a protocol for locking assests untill target price is reached. While assts are locked user receives dynamic NFT which changes according to your position status.
 * @dev use OracleAdapter to get price of the asset.
 */
contract PaperProtocol is ERC721, Ownable {
    using SafeERC20 for IERC20;

    /****************************************/
    /*               Errors                 */
    /****************************************/

    error TokenAmountCannotBeZero(address token);
    error EtherAmountMustBeZeroForTokenDeposit(
        address token,
        uint256 etherAmount
    );
    error CallerIsNotNFTOwner(address caller, address owner);
    error TokenAlreadyWithdrawn(uint256 tokenId);
    error EtherTransferFailed(uint256 tokenId);
    error PriceTargetNotReached(
        uint256 tokenId,
        uint256 targetPrice,
        uint256 currentPrice
    );

    /****************************************/
    /*               Events                 */
    /****************************************/

    event Deposited(
        uint256 indexed tokenId,
        address indexed token,
        uint256 amount,
        uint256 priceTarget
    );
    event Withdrawn(
        uint256 indexed tokenId,
        address indexed token,
        uint256 amount
    );
    event OracleAdapterSet(address indexed oracleAdapter);
    event PresetSet(
        address indexed token,
        uint256 indexed amount,
        uint256 indexed priceTarget
    );
    event PresetRemoved(bytes32 indexed presetId);

    /****************************************/
    /*               Structs                */
    /****************************************/

    /**
     * @notice Preset is a predefined deposit configuration to be able to have unique NFT
     * @param token address of token to deposit. address(0) for ETH
     * @param amount amount of token to deposit
     * @param priceTarget price target to reach to be able to withdraw
     */
    struct Preset {
        address token;
        uint256 amount;
        uint256 priceTarget;
    }

    /**
     * @notice Deposit is a struct that stores user deposit information
     * @param token address of token that was deposited. address(0) for ETH
     * @param amount amount of token that was deposited
     * @param priceTarget price target to reach to be able to withdraw
     * @param timestamp timestamp when deposit was made
     */
    struct Deposit {
        address token;
        uint256 amount;
        uint256 priceTarget;
        uint256 timestamp;
        bool isPreset;
    }

    /****************************************/
    /*            State Variables           */
    /****************************************/

    /**
     * @notice returns true if it (deposit data) is a preset
     */
    mapping(bytes32 presetId => Preset) public presets;

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

    function setPresets(Preset[] memory presets_) public onlyOwner {
        for (uint256 i = 0; i < presets_.length; i++) {
            presets[
                getPresetId(
                    presets_[i].token,
                    presets_[i].amount,
                    presets_[i].priceTarget
                )
            ] = presets_[i];

            emit PresetSet(
                presets_[i].token,
                presets_[i].amount,
                presets_[i].priceTarget
            );
        }
    }

    function removePresets(bytes32[] memory presetIds) public onlyOwner {
        for (uint256 i = 0; i < presetIds.length; i++) {
            delete presets[presetIds[i]];
            emit PresetRemoved(presetIds[i]);
        }
    }

    /****************************************/
    /*          Pure/view Functions         */
    /****************************************/

    /**
     * @notice generate preset id from deposit data
     */
    function getPresetId(
        address token,
        uint256 amount,
        uint256 priceTarget
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(token, amount, priceTarget));
    }

    function getPreset(
        address token,
        uint256 amount,
        uint256 priceTarget
    ) public view returns (Preset memory) {
        return presets[getPresetId(token, amount, priceTarget)];
    }

    function checkIsPreset(Preset memory preset) public pure returns (bool) {
        return preset.amount != 0 && preset.priceTarget != 0;
    }

    /****************************************/
    /*             User Functions           */
    /****************************************/

    /**
     * @notice deposit token to the protocol
     * @dev is deposited data is a preset than user will retrieve special NFT
     * @param token address of token to deposit. address(0) for ETH
     * @param amount amount of token to deposit
     * @param priceTarget price target to reach to be able to withdraw
     */
    function deposit(
        address token,
        uint256 amount,
        uint256 priceTarget
    ) public payable {
        Preset memory preset = getPreset(token, amount, priceTarget);

        bool isPreset_ = checkIsPreset(preset);

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

    /**
     * @notice withdraw token from the protocol
     * @dev user is only able to withdraw if price target is reached
     * @param tokenId tokenId of the NFT to withdraw
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
        return URIUtils._tokenURI(tokenId);
    }

    function contractURI() public pure returns (string memory) {
        return URIUtils._contractURI();
    }
}
