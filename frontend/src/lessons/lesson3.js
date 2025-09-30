import { getContractAddress, getContractInfo } from '../config/contracts.js';

export const lesson3 = {
  title: "Private Voting",
  subtitle: "Conditional Logic with Secrets",
  steps: [
    {
      type: "explanation", 
      title: "The Problem with Public Voting",
      content: "On regular blockchains, everyone can see how you vote. Bribery/coercion happens because everyone sees vote choices. With FHE, choices remain encrypted, while tallies are computed homomorphically. Access is controlled via ACL; only permitted parties can decrypt final results. Note: metadata (sender, time, gas, ciphertext) is still visible on-chain.",
      question: "What's wrong with public voting?",
      options: [
        "It's too slow",
        "It costs too much gas", 
        "People can see your vote and pressure you",
        "It's too complicated"
      ],
      correct: 2
    },
    {
      type: "code-explanation",
      title: "Encrypted Conditional Logic", 
      content: "We decide which tally to increment using encrypted predicates. FHE.eq() checks equality on ciphertexts; FHE.select() picks between two encrypted branches – no decryption.",
      diagram: `<div class=\"mini-diagram\"><span>🔐 Encrypt</span><span class=\"diagram-arrow\">→</span><span>⚖️ FHE.eq/select</span><span class=\"diagram-arrow\">→</span><span>📊 Update tally</span></div>`,
      code: `<span class="comment">// Initialize tallies in constructor</span>
<span class="keyword">constructor</span>() {
    tallies[0] = FHE.<span class="function">asEuint64</span>(0); <span class="comment">// Yes votes</span>
    tallies[1] = FHE.<span class="function">asEuint64</span>(0); <span class="comment">// No votes</span>
    FHE.<span class="function">allowThis</span>(tallies[0]); FHE.<span class="function">allowThis</span>(tallies[1]);
}

<span class="keyword">function</span> <span class="function">vote</span>(<span class="keyword">externalEuint32</span> encryptedChoice, <span class="keyword">bytes calldata</span> inputProof) <span class="keyword">external</span> {
    <span class="keyword">euint32</span> choice = FHE.<span class="function">fromExternal</span>(encryptedChoice, inputProof);
    
    <span class="comment">// Check if vote is "Yes" (0) or "No" (1) - without decrypting!</span>
    <span class="keyword">ebool</span> isYes = FHE.<span class="function">eq</span>(choice, FHE.<span class="function">asEuint32</span>(0));
    <span class="keyword">ebool</span> isNo = FHE.<span class="function">eq</span>(choice, FHE.<span class="function">asEuint32</span>(1));
    
    <span class="comment">// incYes = isYes ? 1 : 0</span>
    <span class="keyword">euint64</span> incYes = FHE.<span class="function">select</span>(isYes, one, zero);
    <span class="comment">// incNo = isNo ? 1 : 0</span>
    <span class="keyword">euint64</span> incNo = FHE.<span class="function">select</span>(isNo, one, zero);
    
    tallies[0] = FHE.<span class="function">add</span>(tallies[0], incYes);
    tallies[1] = FHE.<span class="function">add</span>(tallies[1], incNo);
    <span class="comment">// Note: values other than 0/1 won't increment either tally (safe)</span>
}

<span class="comment">// Grant reveal permission to specific address</span>
<span class="keyword">function</span> <span class="function">grantReveal</span>(<span class="keyword">address</span> user) <span class="keyword">external</span> {
    FHE.<span class="function">allow</span>(tallies[0], user);
    FHE.<span class="function">allow</span>(tallies[1], user);
}`,
      notes: `In production, use oracle/KMS on-chain decryption for final results. This example uses markRevealed() as a placeholder to demonstrate the flow only.

<div class="common-misconceptions">
<h4>Security notes:</h4>
• Values other than 0/1 won't be counted (logic-safe)<br>
• Metadata (sender, gas, timestamps) still public<br>
• Only vote choices stay encrypted
</div>`,
      questions: [
        {
          q: "How does the contract know which tally to increment?",
          options: [
            "It decrypts the vote first",
            "It uses FHE.eq() and FHE.select() to choose without decrypting",
            "It asks the user to specify",
            "It increments both tallies"
          ],
          correct: 1
        },
        {
          q: "What happens if someone votes with value 2?",
          options: [
            "It crashes the contract",
            "It counts as Yes vote",
            "It won't increment either tally (safe)",
            "It counts as No vote"
          ],
          correct: 2
        },
        {
          q: "Which pair is used to choose a branch without decrypting?",
          options: [
            "FHE.add & FHE.sub",
            "FHE.eq & FHE.select",
            "FHE.allow & FHE.allowThis",
            "FHE.asEuint32 & FHE.asEuint64"
          ],
          correct: 1
        }
      ]
    },
    {
      type: "demo",
      title: "Cast Your Vote!",
      content: "Vote 'Yes' on this question. UI shows results after off-chain KMS decrypt per ACL (permissions), but the contract never sees your plaintext choice.",
      demoNote: "UI displays results after KMS decryption per ACL; contract never sees plaintext",
      demoQuestion: "Should blockchain applications prioritize privacy?",
      demo: {
        type: "vote",
        inputs: ["choice"],
        action: "Cast Vote",
        expectedChoice: "0"
      },
    },
    {
      type: "quiz",
      title: "Review: Private Voting",
      content: "Answer based on the voting demo.",
      questions: [
        {
          q: "After voting 'Yes', what is publicly visible on-chain?",
          options: [
            "Your vote choice (Yes) is visible to everyone",
            "Only that you participated, not your actual choice",
            "Nothing, the transaction is completely hidden",
            "Your choice and the current vote tallies"
          ],
          correct: 1
        },
        {
          q: "What makes FHE voting more secure than regular voting?",
          options: ["It's faster", "Individual votes stay encrypted while tallies are computed", "It costs less gas", "It doesn't need smart contracts"],
          correct: 1
        }
      ]
    },
  ],
  get contractAddress() {
    return getContractAddress('PrivateVote');
  },
  get contractInfo() {
    return getContractInfo('PrivateVote');
  }
};
