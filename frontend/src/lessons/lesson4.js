import { getContractAddress, getContractInfo } from '../config/contracts.js';

export const lesson4 = {
  title: "Secret Number Guessing",
  subtitle: "Encrypted Comparisons & Game Logic",
  steps: [
    {
      type: "explanation",
      title: "Why Encrypted Guessing Games?",
      content: "Traditional guessing games reveal all attempts on-chain, making them predictable. With FHE, your guesses stay secret while the contract can still evaluate 'too high', 'too low', or 'correct' without seeing actual numbers. This enables fair games where strategies remain private.",
      question: "What advantage does FHE bring to guessing games?",
      options: [
        "Makes games faster and cheaper",
        "Keeps your guesses private while still allowing game logic",
        "Eliminates the need for random numbers",
        "Automatically generates winning strategies"
      ],
      correct: 1
    },
    {
      type: "code-explanation",
      title: "FHE Comparison Operations",
      content: "FHE provides comparison operators that work on encrypted values. FHE.lt() (less than), FHE.gt() (greater than), and FHE.eq() (equals) return encrypted booleans (ebool) without revealing the actual values being compared.",
      diagram: `<div class="mini-diagram"><span>🔐 Encrypt guess</span><span class="diagram-arrow">→</span><span>⚖️ FHE.lt/gt/eq</span><span class="diagram-arrow">→</span><span>🎯 Game response</span></div>`,
      code: `<span class="keyword">contract</span> SecretNumberGame <span class="keyword">is</span> SepoliaConfig {
    <span class="keyword">euint32</span> <span class="keyword">private</span> secretNumber;
    <span class="keyword">mapping</span>(<span class="keyword">address</span> => <span class="keyword">euint32</span>) <span class="keyword">public</span> attempts;
    <span class="keyword">mapping</span>(<span class="keyword">address</span> => <span class="keyword">bool</span>) <span class="keyword">private</span> _attemptInit;
    <span class="keyword">mapping</span>(<span class="keyword">address</span> => <span class="keyword">euint32</span>) <span class="keyword">public</span> lastHint; <span class="comment">// 0=low, 1=high, 2=correct</span>
    
    <span class="keyword">constructor</span>() {}
    
    <span class="keyword">function</span> <span class="function">setSecret</span>(
        <span class="keyword">externalEuint32</span> encSecret,
        <span class="keyword">bytes calldata</span> proof
    ) <span class="keyword">external</span> {
        secretNumber = FHE.<span class="function">fromExternal</span>(encSecret, proof);
        FHE.<span class="function">allowThis</span>(secretNumber);
    }
    
    <span class="keyword">function</span> <span class="function">makeGuess</span>(
        <span class="keyword">externalEuint32</span> encryptedGuess,
        <span class="keyword">bytes calldata</span> inputProof
    ) <span class="keyword">external</span> {
        <span class="keyword">euint32</span> guess = FHE.<span class="function">fromExternal</span>(encryptedGuess, inputProof);

        <span class="keyword">if</span> (!_attemptInit[msg.sender]) {
            attempts[msg.sender] = FHE.<span class="function">asEuint32</span>(0);
            _attemptInit[msg.sender] = <span class="keyword">true</span>;
            FHE.<span class="function">allowThis</span>(attempts[msg.sender]);
        }
        attempts[msg.sender] = FHE.<span class="function">add</span>(attempts[msg.sender], FHE.<span class="function">asEuint32</span>(1));
        FHE.<span class="function">allowThis</span>(attempts[msg.sender]);
        
        <span class="comment">// Encrypted comparisons</span>
        <span class="keyword">ebool</span> isEqual = FHE.<span class="function">eq</span>(guess, secretNumber);
        <span class="keyword">ebool</span> isLower = FHE.<span class="function">lt</span>(guess, secretNumber);
        
        <span class="comment">// Build encrypted hint: 0=too low, 1=too high, 2=correct</span>
        <span class="keyword">euint32</span> zero = FHE.<span class="function">asEuint32</span>(0);
        <span class="keyword">euint32</span> one  = FHE.<span class="function">asEuint32</span>(1);
        <span class="keyword">euint32</span> two  = FHE.<span class="function">asEuint32</span>(2);
        <span class="keyword">euint32</span> lowOrHigh = FHE.<span class="function">select</span>(isLower, zero, one);
        <span class="keyword">euint32</span> hint = FHE.<span class="function">select</span>(isEqual, two, lowOrHigh);
        
        lastHint[msg.sender] = hint; <span class="comment">// stored encrypted</span>
        FHE.<span class="function">allowThis</span>(lastHint[msg.sender]);
    }
    
    <span class="keyword">function</span> <span class="function">allowMyHint</span>() <span class="keyword">external</span> {
        FHE.<span class="function">allow</span>(lastHint[msg.sender], msg.sender);
    }
}`,
      notes: `FHE comparison operations:
• FHE.lt(a, b) - encrypted "less than"
• FHE.gt(a, b) - encrypted "greater than"  
• FHE.eq(a, b) - encrypted "equals"
• All return ebool (encrypted boolean)

<br/>
<strong>Hint encoding (encrypted):</strong> 0 = too low, 1 = too high, 2 = correct.  
Contract stores <code>lastHint[user]</code> as ciphertext and never decrypts on-chain.  
Use <code>allowMyHint()</code> to grant KMS permission per ACL so the client can decrypt off-chain.

<div class="common-misconceptions">
<h4>Security notes:</h4>
• Do NOT pass secrets as plaintext constructor args; they appear in deployment tx input<br>
• Initialize encrypted mappings before FHE.add operations<br>
• Do not decrypt on-chain; use off-chain KMS decrypt per ACL<br>
• Metadata (sender, gas, timestamp, ciphertext) is still visible on-chain
</div>`,
      questions: [
        {
          q: "What does FHE.lt(guess, secretNumber) return?",
          options: [
            "True or false in plaintext",
            "An encrypted boolean (ebool)",
            "The actual values being compared",
            "A random number"
          ],
          correct: 1
        },
        {
          q: "Why use encrypted comparisons instead of regular ones?",
          options: [
            "They're faster than regular comparisons",
            "They keep both the guess and secret number private",
            "They use less gas",
            "They're required by Ethereum"
          ],
          correct: 1
        },
        {
          q: "What's the risk of using FHE.decrypt() in production?",
          options: [
            "It's too slow",
            "It reveals encrypted data and should be access-controlled",
            "It costs too much gas",
            "It doesn't work with ebool"
          ],
          correct: 1
        }
      ]
    },
    {
      type: "demo",
      title: "Play the Guessing Game!",
      content: "The secret number is between 1-100. Try to guess it! Your guess stays encrypted, but you'll get hints. The contract never sees your actual guess in plaintext.",
      demoNote: "off-chain KMS decryption per ACL (permissions); the contract never sees plaintext",
      demoQuestion: "What number are you guessing?",
      demo: {
        type: "guess",
        inputs: ["guessValue"],
        action: "Make Guess",
        secretNumber: 42
      },
      questions: [
        {
          q: "After making a guess, what can observers see on-chain?",
          options: [
            "Your exact guess number",
            "Only encrypted data and encrypted hint (decrypted off-chain)",
            "Both your guess and the secret number",
            "Nothing, everything is hidden"
          ],
          correct: 1
        }
      ]
    },
    {
      type: "quiz",
      title: "Review: Encrypted Comparisons",
      content: "Test your understanding of FHE comparison operations.",
      questions: [
        {
          q: "Which FHE functions are used for comparisons?",
          options: [
            "FHE.add, FHE.sub, FHE.mul",
            "FHE.lt, FHE.gt, FHE.eq",
            "FHE.encrypt, FHE.decrypt",
            "FHE.allow, FHE.allowThis"
          ],
          correct: 1
        },
        {
          q: "What makes FHE guessing games fair?",
          options: [
            "Everyone can see all guesses",
            "Guesses remain private while game logic still works",
            "They're cheaper than regular games",
            "They don't need smart contracts"
          ],
          correct: 1
        }
      ]
    }
  ],
  get contractAddress() {
    return getContractAddress('SecretNumberGame');
  },
  get contractInfo() {
    return getContractInfo('SecretNumberGame');
  }
};
