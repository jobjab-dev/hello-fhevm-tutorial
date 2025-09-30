import React, { useState } from 'react';
import { ethers } from 'ethers';

async function sha256Hex(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(hash));
  return '0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

function buildDemoQuestion(step) {
  if (!step || !step.demoQuestion || !step.demo) return null;
  const demo = step.demo;
  if (demo.type === 'add') {
    const sum = (demo.expectedA ?? 0) + (demo.expectedB ?? 0);
    return {
      options: [
        String(sum),
        String(sum + 1),
        String(sum - 1),
        String(demo.expectedA ?? 0)
      ],
      correctIndex: 0
    };
  }
  if (demo.type === 'counter') {
    const v = demo.expectedValue ?? 1;
    return {
      options: [String(v), String(v + 1), String(Math.max(0, v - 1)), '0'],
      correctIndex: 0
    };
  }
  if (demo.type === 'vote') {
    const correctIndex = (demo.expectedChoice ?? '0') === '0' ? 0 : 1;
    return {
      options: ['Yes', 'No', 'Unsure', 'Prefer not to say'],
      correctIndex
    };
  }
  if (demo.type === 'guess') {
    const secret = demo.secretNumber ?? 42;
    return {
      options: [String(secret), String(secret + 10), String(secret - 10), String(secret + 5)],
      correctIndex: 0
    };
  }
  if (demo.type === 'transfer') {
    const amount = demo.expectedAmount ?? 100;
    return {
      options: [String(amount), String(amount * 2), String(amount / 2), String(amount + 50)],
      correctIndex: 0
    };
  }
  if (demo.type === 'optimize') {
    return {
      options: ['Batched operations', 'Individual operations', 'Both are the same', 'Neither approach works'],
      correctIndex: 0
    };
  }
  return null;
}
import { lesson1 } from './lessons/lesson1.js';
import { lesson2 } from './lessons/lesson2.js';
import { lesson3 } from './lessons/lesson3.js';
import { lesson4 } from './lessons/lesson4.js';
import { lesson5 } from './lessons/lesson5.js';
import { lesson6 } from './lessons/lesson6.js';

function DemoComponent({ demo, demoState, onRunDemo, fetchCiphertext }) {
  const [inputs, setInputs] = useState({
    valueA: '15',
    valueB: '25', 
    incrementValue: '1',
    choice: '0',
    guessValue: '42',
    transferAmount: '100',
    approach: 'batched'
  });
  const [ctLoading, setCtLoading] = useState(false);
  const [ciphertext, setCiphertext] = useState(null);
  const [ctError, setCtError] = useState(null);

  const handleRun = () => {
    onRunDemo(demo.type, inputs);
  };

    return (
    <div className="demo-section">
      <h3>Interactive Demo</h3>
      {demo.demoQuestion && (
        <p className="demo-question">{demo.demoQuestion}</p>
      )}
      
      {demo.type === 'add' && (
        <div className="demo-inputs">
          <div className="input-group">
            <label>Value A:</label>
            <input 
              type="number" 
              value={inputs.valueA}
              onChange={(e) => setInputs(prev => ({ ...prev, valueA: e.target.value }))}
            />
          </div>
          <div className="input-group">
            <label>Value B:</label>
            <input 
              type="number" 
              value={inputs.valueB}
              onChange={(e) => setInputs(prev => ({ ...prev, valueB: e.target.value }))}
            />
          </div>
        </div>
      )}

      {demo.type === 'counter' && (
        <div className="demo-inputs">
          <div className="input-group">
            <label>Increment by:</label>
            <input 
              type="number" 
              value={inputs.incrementValue}
              onChange={(e) => setInputs(prev => ({ ...prev, incrementValue: e.target.value }))}
            />
          </div>
          {demoState && (
            <div className="current-state">
              Current Count: <code>{demoState.encrypted}</code> (encrypted)
            </div>
          )}
        </div>
      )}

      {demo.type === 'vote' && (
        <div className="demo-inputs">
          <div className="vote-choices">
            <label className="vote-choice">
              <input 
                type="radio" 
                name="demoVote" 
                value="0"
                checked={inputs.choice === '0'}
                onChange={(e) => setInputs(prev => ({ ...prev, choice: e.target.value }))}
              />
              <span>Yes</span>
            </label>
            <label className="vote-choice">
              <input 
                type="radio" 
                name="demoVote" 
                value="1"
                checked={inputs.choice === '1'}
                onChange={(e) => setInputs(prev => ({ ...prev, choice: e.target.value }))}
              />
              <span>No</span>
            </label>
          </div>
          {demoState && (
            <div className="vote-tallies">
              <div>Yes: {demoState.tallies.yes} votes</div>
              <div>No: {demoState.tallies.no} votes</div>
            </div>
          )}
        </div>
      )}

      {demo.type === 'guess' && (
        <div className="demo-inputs">
          <div className="input-group">
            <label>Your Guess (1-100):</label>
            <input
              type="number"
              min="1"
              max="100"
              value={inputs.guessValue}
              onChange={(e) => setInputs(prev => ({ ...prev, guessValue: e.target.value }))}
              placeholder="Enter your guess"
            />
          </div>
          {demoState && (
            <div className="guess-result">
              <strong>Result:</strong> {demoState.result}
            </div>
          )}
        </div>
      )}

      {demo.type === 'transfer' && (
        <div className="demo-inputs">
          <div className="input-group">
            <label>Transfer Amount:</label>
            <input
              type="number"
              min="1"
              value={inputs.transferAmount}
              onChange={(e) => setInputs(prev => ({ ...prev, transferAmount: e.target.value }))}
              placeholder="Amount to transfer"
            />
          </div>
          {demoState && (
            <div className="transfer-result">
              <div>Transfer Status: {demoState.status}</div>
              <div>Gas Used: {demoState.gasUsed}</div>
            </div>
          )}
        </div>
      )}

      {demo.type === 'optimize' && (
        <div className="demo-inputs">
          <div className="input-group">
            <label>Choose Approach:</label>
            <select
              value={inputs.approach}
              onChange={(e) => setInputs(prev => ({ ...prev, approach: e.target.value }))}
            >
              <option value="batched">Batched Operations</option>
              <option value="individual">Individual Operations</option>
            </select>
          </div>
          {demoState && (
            <div className="optimization-result">
              <div><strong>Approach:</strong> {demoState.approach}</div>
              <div><strong>Gas Used:</strong> {demoState.gasUsed}</div>
              <div><strong>Savings:</strong> {demoState.savings}</div>
            </div>
          )}
        </div>
      )}

      <div className="demo-buttons">
        <button onClick={handleRun} className="demo-button">
          {demo.action}
        </button>
        {fetchCiphertext && (
          <button
            onClick={async () => {
              setCtError(null);
              setCiphertext(null);
              setCtLoading(true);
              try {
                const raw = await fetchCiphertext();
                if (!raw || raw === '0x' || (typeof raw === 'string' && raw.toLowerCase() === '0x')) {
                  setCtError('No stored ciphertext yet. This example saves a ciphertext only after an on-chain compute. Use Connect Wallet mode to run the contract, or switch to the Counter lesson to read an initialized ciphertext.');
                } else {
                  setCiphertext(raw);
                }
              } catch (e) {
                setCtError(e.message || 'Failed to fetch ciphertext');
              } finally {
                setCtLoading(false);
              }
            }}
            className="secondary-button"
          >
            View raw ciphertext
          </button>
        )}
      </div>

      {demoState && demoState.steps && (
        <div className="demo-steps">
          <h4>What Happened:</h4>
          {demoState.steps.map((step, index) => (
            <div key={index} className="demo-step">
              {step}
            </div>
          ))}
        </div>
      )}

      {fetchCiphertext && (
        <div className="ciphertext-box">
          <h4>Ciphertext</h4>
          {ctLoading && <div className="ciphertext-loading">Loading...</div>}
          {!ctLoading && ctError && <div className="ciphertext-error">{ctError}</div>}
          {!ctLoading && ciphertext && (
            <>
              <pre className="code-block" style={{ maxHeight: '140px', overflow: 'auto' }}>
                <code>{ciphertext}</code>
              </pre>
              {demo.demoNote && <div className="ciphertext-hint">{demo.demoNote}</div>}
            </>
          )}
          {!ctLoading && !ctError && !ciphertext && (
            <div className="ciphertext-hint">Run the demo and click "View raw ciphertext" to read on-chain ciphertext.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});
  const [demoState, setDemoState] = useState({});
  const [lessonFinished, setLessonFinished] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  const resetLesson = (lessonIndex) => {
    // Clear answers for this lesson only
    setAnswers(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (key.startsWith(`${lessonIndex}-`)) delete next[key];
      });
      return next;
    });
    // Clear quizResults for this lesson only
    setQuizResults(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (key.startsWith(`${lessonIndex}-`)) delete next[key];
      });
      return next;
    });
    // Clear demo state for this lesson only
    setDemoState(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (key.startsWith(`demo-${lessonIndex}-`)) delete next[key];
      });
      return next;
    });
    setCurrentStep(0);
    setLessonFinished(false);
  };

  const lessons = [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6];
  
  // Debug: Count questions in each lesson
  lessons.forEach((lesson, index) => {
    let totalQuestions = 0;
    lesson.steps.forEach((step, stepIndex) => {
      if (step.questions && Array.isArray(step.questions)) {
        totalQuestions += step.questions.length;
      } else if (step.question) {
        totalQuestions++;
      } else if (step.demoQuestion) {
        totalQuestions++;
      }
    });
    console.log(`Lesson ${index + 1}: ${totalQuestions} questions`);
  });

  const currentLessonData = lessons[currentLesson];
  const currentStepData = currentLessonData.steps[currentStep];

  const handleAnswer = (questionIndex, selectedOption) => {
    const key = `${currentLesson}-${currentStep}-${questionIndex}`;
    setAnswers(prev => ({ ...prev, [key]: selectedOption }));
  };

  const checkQuiz = () => {
    const step = currentStepData;
    if (step.questions && Array.isArray(step.questions)) {
      const results = step.questions.map((q, index) => {
        const key = `${currentLesson}-${currentStep}-${index}`;
        return answers[key] === q.correct;
      });
      setQuizResults(prev => ({ ...prev, [`${currentLesson}-${currentStep}`]: results }));
    } else if (step.question) {
      const key = `${currentLesson}-${currentStep}-0`;
      const isCorrect = answers[key] === step.correct;
      setQuizResults(prev => ({ ...prev, [`${currentLesson}-${currentStep}`]: [isCorrect] }));
    } else if (step.demoQuestion) {
      const key = `${currentLesson}-${currentStep}-demo-0`;
      const built = buildDemoQuestion(step);
      const isCorrect = answers[key] === (built?.correctIndex ?? 0);
      setQuizResults(prev => ({ ...prev, [`${currentLesson}-${currentStep}`]: [isCorrect] }));
    }
  };

  const nextStep = () => {
    // Auto-check answers
    checkQuiz();

    const lastIndex = currentLessonData.steps.length - 1;
    if (currentStep < lastIndex) {
      setCurrentStep(currentStep + 1);
    } else {
      // On last step: first click completes the lesson, second click moves forward
      if (!lessonFinished) {
        setLessonFinished(true);
      } else if (currentLesson < lessons.length - 1) {
        const score = calculateLessonScore(currentLesson);
        if (score.correct !== score.total) {
          // Require perfect score to advance
          return;
        }
        setCurrentLesson(currentLesson + 1);
        setCurrentStep(0);
        setLessonFinished(false);
        setShowFinal(false);
      } else {
        // Last lesson: move to final tutorial screen
        setShowFinal(true);
      }
    }
  };

  const prevStep = () => {
    if (lessonFinished && !showFinal) {
      setLessonFinished(false);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
      setCurrentStep(lessons[currentLesson - 1].steps.length - 1);
      setLessonFinished(false);
      setShowFinal(false);
    }
  };

  const isLastStep = () => {
    return currentLesson === lessons.length - 1 && currentStep === currentLessonData.steps.length - 1;
  };

  const isLessonComplete = () => lessonFinished;

  const calculateLessonScore = (lessonIndex) => {
    let totalQuestions = 0;
    let correctAnswers = 0;
    
    lessons[lessonIndex].steps.forEach((step, stepIndex) => {
      if (step.questions && Array.isArray(step.questions)) {
        step.questions.forEach((q, qIndex) => {
          totalQuestions++;
          const key = `${lessonIndex}-${stepIndex}-${qIndex}`;
          if (answers[key] === q.correct) correctAnswers++;
        });
      } else if (step.question) {
        totalQuestions++;
        const key = `${lessonIndex}-${stepIndex}-0`;
        if (answers[key] === step.correct) correctAnswers++;
      } else if (step.demoQuestion) {
        totalQuestions++;
        const key = `${lessonIndex}-${stepIndex}-demo-0`;
        const built = buildDemoQuestion(step);
        const correctIndex = built?.correctIndex ?? 0;
        if (answers[key] === correctIndex) correctAnswers++;
      }
    });
    
    return { correct: correctAnswers, total: totalQuestions, percentage: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0 };
  };

  const calculateScore = () => {
    let totalQuestions = 0;
    let correctAnswers = 0;
    
    lessons.forEach((lesson, lessonIndex) => {
      lesson.steps.forEach((step, stepIndex) => {
        if (step.questions && Array.isArray(step.questions)) {
          step.questions.forEach((q, qIndex) => {
            totalQuestions++;
            const key = `${lessonIndex}-${stepIndex}-${qIndex}`;
            if (answers[key] === q.correct) correctAnswers++;
          });
        } else if (step.question) {
          totalQuestions++;
          const key = `${lessonIndex}-${stepIndex}-0`;
          if (answers[key] === step.correct) correctAnswers++;
        } else if (step.demoQuestion) {
          totalQuestions++;
          const key = `${lessonIndex}-${stepIndex}-demo-0`;
          const built = buildDemoQuestion(lessons[lessonIndex].steps[stepIndex]);
          const correctIndex = built?.correctIndex ?? 0;
          if (answers[key] === correctIndex) correctAnswers++;
        }
      });
    });
    
    return { correct: correctAnswers, total: totalQuestions, percentage: Math.round((correctAnswers / totalQuestions) * 100) };
  };

  const deployContract = async () => {
    // Simulate deploy for demo
    alert(`Deploying ${currentLessonData.title} contract...\nAddress: ${currentLessonData.contractAddress}`);
  };

  const runDemo = (demoType, inputs) => {
    const key = `demo-${currentLesson}-${currentStep}`;
    
    if (demoType === 'add') {
      const a = parseInt(inputs.valueA) || 0;
      const b = parseInt(inputs.valueB) || 0;
      const result = a + b;
      setDemoState(prev => ({
        ...prev,
        [key]: {
          inputs: { a, b },
          encrypted: { a: `enc(${a})`, b: `enc(${b})` },
          result: `enc(${result})`,
          plainResult: result,
          steps: [
            `🔐 Encrypt A: ${a} → enc(${a})`,
            `🔐 Encrypt B: ${b} → enc(${b})`,
            `⚡ FHE.add(enc(${a}), enc(${b})) → enc(${result})`,
            `🔓 Decrypt result: enc(${result}) → ${result}`
          ]
        }
      }));
    } else if (demoType === 'counter') {
      const increment = parseInt(inputs.incrementValue) || 1;
      const currentCount = demoState[key]?.currentCount || 0;
      const newCount = currentCount + increment;
      setDemoState(prev => ({
        ...prev,
        [key]: {
          currentCount: newCount,
          encrypted: `enc(${newCount})`,
          steps: [
            `🔐 Encrypt increment: ${increment} → enc(${increment})`,
            `⚡ FHE.add(enc(${currentCount}), enc(${increment})) → enc(${newCount})`,
            `📊 Counter updated (still encrypted)`
          ]
        }
      }));
    } else if (demoType === 'vote') {
      const choice = inputs.choice;
      const choiceName = choice === '0' ? 'Yes' : 'No';
      const currentTallies = demoState[key]?.tallies || { yes: 0, no: 0 };
      const newTallies = { ...currentTallies };
      if (choice === '0') newTallies.yes++;
      else newTallies.no++;
      
      setDemoState(prev => ({
        ...prev,
        [key]: {
          tallies: newTallies,
          lastVote: choiceName,
          steps: [
            `🔐 Encrypt choice: "${choiceName}" → enc(${choice})`,
            `⚡ FHE.eq(enc(${choice}), enc(0)) → ${choice === '0' ? 'true' : 'false'}`,
            `⚡ FHE.select(${choice === '0' ? 'true' : 'false'}, 1, 0) → ${choice === '0' ? '1' : '0'}`,
            `📊 Tally updated: Yes=${newTallies.yes}, No=${newTallies.no}`
          ]
        }
      }));
    } else if (demoType === 'guess') {
      const guess = parseInt(inputs.guessValue) || 42;
      const secret = 42; // Fixed secret number for demo
      let result;
      if (guess === secret) {
        result = "🎉 Correct! You won!";
      } else if (guess < secret) {
        result = "📈 Too low, try higher";
      } else {
        result = "📉 Too high, try lower";
      }
      
      setDemoState(prev => ({
        ...prev,
        [key]: {
          guess,
          secret,
          result,
          steps: [
            `🔐 Encrypt guess: ${guess} → enc(${guess})`,
            `⚖️ FHE.eq(enc(${guess}), enc(${secret})) → ${guess === secret}`,
            `⚖️ FHE.lt(enc(${guess}), enc(${secret})) → ${guess < secret}`,
            `🎯 Game response: "${result}"`
          ]
        }
      }));
    } else if (demoType === 'transfer') {
      const amount = parseInt(inputs.transferAmount) || 100;
      const gasUsed = Math.floor(Math.random() * 50000) + 150000; // Simulated gas
      
      setDemoState(prev => ({
        ...prev,
        [key]: {
          amount,
          gasUsed: gasUsed.toLocaleString(),
          status: "Transfer Successful",
          steps: [
            `🔐 Encrypt amount: ${amount} → enc(${amount})`,
            `⚖️ FHE.lte(enc(${amount}), balance) → true`,
            `⚡ FHE.sub(senderBalance, enc(${amount}))`,
            `⚡ FHE.add(recipientBalance, enc(${amount}))`,
            `✅ Transfer completed privately`
          ]
        }
      }));
    } else if (demoType === 'optimize') {
      const approach = inputs.approach || 'batched';
      const batchedGas = 200000;
      const individualGas = 350000;
      const gasUsed = approach === 'batched' ? batchedGas : individualGas;
      const savings = approach === 'batched' ? 
        `${((individualGas - batchedGas) / individualGas * 100).toFixed(1)}% savings` : 
        'No savings';
      
      setDemoState(prev => ({
        ...prev,
        [key]: {
          approach: approach === 'batched' ? 'Batched Operations' : 'Individual Operations',
          gasUsed: gasUsed.toLocaleString(),
          savings,
          steps: approach === 'batched' ? [
            `📦 Import both values in single call`,
            `⚡ Batch FHE.add operations`,
            `🔧 Single permission grant`,
            `💰 Gas saved: ~43% reduction`
          ] : [
            `🔄 Import value 1, grant permission`,
            `🔄 Import value 2, grant permission`,
            `⚡ Individual FHE operations`,
            `💸 Higher gas cost due to separate calls`
          ]
        }
      }));
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <h1>Hello FHEVM</h1>
        <p>Learn Confidential Smart Contracts Step by Step</p>
        <div className="progress">
          Lesson {currentLesson + 1} of {lessons.length} • Step {currentStep + 1} of {currentLessonData.steps.length}
        </div>
      </header>

      <nav className="lesson-nav">
        {lessons.map((lesson, index) => (
          <button
            key={index}
            className={`lesson-button ${currentLesson === index ? 'active' : ''}`}
            onClick={() => { setCurrentLesson(index); setCurrentStep(0); }}
          >
            <div className="lesson-title">{lesson.title}</div>
            <div className="lesson-subtitle">{lesson.subtitle}</div>
          </button>
        ))}
      </nav>

      <main className="learning-area">
        {showFinal ? (
          <div className="completion-screen">
            <div className="completion-header">
              <h2>🎉 Tutorial Complete!</h2>
              <p>You've mastered the basics of FHEVM!</p>
            </div>
            
            <div className="score-section">
              <h3>Your Score</h3>
              {(() => {
                const score = calculateScore();
                return (
                  <div className="score-display">
                    <div className="score-number">{score.percentage}%</div>
                    <div className="score-text">{score.correct} out of {score.total} correct</div>
                    <div className={`score-grade ${score.percentage >= 80 ? 'excellent' : score.percentage >= 60 ? 'good' : 'needs-practice'}`}>
                      {score.percentage >= 80 ? 'Excellent! 🏆' : score.percentage >= 60 ? 'Good Job! 👍' : 'Keep Practicing! 📚'}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="contracts-section">
              <h3>Deployed Contracts</h3>
              <p>All contracts are verified on Sepolia Etherscan:</p>
              <div className="contract-links">
                {lessons.map((lesson, index) => (
                  <div key={index} className="contract-link">
                    <span className="contract-name">{lesson.title}</span>
                    <a 
                      href={`https://sepolia.etherscan.io/address/${lesson.contractAddress}#code`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="etherscan-link"
                    >
                      View on Etherscan
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="next-steps-final">
              <h3>What's Next?</h3>
              <ul>
                <li>Clone this repository and deploy your own contracts</li>
                <li>Modify the examples to add new features</li>
                <li>Build your own confidential dApp</li>
                <li>Join the Zama community for support</li>
              </ul>
            </div>

            <div className="links-section">
              <div className="links-container">
                <div className="zama-links">
                  <h4>🔗 Zama Resources</h4>
                  <div className="link-list">
                    <a href="https://guild.xyz/zama/bounty-program" target="_blank" rel="noopener noreferrer">
                      Developer Program on Guild
                    </a>
                    <a href="https://www.zama.ai/community" target="_blank" rel="noopener noreferrer">
                      Zama Community
                    </a>
                    <a href="https://discord.com/invite/zama" target="_blank" rel="noopener noreferrer">
                      Discord Server
                    </a>
                    <a href="https://twitter.com/zama_fhe" target="_blank" rel="noopener noreferrer">
                      Twitter/X
                    </a>
                  </div>
                </div>

                <div className="author-links">
                  <h4>👨‍💻 Tutorial Author</h4>
                  <div className="link-list">
                    <a href="https://x.com/jobjab_eth" target="_blank" rel="noopener noreferrer">
                      Follow on X
                    </a>
                    <a href="https://private-vote-fhevm-app.vercel.app/" target="_blank" rel="noopener noreferrer">
                      Production dApp Demo
                    </a>
                    <a href="https://github.com/jobjab-dev/hello-fhevm-tutorial" target="_blank" rel="noopener noreferrer">
                      GitHub Repository
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : isLessonComplete() ? (
          <div className="lesson-completion">
            <div className="lesson-complete-header">
              <h2>✅ Lesson {currentLesson + 1} Complete!</h2>
              <p>{currentLessonData.title} - {currentLessonData.subtitle}</p>
            </div>
            
            <div className="lesson-score">
              {(() => {
                const score = calculateLessonScore(currentLesson);
                return (
                  <div className="score-display">
                    <div className="score-number">{score.percentage}%</div>
                    <div className="score-text">{score.correct} out of {score.total} correct</div>
                  </div>
                );
              })()}
            </div>

            <div className="lesson-review">
              <h3>Review Your Answers</h3>
              <div style={{fontSize: '0.8rem', color: '#666', marginBottom: '16px'}}>
                Debug: Found {Object.keys(answers).filter(key => key.startsWith(`${currentLesson}-`)).length} answers for this lesson
              </div>
              {currentLessonData.steps.map((step, stepIndex) => {
                const results = [];
                
                if (step.questions && Array.isArray(step.questions)) {
                  step.questions.forEach((q, qIndex) => {
                    const key = `${currentLesson}-${stepIndex}-${qIndex}`;
                    const userAnswer = answers[key];
                    const isCorrect = userAnswer === q.correct;
                    results.push(
                      <div key={`${stepIndex}-${qIndex}`} className="answer-review">
                        <div className="question-text">{q.q}</div>
                        <div className={`answer-result ${isCorrect ? 'correct' : 'wrong'}`}>
                          <div className="user-answer">
                            Your answer: {q.options[userAnswer]} {isCorrect ? '✅' : '❌'}
                          </div>
                          {!isCorrect && (
                            <div className="correct-answer">
                              Correct answer: {q.options[q.correct]}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                } else if (step.question) {
                  const key = `${currentLesson}-${stepIndex}-0`;
                  const userAnswer = answers[key];
                  const isCorrect = userAnswer === step.correct;
                  results.push(
                    <div key={stepIndex} className="answer-review">
                      <div className="question-text">{step.question}</div>
                      <div className={`answer-result ${isCorrect ? 'correct' : 'wrong'}`}>
                        <div className="user-answer">
                          Your answer: {step.options[userAnswer]} {isCorrect ? '✅' : '❌'}
                        </div>
                        {!isCorrect && (
                          <div className="correct-answer">
                            Correct answer: {step.options[step.correct]}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else if (step.demoQuestion) {
                  const key = `${currentLesson}-${stepIndex}-demo-0`;
                  const userAnswer = answers[key];
                  const built = buildDemoQuestion(step);
                  const options = built?.options || [];
                  const correctIndex = built?.correctIndex ?? 0;
                  const isCorrect = userAnswer === correctIndex;
                  results.push(
                    <div key={`${stepIndex}-demo`} className="answer-review">
                      <div className="question-text">{step.demoQuestion}</div>
                      <div className={`answer-result ${isCorrect ? 'correct' : 'wrong'}`}>
                        <div className="user-answer">
                          Your answer: {options[userAnswer]} {isCorrect ? '✅' : '❌'}
                        </div>
                        {!isCorrect && (
                          <div className="correct-answer">
                            Correct answer: {options[correctIndex]}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                
                return results;
              }).flat()}
            </div>

            <div className="lesson-contract">
              <h3>Your Contract</h3>
              <div className="contract-link">
                <span className="contract-name">{currentLessonData.title}</span>
                <a 
                  href={`https://sepolia.etherscan.io/address/${currentLessonData.contractAddress}#code`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="etherscan-link"
                >
                  View on Etherscan
                </a>
              </div>
            </div>

            <div className="lesson-actions">
              <button onClick={() => { resetLesson(currentLesson); }} className="try-again-button">
                🔄 Try Again
              </button>
              {currentLesson < lessons.length - 1 ? (
                (() => {
                  const score = calculateLessonScore(currentLesson);
                  const canAdvance = score.correct === score.total && score.total > 0;
                  return canAdvance ? (
                    <button onClick={nextStep} className="next-lesson-button">
                      Next Lesson →
                    </button>
                  ) : null;
                })()
              ) : (
                (() => {
                  const score = calculateLessonScore(currentLesson);
                  const canFinish = score.correct === score.total && score.total > 0;
                  return canFinish ? (
                    <button onClick={nextStep} className="final-results-button">
                      View Final Results
                    </button>
                  ) : null;
                })()
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="step-header">
              <h2>{currentStepData.title}</h2>
              <div className="step-type">{currentStepData.type.replace('-', ' ')}</div>
            </div>

            <div className="step-content">
              <div className="content-section">
                <p className="step-explanation">{currentStepData.content}</p>
                
                {currentStepData.code && (
                  <div className="code-section">
                    <h3>Code Example</h3>
                <pre className="code-block">
                  <code dangerouslySetInnerHTML={{ __html: currentStepData.code }}></code>
                </pre>
                  </div>
                )}

                {currentStepData.notes && (
                  <div className="notes-section" dangerouslySetInnerHTML={{ __html: currentStepData.notes }}>
                  </div>
                )}

                {currentStepData.diagram && (
                  <div className="diagram-section" dangerouslySetInnerHTML={{ __html: currentStepData.diagram }}>
                  </div>
                )}
              </div>

              <div className="interaction-section">
                {currentStepData.type === 'demo' ? (
                  <>
                    <DemoComponent 
                      demo={currentStepData.demo}
                      demoState={demoState[`demo-${currentLesson}-${currentStep}`]}
                      onRunDemo={runDemo}
                      fetchCiphertext={async () => {
                        // Simulated ciphertext: no RPC, educational purpose only
                        const ds = demoState[`demo-${currentLesson}-${currentStep}`];
                        if (currentStepData.demo?.type === 'add') {
                          const a = ds?.inputs?.a ?? 0;
                          const b = ds?.inputs?.b ?? 0;
                          return await sha256Hex(`FHE.add|${a}|${b}`);
                        }
                        if (currentStepData.demo?.type === 'counter') {
                          const c = ds?.currentCount ?? 0;
                          return await sha256Hex(`Counter|${c}`);
                        }
                        if (currentStepData.demo?.type === 'vote') {
                          const last = ds?.lastVote ?? 'Yes';
                          const tally = ds?.tallies ? `${ds.tallies.yes}|${ds.tallies.no}` : '0|0';
                          return await sha256Hex(`Vote|${last}|${tally}`);
                        }
                        if (currentStepData.demo?.type === 'guess') {
                          const guess = ds?.guess ?? 42;
                          const secret = ds?.secret ?? 42;
                          return await sha256Hex(`Guess|${guess}|${secret}`);
                        }
                        if (currentStepData.demo?.type === 'transfer') {
                          const amount = ds?.amount ?? 100;
                          return await sha256Hex(`Transfer|${amount}`);
                        }
                        if (currentStepData.demo?.type === 'optimize') {
                          const approach = ds?.approach ?? 'Batched Operations';
                          const gas = ds?.gasUsed ?? '200,000';
                          return await sha256Hex(`Optimize|${approach}|${gas}`);
                        }
                        return await sha256Hex('UnknownDemo');
                      }} 
                    />
                    {currentStepData.demoQuestion && (
                      <div className="question-section">
                        <h3>Quick Question</h3>
                        <h4>{currentStepData.demoQuestion}</h4>
                        {(() => {
                          const built = buildDemoQuestion(currentStepData);
                          const qIndex = 0;
                          const key = `${currentLesson}-${currentStep}-demo-${qIndex}`;
                          return (
                            <div className="options">
                              {(built?.options || []).map((option, index) => (
                                <label key={index} className="option">
                                  <input
                                    type="radio"
                                    name={`demoq-${currentLesson}-${currentStep}`}
                                    value={index}
                                    checked={answers[key] === index}
                                    onChange={() => handleAnswer(`demo-${qIndex}`, index)}
                                  />
                                  <span>{option}</span>
                                </label>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {currentStepData.questions && (
                      <div className="quiz-section">
                        <h3>Quiz Time!</h3>
                        {currentStepData.questions.map((q, qIndex) => (
                          <div key={qIndex} className="question">
                            <h4>{q.q}</h4>
                            {q.options.map((option, oIndex) => (
                              <label key={oIndex} className="option">
                                <input
                                  type="radio"
                                  name={`q${qIndex}-${currentLesson}-${currentStep}`}
                                  value={oIndex}
                                  checked={answers[`${currentLesson}-${currentStep}-${qIndex}`] === oIndex}
                                  onChange={() => handleAnswer(qIndex, oIndex)}
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (currentStepData.type === 'quiz' || (currentStepData.questions && Array.isArray(currentStepData.questions))) ? (
                  <div className="quiz-section">
                    <h3>Quiz Time!</h3>
                    {currentStepData.questions.map((q, qIndex) => (
                      <div key={qIndex} className="question">
                        <h4>{q.q}</h4>
                        {q.options.map((option, oIndex) => (
                          <label key={oIndex} className="option">
                        <input
                          type="radio"
                          name={`q${qIndex}-${currentLesson}-${currentStep}`}
                          value={oIndex}
                          checked={answers[`${currentLesson}-${currentStep}-${qIndex}`] === oIndex}
                          onChange={() => handleAnswer(qIndex, oIndex)}
                        />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : currentStepData.question ? (
                  <div className="question-section">
                    <h3>Quick Question</h3>
                    <h4>{currentStepData.question}</h4>
                    {currentStepData.options.map((option, index) => (
                      <label key={index} className="option">
                        <input
                          type="radio"
                          name={`question-${currentLesson}-${currentStep}`}
                          value={index}
                          checked={answers[`${currentLesson}-${currentStep}-0`] === index}
                          onChange={() => handleAnswer(0, index)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                ) : null}

                <div className="actions">
                  {(currentStep > 0 || currentLesson > 0) && (
                    <button onClick={prevStep} className="back-button">
                      ← Back
                    </button>
                  )}
                  <button onClick={nextStep} className="next-button">
                    {currentStep < currentLessonData.steps.length - 1 ? 'Next Step' : 'Complete Lesson'}
                  </button>
                </div>

              </div>
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <p>Built for <strong>Zama Community</strong></p>
        <p>Interactive FHEVM Learning Experience</p>
      </footer>
    </div>
  );
}

