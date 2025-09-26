import { getContractAddress, getContractInfo } from '../config/contracts.js';

export const lesson6 = {
  title: "Advanced FHE Patterns",
  subtitle: "Production Best Practices",
  steps: [
    {
      type: "explanation",
      title: "Building Production FHE dApps",
      content: "Moving from tutorials to production requires understanding gas optimization, batch operations, proper access control patterns, and integration with oracles for decryption. This lesson covers advanced techniques used in real FHE applications.",
      question: "What's most important when building production FHE dApps?",
      options: [
        "Using the most complex encryption possible",
        "Optimizing gas costs and implementing proper access controls",
        "Making everything completely anonymous",
        "Avoiding all decryption operations"
      ],
      correct: 1
    },
    {
      type: "code-explanation",
      title: "Batch Operations & Gas Optimization",
      content: "FHE operations are expensive. Batching multiple operations, reusing encrypted values, and minimizing FHE.allowThis() calls can significantly reduce gas costs. Use struct packing and careful state management for efficiency.",
      diagram: `<div class="mini-diagram"><span>📦 Batch inputs</span><span class="diagram-arrow">→</span><span>⚡ Single FHE op</span><span class="diagram-arrow">→</span><span>💰 Lower gas</span></div>`,
      code: `<span class="keyword">import</span> { FHE, euint32, euint64, externalEuint32 } <span class="keyword">from</span> "@fhevm/solidity/lib/FHE.sol";
<span class="keyword">import</span> { SepoliaConfig } <span class="keyword">from</span> "@fhevm/solidity/config/ZamaConfig.sol";

<span class="keyword">contract</span> OptimizedFHE <span class="keyword">is</span> SepoliaConfig {
    <span class="keyword">struct</span> EncryptedData {
        <span class="keyword">euint32</span> value1;
        <span class="keyword">euint32</span> value2;
        <span class="keyword">euint64</span> sum;
        <span class="keyword">bool</span> initialized;
    }
    
    <span class="keyword">mapping</span>(<span class="keyword">address</span> => EncryptedData) <span class="keyword">private</span> userData;
    <span class="keyword">mapping</span>(<span class="keyword">address</span> => <span class="keyword">bool</span>) <span class="keyword">private</span> _userInit;
    
    <span class="keyword">constructor</span>() {}
    
    <span class="comment">// ❌ Inefficient: Multiple separate operations</span>
    <span class="keyword">function</span> <span class="function">inefficientUpdate</span>(
        <span class="keyword">externalEuint32</span> val1, <span class="keyword">bytes calldata</span> proof1,
        <span class="keyword">externalEuint32</span> val2, <span class="keyword">bytes calldata</span> proof2
    ) <span class="keyword">external</span> {
        <span class="comment">// Initialize user data if needed</span>
        <span class="keyword">if</span> (!_userInit[msg.sender]) {
            userData[msg.sender] = EncryptedData({
                value1: FHE.<span class="function">asEuint32</span>(0),
                value2: FHE.<span class="function">asEuint32</span>(0),
                sum: FHE.<span class="function">asEuint64</span>(0),
                initialized: <span class="keyword">false</span>
            });
            _userInit[msg.sender] = <span class="keyword">true</span>;
        }
        
        userData[msg.sender].value1 = FHE.<span class="function">fromExternal</span>(val1, proof1);
        FHE.<span class="function">allowThis</span>(userData[msg.sender].value1);
        
        userData[msg.sender].value2 = FHE.<span class="function">fromExternal</span>(val2, proof2);
        FHE.<span class="function">allowThis</span>(userData[msg.sender].value2);
        
        userData[msg.sender].sum = FHE.<span class="function">add</span>(
            userData[msg.sender].value1,
            userData[msg.sender].value2
        );
        FHE.<span class="function">allowThis</span>(userData[msg.sender].sum);
        
        userData[msg.sender].initialized = <span class="keyword">true</span>;
    }
    
    <span class="comment">// ✅ Efficient: Batch operations with reused values</span>
    <span class="keyword">function</span> <span class="function">efficientUpdate</span>(
        <span class="keyword">externalEuint32</span> val1, <span class="keyword">bytes calldata</span> proof1,
        <span class="keyword">externalEuint32</span> val2, <span class="keyword">bytes calldata</span> proof2
    ) <span class="keyword">external</span> {
        <span class="comment">// Initialize user data if needed (same as inefficient for fair comparison)</span>
        <span class="keyword">if</span> (!_userInit[msg.sender]) {
            userData[msg.sender] = EncryptedData({
                value1: FHE.<span class="function">asEuint32</span>(0),
                value2: FHE.<span class="function">asEuint32</span>(0),
                sum: FHE.<span class="function">asEuint64</span>(0),
                initialized: <span class="keyword">false</span>
            });
            _userInit[msg.sender] = <span class="keyword">true</span>;
        }
        
        <span class="comment">// Import both values</span>
        <span class="keyword">euint32</span> encVal1 = FHE.<span class="function">fromExternal</span>(val1, proof1);
        <span class="keyword">euint32</span> encVal2 = FHE.<span class="function">fromExternal</span>(val2, proof2);
        
        <span class="comment">// Compute sum once</span>
        <span class="keyword">euint64</span> newSum = FHE.<span class="function">add</span>(FHE.<span class="function">asEuint64</span>(encVal1), FHE.<span class="function">asEuint64</span>(encVal2));
        
        <span class="comment">// Batch permission grants</span>
        userData[msg.sender] = EncryptedData({
            value1: encVal1,
            value2: encVal2,
            sum: newSum,
            initialized: <span class="keyword">true</span>
        });
        
        <span class="comment">// Single permission call for struct</span>
        <span class="function">_grantPermissions</span>(msg.sender);
    }
    
    <span class="keyword">function</span> <span class="function">_grantPermissions</span>(<span class="keyword">address</span> user) <span class="keyword">private</span> {
        FHE.<span class="function">allowThis</span>(userData[user].value1);
        FHE.<span class="function">allowThis</span>(userData[user].value2);
        FHE.<span class="function">allowThis</span>(userData[user].sum);
    }
}`,
      notes: `Gas optimization techniques:
• Batch multiple FHE operations together
• Reuse encrypted values instead of re-importing
• Minimize FHE.allowThis() calls
• Use struct packing for related data
• Initialize encrypted mappings/structs before operations

<div class="common-misconceptions">
<h4>Production considerations:</h4>
• FHE ops cost 10-100x more gas than regular ops<br>
• Always initialize encrypted state before FHE operations<br>
• Plan your access control patterns carefully<br>
• Consider oracle integration for final decryption
</div>`,
      questions: [
        {
          q: "Why is batching FHE operations important?",
          options: [
            "It makes the code easier to read",
            "It significantly reduces gas costs",
            "It makes encryption stronger",
            "It's required by the FHEVM protocol"
          ],
          correct: 1
        },
        {
          q: "What's a key difference between FHE and regular operations?",
          options: [
            "FHE operations are always faster",
            "FHE operations cost much more gas",
            "FHE operations don't need permissions",
            "FHE operations can't be batched"
          ],
          correct: 1
        },
        {
          q: "When should you call FHE.allowThis()?",
          options: [
            "After every single FHE operation",
            "Strategically batch permission grants to minimize calls",
            "Never, it's not needed",
            "Only when decrypting values"
          ],
          correct: 1
        }
      ]
    },
    {
      type: "demo",
      title: "Optimize Your FHE Code!",
      content: "Compare gas usage between inefficient vs efficient FHE patterns. See how batching operations and smart permission management can save significant gas costs in production applications.",
      demoNote: "off-chain KMS decryption per ACL; the contract never sees plaintext",
      demoQuestion: "Which approach uses less gas?",
      demo: {
        type: "optimize",
        inputs: ["approach"],
        action: "Compare Gas Usage",
        efficientGas: "~200,000",
        inefficientGas: "~350,000"
      },
      questions: [
        {
          q: "What did the optimization demo show?",
          options: [
            "Both approaches use the same gas",
            "Batched operations use significantly less gas",
            "Individual operations are always better",
            "Gas costs don't matter in FHE"
          ],
          correct: 1
        }
      ]
    },
    {
      type: "quiz",
      title: "Review: Production FHE",
      content: "Test your understanding of production FHE development.",
      questions: [
        {
          q: "What's the most important consideration for production FHE dApps?",
          options: [
            "Using the latest FHE features",
            "Gas optimization and proper access control",
            "Making everything completely anonymous",
            "Avoiding all plaintext operations"
          ],
          correct: 1
        },
        {
          q: "How can you reduce FHE gas costs?",
          options: [
            "Use more encryption",
            "Batch operations and minimize permission calls",
            "Avoid using FHE entirely",
            "Deploy on different networks"
          ],
          correct: 1
        }
      ]
    }
  ],
  get contractAddress() {
    return getContractAddress('OptimizedFHE');
  },
  get contractInfo() {
    return getContractInfo('OptimizedFHE');
  }
};
