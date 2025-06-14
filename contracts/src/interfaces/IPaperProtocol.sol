// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPaperProtocol {
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
     * @param priceAtDeposit price at which deposit was made
     * @param priceTarget price target to reach to be able to withdraw
     * @param timestamp timestamp when deposit was made
     */
    struct Deposit {
        address token;
        uint256 amount;
        uint256 priceAtDeposit;
        uint256 priceTarget;
        uint256 timestamp;
    }

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

    function isWithdrawn(uint256 tokenId) external view returns (bool);

    function nextTokenId() external view returns (uint256);

    /****************************************/
    /*            Owner Functions           */
    /****************************************/

    function setOracleAdapter(address _oracleAdapter) external;

    /****************************************/
    /*             User Functions           */
    /****************************************/

    function deposit(
        address token,
        uint256 amount,
        uint256 priceTarget
    ) external payable;

    function withdraw(uint256 tokenId) external;
}
