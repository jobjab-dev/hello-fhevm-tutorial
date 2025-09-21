export const lesson1 = {
  title: "FHE Addition",
  subtitle: "Your First Encrypted Calculation",
  steps: [
    {
      type: "explanation",
      title: "What is FHE?",
      content: "Fully Homomorphic Encryption (FHE) lets smart contracts compute on encrypted data without ever seeing the plaintext. You encrypt inputs locally, the contract receives only ciphertexts, runs FHE ops, and you (or allowed parties) and the network’s KMS (permitted by your ACL) returns the plaintext to the client. No app backend needs to be trusted. decrypt the result off-chain. This brings privacy to public blockchains without trusting a server.",
      question: "Why is this useful for blockchain?",
      options: [
        "To make transactions faster",
        "To keep sensitive data private while still computing on it", 
        "To reduce gas costs",
        "To make smart contracts simpler"
      ],
      correct: 1
    },
    {
      type: "code-explanation", 
      title: "The FHE.add() Function",
      content: "We load an encrypted input with FHE.fromExternal(input, proof) and record permissions with FHE.allowThis(value). In computeSum, FHE.add(_a, _b) adds ciphertexts directly - no decryption happens on-chain. The contract never learns the real numbers; it only manipulates encrypted values. Note: euint8/euint32 arithmetic is modular (wrap-around).",
      diagram: `<div class="mini-diagram"><span>🔐 Encrypt</span><span class="diagram-arrow">→</span><span>⚡ FHE.add</span><span class="diagram-arrow">→</span><span>🔓 KMS Decrypt</span></div>`,
      code: `<span class="keyword">function</span> <span class="function">setA</span>(<span class="keyword">externalEuint8</span> inputA, <span class="keyword">bytes calldata</span> inputProof) <span class="keyword">external</span> {
    _a = FHE.<span class="function">fromExternal</span>(inputA, inputProof);  <span class="comment">// Import encrypted value</span>
    FHE.<span class="function">allowThis</span>(_a);  <span class="comment">// Grant contract permission</span>
}

<span class="keyword">function</span> <span class="function">computeSum</span>() <span class="keyword">external</span> {
    <span class="comment">// euint8 math wraps modulo 2^8 (256). For larger ranges use euint16/euint32.</span>
    _result = FHE.<span class="function">add</span>(_a, _b);  <span class="comment">// Homomorphic addition on ciphertexts</span>
    FHE.<span class="function">allowThis</span>(_result);     <span class="comment">// Allow contract to use result</span>
}`,
      questions: [
        {
          q: "What does FHE.add() do?",
          options: [
            "Decrypts both numbers, adds them, then encrypts result",
            "Adds the encrypted numbers without ever decrypting them",
            "Converts numbers to plaintext for addition",
            "Sends numbers to a server for calculation"
          ],
          correct: 1
        },
        {
          q: "What happens to euint8 if you add 200 + 100?",
          options: [
            "Result is 300",
            "Result wraps to 44 (modulo 256)",
            "Transaction fails",
            "Contract asks for larger type"
          ],
          correct: 1
        },
        {
          q: "What is FHE.allowThis() for?",
          options: [
            "To decrypt the value",
            "To grant the contract permission to use the encrypted value",
            "To make the value public",
            "To delete the encrypted data"
          ],
          correct: 1
        }
      ]
    },
    {
      type: "demo",
      title: "Try FHE Addition!",
      content: "Enter 15 and 25, then click Compute A + B. You'll see: enc(15) and enc(25) as inputs, FHE.add(enc(15), enc(25)) -> enc(40), and a UI preview showing 40 after decryption on the client. The contract itself never sees 15, 25, or 40 in plaintext.",
      demoQuestion: "What is 15 + 25?",
      demo: {
        type: "add",
        inputs: ["valueA", "valueB"],
        action: "Compute A + B",
        expectedA: 15,
        expectedB: 25
      },
    },
    {
      type: "quiz",
      title: "Review: FHE Addition Concepts",
      content: "Answer the questions based on what you learned.",
      questions: [
        {
          q: "After running the demo, what did you observe?",
          options: [
            "The contract sees 15, 25, and 40 in plaintext",
            "The contract only sees encrypted values but computes enc(40)",
            "The calculation fails because numbers are encrypted",
            "The result is random because of encryption"
          ],
          correct: 1
        },
        {
          q: "Can the smart contract see the actual values of _a and _b?",
          options: ["Yes, it needs to decrypt them", "No, they stay encrypted", "Only during computation", "Only the owner can see"],
          correct: 1
        },
        {
          q: "What is FHE.allowThis() for?",
          options: ["To decrypt the value", "To grant the contract permission to use the encrypted value", "To make the value public", "To delete the encrypted data"],
          correct: 1  
        }
      ]
    }
  ],
  contractAddress: "0x6170A47265D93B816b63381585243dDD02D11D6c"
};
