// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * Example 2: FHE Counter
 * Learn: Persistent encrypted state management
 * Pattern: Increment/Decrement encrypted values (Encrypt -> Compute -> Decrypt via ACL)
 *
 * Notes:
 * - euint32 arithmetic wraps modulo 2^32. For beginners, avoid decrementing more than the current value.
 *   (Advanced: implement saturating subtract using FHE comparisons + cmux.)
 */
contract FHECounter is SepoliaConfig {
    euint32 private _count;

    event Incremented(address indexed caller);
    event Decremented(address indexed caller);

    constructor() {
        // Initialize encrypted counter to 0 and allow this contract to manage its ACL.
        _count = FHE.asEuint32(0);
        FHE.allowThis(_count);
    }

    /// @notice Add an encrypted amount to the counter.
    /// @param inputValue Encrypted uint32 payload (externalEuint32) + proof
    function increment(externalEuint32 inputValue, bytes calldata inputProof) external {
        // Convert external ciphertext+proof into an internal ciphertext
        euint32 encryptedValue = FHE.fromExternal(inputValue, inputProof);

        // Homomorphic add: no plaintext is revealed on-chain
        _count = FHE.add(_count, encryptedValue);

        // ACL: let this contract manage; allow caller to decrypt the latest value (demo)
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);

        emit Incremented(msg.sender);
    }

    /// @notice Subtract an encrypted amount from the counter.
    /// @dev Wraps modulo 2^32 if amount > current count. (For a tutorial this is acceptable; document it clearly.)
    function decrement(externalEuint32 inputValue, bytes calldata inputProof) external {
        euint32 encryptedValue = FHE.fromExternal(inputValue, inputProof);

        // Homomorphic subtract: may wrap under modulo arithmetic
        _count = FHE.sub(_count, encryptedValue);

        // ACL: same policy as increment()
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);

        emit Decremented(msg.sender);
    }

    /// @return The encrypted counter value (ciphertext). Decryption requires ACL permissions via KMS.
    function getCount() external view returns (euint32) {
        return _count;
    }

    /// @notice (Optional) Share decryption rights for the latest counter value with another address.
    function grantAccess(address user) external {
        require(user != address(0), "bad addr");
        FHE.allow(_count, user);
    }
}
