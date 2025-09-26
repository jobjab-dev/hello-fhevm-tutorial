// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract OptimizedFHE is SepoliaConfig {

    struct EncryptedData {
        euint32 value1;
        euint32 value2;
        euint64 sum;
        bool initialized;
    }
    
    mapping(address => EncryptedData) private userData;
    mapping(address => bool) private _userInit;
    
    event BatchProcessed(address indexed user, uint256 gasUsed);
    event IndividualProcessed(address indexed user, uint256 gasUsed);
    
    constructor() {}

    // ❌ Inefficient: Multiple separate operations
    function inefficientUpdate(
        externalEuint32 val1, bytes calldata proof1,
        externalEuint32 val2, bytes calldata proof2
    ) external {
        uint256 gasStart = gasleft();
        
        // Initialize user data if needed
        if (!_userInit[msg.sender]) {
            userData[msg.sender] = EncryptedData({
                value1: FHE.asEuint32(0),
                value2: FHE.asEuint32(0), 
                sum: FHE.asEuint64(0),
                initialized: false
            });
            _userInit[msg.sender] = true;
        }
        
        userData[msg.sender].value1 = FHE.fromExternal(val1, proof1);
        FHE.allowThis(userData[msg.sender].value1);
        
        userData[msg.sender].value2 = FHE.fromExternal(val2, proof2);
        FHE.allowThis(userData[msg.sender].value2);
        
        userData[msg.sender].sum = FHE.add(
            FHE.asEuint64(userData[msg.sender].value1),
            FHE.asEuint64(userData[msg.sender].value2)
        );
        FHE.allowThis(userData[msg.sender].sum);
        
        userData[msg.sender].initialized = true;
        
        uint256 gasUsed = gasStart - gasleft();
        emit IndividualProcessed(msg.sender, gasUsed);
    }
    
    // ✅ Efficient: Batch operations with reused values
    function efficientUpdate(
        externalEuint32 val1, bytes calldata proof1,
        externalEuint32 val2, bytes calldata proof2
    ) external {
        uint256 gasStart = gasleft();
        
        // Initialize user data if needed (same as inefficient for fair comparison)
        if (!_userInit[msg.sender]) {
            userData[msg.sender] = EncryptedData({
                value1: FHE.asEuint32(0),
                value2: FHE.asEuint32(0), 
                sum: FHE.asEuint64(0),
                initialized: false
            });
            _userInit[msg.sender] = true;
        }
        
        // Import both values
        euint32 encVal1 = FHE.fromExternal(val1, proof1);
        euint32 encVal2 = FHE.fromExternal(val2, proof2);
        
        // Compute sum once
        euint64 newSum = FHE.add(FHE.asEuint64(encVal1), FHE.asEuint64(encVal2));
        
        // Batch assignment
        userData[msg.sender] = EncryptedData({
            value1: encVal1,
            value2: encVal2,
            sum: newSum,
            initialized: true
        });
        
        // Single permission call for struct
        _grantPermissions(msg.sender);
        
        uint256 gasUsed = gasStart - gasleft();
        emit BatchProcessed(msg.sender, gasUsed);
    }
    
    function _grantPermissions(address user) private {
        FHE.allowThis(userData[user].value1);
        FHE.allowThis(userData[user].value2);
        FHE.allowThis(userData[user].sum);
    }
    
    function getUserData(address user) external view returns (EncryptedData memory) {
        return userData[user];
    }
    
    function allowUserData(address user) external {
        require(msg.sender == user, "Can only allow own data");
        FHE.allow(userData[user].value1, user);
        FHE.allow(userData[user].value2, user);
        FHE.allow(userData[user].sum, user);
    }
    
    // Demonstrate batch computation patterns
    function batchCompute(
        externalEuint32[] calldata values,
        bytes[] calldata proofs
    ) external returns (euint64) {
        require(values.length == proofs.length, "Mismatched arrays");
        require(values.length > 0, "Empty arrays");
        
        euint64 result = FHE.asEuint64(0);
        
        // Process all values in a single loop
        for (uint i = 0; i < values.length; i++) {
            euint32 val = FHE.fromExternal(values[i], proofs[i]);
            result = FHE.add(result, FHE.asEuint64(val));
        }
        
        FHE.allowThis(result);
        return result;
    }
}
