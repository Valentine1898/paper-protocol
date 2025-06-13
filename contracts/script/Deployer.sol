// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {MockOracle} from "../test/mocks/MockOracle.sol";
import {OracleAdapter} from "../src/OracleAdapter.sol";
import {PaperProtocol} from "../src/PaperProtocol.sol";

library Deployer {
    function deployMockOracle() internal returns (MockOracle) {
        MockOracle oracle = new MockOracle(8);
        oracle.setPrice(2000e8);
        return oracle;
    }

    function deployOracleAdapter() internal returns (OracleAdapter) {
        return new OracleAdapter();
    }

    function deployPaperProtocol() internal returns (PaperProtocol) {
        return new PaperProtocol();
    }

    function setupOracleAdapter(
        OracleAdapter adapter,
        MockOracle oracle
    ) internal {
        OracleAdapter.OracleConfig memory config = OracleAdapter.OracleConfig({
            oracleType: OracleAdapter.OracleType.Chainlink,
            oracleAddress: address(oracle),
            decimals: 8,
            heartbeat: 1 hours
        });

        adapter.setOracle(address(0), config);
    }

    function deploy()
        internal
        returns (
            MockOracle oracle,
            OracleAdapter adapter,
            PaperProtocol protocol
        )
    {
        oracle = deployMockOracle();
        adapter = deployOracleAdapter();
        protocol = deployPaperProtocol();

        setupOracleAdapter(adapter, oracle);
    }
}
