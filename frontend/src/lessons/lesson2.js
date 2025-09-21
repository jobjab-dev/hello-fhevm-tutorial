export const lesson2 = {
  title: "FHE Counter",
  subtitle: "Encrypted State Management", 
  steps: [
    {
      type: "explanation",
      title: "What's Different About Encrypted State?",
      content: "On public chains, balances/counters are plaintext. With FHE, state stays encrypted; only authorized users can decrypt a view via KMS. Arithmetic is modular: euint32 wraps modulo 2^32 (wrap‑around).",
      question: "What can people see if you have 100 tokens in a regular ERC20?",
      options: [
        "Nothing, it's private",
        "Your exact balance: 100 tokens",
        "Only that you have some tokens",
        "Only the contract owner can see"
      ],
      correct: 1
    },
    {
      type: "code-explanation",
      title: "Encrypted Counter vs Regular Counter",
      content: "Compare these two approaches. In FHE, we import ciphertext inputs with FHE.fromExternal(), then do homomorphic math; no decryption on-chain. Note: euint32 arithmetic is modular (wrap-around).",
      diagram: `<div class="mini-diagram"><span>🔐 Encrypt</span><span class="diagram-arrow">→</span><span>⚡ FHE.add</span><span class="diagram-arrow">→</span><span>🔓 KMS Decrypt</span></div>`,
      code: `<span class="comment">// Regular Counter (everyone can see the value)</span>
<span class="keyword">uint32</span> <span class="keyword">private</span> _count;
<span class="keyword">function</span> <span class="function">increment</span>() <span class="keyword">external</span> {
    _count += 1;  <span class="comment">// Value visible on blockchain</span>
}

<span class="comment">// FHE Counter (value stays secret)</span>
<span class="keyword">euint32</span> <span class="keyword">private</span> _count;
<span class="keyword">constructor</span>() {
    _count = FHE.<span class="function">asEuint32</span>(0);
    FHE.<span class="function">allowThis</span>(_count); <span class="comment">// manage ACL; does NOT reveal plaintext</span>
}
<span class="keyword">function</span> <span class="function">increment</span>(
    <span class="keyword">externalEuint32</span> inputValue, 
    <span class="keyword">bytes calldata</span> inputProof
) <span class="keyword">external</span> {
    <span class="comment">// Import encrypted value with proof</span>
    <span class="keyword">euint32</span> encValue = FHE.<span class="function">fromExternal</span>(
        inputValue, 
        inputProof
    );
    <span class="comment">// Homomorphic addition - no decryption!</span>
    _count = FHE.<span class="function">add</span>(_count, encValue);
    <span class="comment">// Grant contract permission</span>
    FHE.<span class="function">allowThis</span>(_count);
}`,
      notes: `Initialize encrypted counters in constructor: _count = FHE.asEuint32(0); FHE.allowThis(_count);
      
FHE counters are typically more expensive and slower than regular ones.

<div class="common-misconceptions">
<h4>Common misconceptions:</h4>
• Not faster, not cheaper<br>
• Contract never sees plaintext<br>
• Metadata (sender, gas, timestamps) is still public
</div>`,
      questions: [
        {
          q: "What's the key difference?",
          options: [
            "FHE version is faster",
            "FHE version keeps the count value secret",
            "Regular version uses less gas",
            "They work exactly the same"
          ],
          correct: 1
        },
        {
          q: "Why initialize _count in constructor with FHE.asEuint32(0)?",
          options: [
            "To save gas costs",
            "To set initial encrypted state and grant contract permissions",
            "To make the counter faster",
            "To allow public reading"
          ],
          correct: 1
        },
        {
          q: "Which function imports user ciphertext + proof?",
          options: [
            "FHE.add",
            "FHE.fromExternal",
            "FHE.select",
            "FHE.allowThis"
          ],
          correct: 1
        }
      ]
    },
    {
      type: "demo",
      title: "Try the Counter!",
      content: "Increment the counter by 5 and watch the encrypted state update. UI previews plaintext after KMS decryption permitted by ACL. The chain only stores ciphertext.",
      demoNote: "This is the on-chain ciphertext; plaintext is never stored on-chain.",
      demoQuestion: "How much will the counter increase?",
      demo: {
        type: "counter",
        inputs: ["incrementValue"],
        action: "Increment Counter",
        expectedValue: 5
      },
    },
    {
      type: "quiz",
      title: "Review: Encrypted State",
      content: "Answer based on the counter demo.",
      questions: [
        {
          q: "After incrementing by 5, what can observers see on-chain?",
          options: [
            "The actual count value (5)",
            "Only an encrypted value that hides the count",
            "Nothing, the transaction failed",
            "The previous count + 5 in plaintext"
          ],
          correct: 1
        },
        {
          q: "Which function imports user ciphertext + proof?",
          options: ["FHE.add", "FHE.fromExternal", "FHE.select", "FHE.allowThis"],
          correct: 1
        }
      ]
    },
  ],
  contractAddress: "0xD568dBb5eDe5a835F7621CFADF3a1d1993b3311e"
};
