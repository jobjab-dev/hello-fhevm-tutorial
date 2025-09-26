// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, ebool, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialERC20 is SepoliaConfig {

    mapping(address => euint64) private balances;
    mapping(address => bool) private _balanceInit;
    mapping(address => ebool) private _lastOk; // Track last transfer success
    euint64 private totalSupply;
    bool private _supplyInitialized;
    
    string public name = "Confidential Token";
    string public symbol = "CTKN";
    uint8 public decimals = 18;
    
    event Transfer(address indexed from, address indexed to);
    event Mint(address indexed to);

    constructor() {
        // Initialize with zero supply; use mint() to add tokens
        totalSupply = FHE.asEuint64(0);
        FHE.allowThis(totalSupply);
    }
    
    function initializeSupply(
        externalEuint64 encryptedSupply,
        bytes calldata inputProof
    ) external {
        require(!_supplyInitialized, "Supply already initialized");
        // In production, add proper access control (onlyOwner, etc.)
        euint64 supply = FHE.fromExternal(encryptedSupply, inputProof);
        totalSupply = supply;
        balances[msg.sender] = supply;
        _balanceInit[msg.sender] = true; // Mark sender as initialized
        _supplyInitialized = true;
        FHE.allowThis(totalSupply);
        FHE.allowThis(balances[msg.sender]);
        emit Mint(msg.sender);
    }

    function transfer(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool) {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        // Sender must have been initialized (e.g., via initializeSupply)
        
        // Initialize recipient balance if needed
        if (!_balanceInit[to]) {
            balances[to] = FHE.asEuint64(0);
            _balanceInit[to] = true;
        }
        
        // Check sufficient balance with encrypted comparison (no on-chain decrypt)
        ebool canPay = FHE.le(amount, balances[msg.sender]);
        euint64 senderMinus = FHE.sub(balances[msg.sender], amount);
        euint64 toPlus = FHE.add(balances[to], amount);
        
        // Conditional update: if canPay, use new values; else keep original (no underflow)
        balances[msg.sender] = FHE.select(canPay, senderMinus, balances[msg.sender]);
        balances[to] = FHE.select(canPay, toPlus, balances[to]);
        
        // Store encrypted success flag for sender to check
        _lastOk[msg.sender] = canPay;
        
        // Grant permissions for new balances and result
        FHE.allowThis(balances[msg.sender]);
        FHE.allowThis(balances[to]);
        FHE.allowThis(_lastOk[msg.sender]);
        
        emit Transfer(msg.sender, to); // Generic event; check _lastOk for success
        return true;
    }

    function balanceOf(address account) external view returns (euint64) {
        // Returns encrypted balance - only account can decrypt with proper permissions
        return balances[account];
    }
    
    function allowMyBalance() external {
        // Grant caller permission to decrypt their own balance
        FHE.allow(balances[msg.sender], msg.sender);
    }
    
    function allowMyLastResult() external {
        // Grant caller permission to decrypt their last transfer result
        FHE.allow(_lastOk[msg.sender], msg.sender);
    }
    
    function mint(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external {
        // In production, add proper access control (onlyOwner, etc.)
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        
        // Initialize recipient balance if needed
        if (!_balanceInit[to]) {
            balances[to] = FHE.asEuint64(0);
            _balanceInit[to] = true;
        }
        
        balances[to] = FHE.add(balances[to], amount);
        totalSupply = FHE.add(totalSupply, amount);
        
        FHE.allowThis(balances[to]);
        FHE.allowThis(totalSupply);
        
        emit Mint(to);
    }
    
    function getTotalSupply() external view returns (euint64) {
        return totalSupply;
    }
}
