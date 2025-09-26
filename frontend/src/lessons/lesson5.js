import { getContractAddress, getContractInfo } from '../config/contracts.js';

export const lesson5 = {
  title: "Confidential Token Transfer",
  subtitle: "Private Balance Management",
  steps: [
    {
      type: "explanation",
      title: "The Privacy Problem in DeFi",
      content: "Regular ERC20 tokens expose all balances and transfers publicly. Anyone can see exactly how much you own, spend, or receive. This creates privacy risks, enables front-running, and can lead to targeted attacks. FHE tokens keep balances encrypted while maintaining full functionality.",
      question: "What's the main privacy issue with regular ERC20 tokens?",
      options: [
        "They're too slow to transfer",
        "Everyone can see your exact balance and transaction amounts",
        "They cost too much gas",
        "They can't be used in smart contracts"
      ],
      correct: 1
    },
    {
      type: "code-explanation",
      title: "Encrypted Balance Operations",
      content: "FHE tokens use encrypted balances (euint64) instead of regular uint256. Transfer logic uses FHE.sub() for sender, FHE.add() for recipient, and FHE.le() to check sufficient balance - all without revealing actual amounts.",
      diagram: `<div class="mini-diagram"><span>🔐 Encrypted balances</span><span class="diagram-arrow">→</span><span>⚡ FHE.sub/add</span><span class="diagram-arrow">→</span><span>✅ Private transfer</span></div>`,
      code: `<span class="keyword">import</span> { FHE, euint64, ebool, externalEuint64 } <span class="keyword">from</span> "@fhevm/solidity/lib/FHE.sol";
<span class="keyword">import</span> { SepoliaConfig } <span class="keyword">from</span> "@fhevm/solidity/config/ZamaConfig.sol";

<span class="keyword">contract</span> ConfidentialERC20 <span class="keyword">is</span> SepoliaConfig {
    <span class="keyword">mapping</span>(<span class="keyword">address</span> => <span class="keyword">euint64</span>) <span class="keyword">private</span> balances;
    <span class="keyword">mapping</span>(<span class="keyword">address</span> => <span class="keyword">bool</span>) <span class="keyword">private</span> _balanceInit;
    <span class="keyword">mapping</span>(<span class="keyword">address</span> => <span class="keyword">ebool</span>) <span class="keyword">private</span> _lastOk; <span class="comment">// Track transfer success</span>
    <span class="keyword">euint64</span> <span class="keyword">private</span> totalSupply;
    
    <span class="keyword">constructor</span>() {
        totalSupply = FHE.<span class="function">asEuint64</span>(0);
        FHE.<span class="function">allowThis</span>(totalSupply);
    }
    
    <span class="keyword">function</span> <span class="function">initializeSupply</span>(
        <span class="keyword">externalEuint64</span> encryptedSupply,
        <span class="keyword">bytes calldata</span> inputProof
    ) <span class="keyword">external</span> {
        <span class="keyword">euint64</span> supply = FHE.<span class="function">fromExternal</span>(encryptedSupply, inputProof);
        totalSupply = supply;
        balances[msg.sender] = supply;
        _balanceInit[msg.sender] = <span class="keyword">true</span>; <span class="comment">// Mark sender initialized</span>
        FHE.<span class="function">allowThis</span>(totalSupply);
        FHE.<span class="function">allowThis</span>(balances[msg.sender]);
    }
    
    <span class="keyword">function</span> <span class="function">transfer</span>(
        <span class="keyword">address</span> to,
        <span class="keyword">externalEuint64</span> encryptedAmount,
        <span class="keyword">bytes calldata</span> inputProof
    ) <span class="keyword">external</span> <span class="keyword">returns</span> (<span class="keyword">bool</span>) {
        <span class="keyword">euint64</span> amount = FHE.<span class="function">fromExternal</span>(encryptedAmount, inputProof);
        <span class="comment">// Sender must have been initialized (e.g., via initializeSupply)</span>
        
        <span class="comment">// Initialize recipient balance if needed</span>
        <span class="keyword">if</span> (!_balanceInit[to]) {
            balances[to] = FHE.<span class="function">asEuint64</span>(0);
            _balanceInit[to] = <span class="keyword">true</span>;
        }
        
        <span class="comment">// Check sufficient balance with encrypted comparison (no on-chain decrypt)</span>
        <span class="keyword">ebool</span> canPay = FHE.<span class="function">le</span>(amount, balances[msg.sender]);
        <span class="keyword">euint64</span> senderMinus = FHE.<span class="function">sub</span>(balances[msg.sender], amount);
        <span class="keyword">euint64</span> toPlus = FHE.<span class="function">add</span>(balances[to], amount);
        
        <span class="comment">// Conditional update: if canPay, use new values; else keep original</span>
        balances[msg.sender] = FHE.<span class="function">select</span>(canPay, senderMinus, balances[msg.sender]);
        balances[to] = FHE.<span class="function">select</span>(canPay, toPlus, balances[to]);
        
        <span class="comment">// Store encrypted success flag for sender to check</span>
        _lastOk[msg.sender] = canPay;
        
        <span class="comment">// Grant permissions for balances and result</span>
        FHE.<span class="function">allowThis</span>(balances[msg.sender]);
        FHE.<span class="function">allowThis</span>(balances[to]);
        FHE.<span class="function">allowThis</span>(_lastOk[msg.sender]);
        
        <span class="keyword">return</span> <span class="keyword">true</span>;
    }
    
    <span class="keyword">function</span> <span class="function">balanceOf</span>(<span class="keyword">address</span> account) <span class="keyword">external</span> <span class="keyword">view</span> <span class="keyword">returns</span> (<span class="keyword">euint64</span>) {
        <span class="comment">// Returns encrypted balance - only account can decrypt</span>
        <span class="keyword">return</span> balances[account];
    }
    
    <span class="keyword">function</span> <span class="function">allowMyBalance</span>() <span class="keyword">external</span> {
        <span class="comment">// Grant caller permission to decrypt their own balance</span>
        FHE.<span class="function">allow</span>(balances[msg.sender], msg.sender);
    }
    
    <span class="keyword">function</span> <span class="function">allowMyLastResult</span>() <span class="keyword">external</span> {
        <span class="comment">// Grant caller permission to decrypt their last transfer result</span>
        FHE.<span class="function">allow</span>(_lastOk[msg.sender], msg.sender);
    }
}`,
      notes: `Key FHE operations for tokens:
• FHE.le(a, b) - encrypted "less than or equal"
• FHE.sub(a, b) - encrypted subtraction
• FHE.add(a, b) - encrypted addition
• FHE.select(condition, valueIfTrue, valueIfFalse) - conditional assignment

<br/>
<strong>Transfer result tracking:</strong> Contract stores encrypted success flag <code>_lastOk[sender]</code>.  
UI can decrypt this to show "Transfer Successful" or "Insufficient Balance" without revealing amounts.

<div class="common-misconceptions">
<h4>Security considerations:</h4>
• Do NOT pass initial supply as plaintext constructor args<br>
• Initialize encrypted balances before FHE operations<br>
• Avoid FHE.decrypt on-chain; use FHE.select for conditional logic<br>
• Events are generic; transfer success/failure determined by encrypted flag<br>
• euint64 + decimals=18 may overflow; production should use larger types<br>
• Transfer metadata (from, to, timestamp) still public
</div>`,
      questions: [
        {
          q: "How does the contract handle insufficient balance?",
          options: [
            "It decrypts and throws an error",
            "It uses FHE.select() to conditionally update or keep original balances",
            "It asks the user to prove their balance",
            "It checks a public balance mapping"
          ],
          correct: 1
        },
        {
          q: "What information remains public in FHE token transfers?",
          options: [
            "Transfer amounts and balances",
            "Only the sender and recipient addresses, timestamp",
            "Everything is completely private",
            "Only the contract address"
          ],
          correct: 1
        },
        {
          q: "Why use FHE.allow() in allowMyBalance()?",
          options: [
            "To make the balance public",
            "To grant caller permission to decrypt their own balance",
            "To increase the balance amount",
            "To transfer tokens automatically"
          ],
          correct: 1
        }
      ]
    },
    {
      type: "demo",
      title: "Try Confidential Transfer!",
      content: "Transfer 100 tokens privately. The recipient gets the tokens, but observers can't see the amount. UI will decrypt _lastOk to show transfer success/failure without revealing amounts. Only sender/recipient can decrypt their balances through proper access control.",
      demoNote: "off-chain KMS decryption per ACL; the contract never sees plaintext",
      demoQuestion: "How many tokens are you transferring?",
      demo: {
        type: "transfer",
        inputs: ["transferAmount"],
        action: "Transfer Tokens",
        expectedAmount: 100
      },
      questions: [
        {
          q: "After the transfer, what can the public see?",
          options: [
            "The exact amount transferred (100 tokens)",
            "Only that a transfer occurred between two addresses",
            "Both sender and recipient balances",
            "Nothing, the transaction is invisible"
          ],
          correct: 1
        }
      ]
    },
    {
      type: "quiz",
      title: "Review: Confidential Tokens",
      content: "Test your knowledge of FHE token mechanics.",
      questions: [
        {
          q: "What's the main advantage of FHE tokens over regular ERC20?",
          options: [
            "They're faster and cheaper",
            "They keep balances and transfer amounts private",
            "They don't need smart contracts",
            "They can't be hacked"
          ],
          correct: 1
        },
        {
          q: "Which operations are used for balance updates?",
          options: [
            "FHE.encrypt and FHE.decrypt",
            "FHE.sub for sender, FHE.add for recipient",
            "FHE.mul and FHE.div",
            "FHE.eq and FHE.select"
          ],
          correct: 1
        }
      ]
    }
  ],
  get contractAddress() {
    return getContractAddress('ConfidentialERC20');
  },
  get contractInfo() {
    return getContractInfo('ConfidentialERC20');
  }
};
