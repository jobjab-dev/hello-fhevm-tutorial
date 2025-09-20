// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * Example 1: FHE Addition (Hello FHEVM)
 * Flow: set A (encrypted) -> set B (encrypted) -> compute (homomorphic add) -> getResult (ciphertext)
 * Note: euint8 wraps mod 256. Use euint16/euint32 for larger ranges.
 */
contract FHEAdd is SepoliaConfig {
    euint8 private _a;
    euint8 private _b;
    euint8 private _result;

    bool private _hasA;
    bool private _hasB;

    event InputsSet(address indexed setter, bool hasA, bool hasB);
    event SumComputed(address indexed caller);

    function setA(externalEuint8 inputA, bytes calldata inputProof) external {
        _a = FHE.fromExternal(inputA, inputProof);
        // Allow this contract to manage ACL on _a (does not publicly reveal plaintext)
        FHE.allowThis(_a);
        _hasA = true;
        emit InputsSet(msg.sender, _hasA, _hasB);
    }

    function setB(externalEuint8 inputB, bytes calldata inputProof) external {
        _b = FHE.fromExternal(inputB, inputProof);
        FHE.allowThis(_b);
        _hasB = true;
        emit InputsSet(msg.sender, _hasA, _hasB);
    }

    function computeSum() external {
        require(_hasA && _hasB, "Inputs not set");
        // homomorphic: no decryption on-chain
        _result = FHE.add(_a, _b);

        // Set ACL: contract can manage; caller can decrypt via KMS
        FHE.allowThis(_result);
        FHE.allow(_result, msg.sender);

        emit SumComputed(msg.sender);
    }

    /// Optional: grant another address permission to decrypt the last result
    function grantAccess(address user) external {
        require(user != address(0), "bad addr");
        // Anyone can share access for demo purposes; lock it down if desired.
        FHE.allow(_result, user);
    }

    /// Returns the ciphertext; client-side/KMS will decrypt if ACL permits.
    function getResult() external view returns (euint8) {
        return _result;
    }
}
