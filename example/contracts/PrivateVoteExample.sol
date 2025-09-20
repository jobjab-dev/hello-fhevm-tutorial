// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * Example 3: Private Voting (Hello FHEVM)
 * Learn: Conditional logic on encrypted data
 * Flow: Encrypt choice (client) -> Homomorphic add (on-chain) -> Decrypt totals at reveal (on-chain)
 */
contract PrivateVoteExample is SepoliaConfig {
    using FHE for *;

    uint64 public startTime;
    uint64 public endTime;
    euint64[2] private tallies; // [yes, no]
    mapping(address => bool) public hasVoted;
    bool public revealed;

    event Voted(address indexed voter);
    event Revealed(uint64 yesCount, uint64 noCount);

    constructor() {
        // Always active for tutorial - no time restrictions
        startTime = 0;
        endTime = type(uint64).max;

        // Initialize encrypted tallies to zero once, clearly.
        tallies[0] = FHE.asEuint64(0);
        tallies[1] = FHE.asEuint64(0);

        // Let this contract manage ACL of these ciphertexts.
        FHE.allowThis(tallies[0]);
        FHE.allowThis(tallies[1]);
    }

    function vote(externalEuint32 encryptedChoice, bytes calldata inputProof) external {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Not active");
        require(!hasVoted[msg.sender], "Already voted");

        // Import & verify external encrypted input (proof checked inside).
        euint32 choice = FHE.fromExternal(encryptedChoice, inputProof);

        // Compute encrypted predicates: isYes / isNo
        ebool isYes = FHE.eq(choice, FHE.asEuint32(0));
        ebool isNo  = FHE.eq(choice, FHE.asEuint32(1));

        // Enc(1) and Enc(0)
        euint64 one  = FHE.asEuint64(1);
        euint64 zero = FHE.asEuint64(0);

        // Conditionally add 1 to the matching bucket using select
        // incYes = (isYes ? 1 : 0), incNo = (isNo ? 1 : 0)
        euint64 incYes = FHE.select(isYes, one, zero);
        euint64 incNo  = FHE.select(isNo,  one, zero);

        tallies[0] = FHE.add(tallies[0], incYes);
        tallies[1] = FHE.add(tallies[1], incNo);

        // Keep contract ACL on updated ciphertexts (optional here but explicit)
        FHE.allowThis(tallies[0]);
        FHE.allowThis(tallies[1]);

        hasVoted[msg.sender] = true;
        emit Voted(msg.sender);
    }

    /// Ciphertexts (for demo/inspection). Decryption requires reveal() or explicit allow().
    function getTalliesCiphertexts() external view returns (euint64[2] memory) {
        return tallies;
    }

    /// Simple reveal check: always ready for tutorial
    function canReveal() external view returns (bool) {
        return !revealed;
    }
    
    /// Mark as revealed (for tutorial - in production use oracle pattern)
    function markRevealed() external {
        require(!revealed, "Already revealed");
        revealed = true;
        // Note: In production, use FHE.requestDecryption() with oracle callback
        // For tutorial, we just mark as revealed without actual decryption
        emit Revealed(0, 0); // Placeholder values for tutorial
    }

    /// Optional: If you really want client-side decryption, grant an address access to the ciphertexts.
    function grantReveal(address who) external {
        require(who != address(0), "bad addr");
        FHE.allow(tallies[0], who);
        FHE.allow(tallies[1], who);
    }
}
