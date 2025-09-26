// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SecretNumberGame is SepoliaConfig {

    euint32 private secretNumber;
    mapping(address => euint32) public attempts;
    // Encrypted hint per user: 0 = too low, 1 = too high, 2 = correct
    mapping(address => euint32) public lastHint;
    // Track whether attempts[user] has been initialized to an encrypted zero
    mapping(address => bool) private _attemptInit;
    
    // No plaintext events; keep on-chain data encrypted

    constructor() {}

    function setSecret(
        externalEuint32 encSecret,
        bytes calldata proof
    ) external {
        secretNumber = FHE.fromExternal(encSecret, proof);
        FHE.allowThis(secretNumber);
    }

    function makeGuess(
        externalEuint32 encryptedGuess,
        bytes calldata inputProof
    ) external {
        euint32 guess = FHE.fromExternal(encryptedGuess, inputProof);
        
        // Increment attempts (encrypted)
        if (!_attemptInit[msg.sender]) {
            attempts[msg.sender] = FHE.asEuint32(0);
            _attemptInit[msg.sender] = true;
            FHE.allowThis(attempts[msg.sender]);
        }
        attempts[msg.sender] = FHE.add(attempts[msg.sender], FHE.asEuint32(1));
        FHE.allowThis(attempts[msg.sender]);
        
        // Compute encrypted relations
        ebool isEqual = FHE.eq(guess, secretNumber);
        ebool isLower = FHE.lt(guess, secretNumber);
        
        // Build encrypted hint: 0=too low, 1=too high, 2=correct
        euint32 zero = FHE.asEuint32(0);
        euint32 one  = FHE.asEuint32(1);
        euint32 two  = FHE.asEuint32(2);
        euint32 lowOrHigh = FHE.select(isLower, zero, one);
        euint32 hint = FHE.select(isEqual, two, lowOrHigh);
        
        // Store encrypted hint; decryption happens off-chain via KMS per ACL
        lastHint[msg.sender] = hint;
        FHE.allowThis(lastHint[msg.sender]);
    }

    function getAttempts(address player) external view returns (euint32) {
        return attempts[player];
    }
    
    function allowAttempts(address user) external {
        require(msg.sender == user, "Can only allow own attempts");
        FHE.allow(attempts[user], user);
    }
    
    function allowMyHint() external {
        FHE.allow(lastHint[msg.sender], msg.sender);
    }
}
