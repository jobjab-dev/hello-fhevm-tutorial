import React, { useState } from 'react';

function DemoComponent({ demo, demoState, onRunDemo }) {
  const [inputs, setInputs] = useState({
    valueA: '10',
    valueB: '20', 
    incrementValue: '1',
    choice: '0'
  });

  const handleRun = () => {
    onRunDemo(demo.type, inputs);
  };

    return (
    <div className="demo-section">
      <h3>Interactive Demo</h3>
      <p className="demo-question">Should we implement privacy features in all blockchain applications?</p>
      
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

      <button onClick={handleRun} className="demo-button">
        {demo.action}
      </button>

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
    </div>
  );
}

export default function App() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});
  const [demoState, setDemoState] = useState({});

  const lessons = [
    {
      title: "FHE Addition",
      subtitle: "Your First Encrypted Calculation",
      steps: [
        {
          type: "explanation",
          title: "What is FHE?",
          content: "Fully Homomorphic Encryption (FHE) lets you calculate on encrypted data without decrypting it first. Think of it like a magic box - you put encrypted numbers in, it does math, and gives you an encrypted result!",
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
          content: "Here's how we add two encrypted numbers:",
          code: `function setA(externalEuint8 inputA, bytes calldata inputProof) external {
    _a = FHE.fromExternal(inputA, inputProof);  // Import encrypted value
    FHE.allowThis(_a);                         // Grant contract permission
}

function computeSum() external {
    _result = FHE.add(_a, _b);  // Magic happens here!
    FHE.allowThis(_result);     // Allow contract to use result
}`,
          question: "What does FHE.add() do?",
          options: [
            "Decrypts both numbers, adds them, then encrypts result",
            "Adds the encrypted numbers without ever decrypting them",
            "Converts numbers to plaintext for addition",
            "Sends numbers to a server for calculation"
          ],
          correct: 1
        },
        {
          type: "demo",
          title: "Try FHE Addition!",
          content: "See homomorphic addition in action - no wallet needed!",
          demo: {
            type: "add",
            inputs: ["valueA", "valueB"],
            action: "Compute A + B"
          }
        },
        {
          type: "quiz",
          title: "Test Your Understanding",
          questions: [
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
      contractAddress: "0x477693d4D3d0B9F33Aba1733C08185eeC98adf45"
    },
    {
      title: "FHE Counter",
      subtitle: "Encrypted State Management", 
      steps: [
        {
          type: "explanation",
          title: "What's Different About Encrypted State?",
          content: "Regular smart contracts store data in plaintext - anyone can read the blockchain and see your balance, votes, etc. With FHE, the data stays encrypted even on the blockchain!",
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
          content: "Compare these two approaches:",
          code: `// Regular Counter (everyone can see the value)
uint32 private _count;
function increment() external {
    _count += 1;  // Value visible on blockchain
}

// FHE Counter (value stays secret)
euint32 private _count;  
function increment(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 encryptedValue = FHE.fromExternal(inputValue, inputProof);
    _count = FHE.add(_count, encryptedValue);  // Encrypted math!
}`,
          question: "What's the key difference?",
          options: [
            "FHE version is faster",
            "FHE version keeps the count value secret",
            "Regular version uses less gas",
            "They work exactly the same"
          ],
          correct: 1
        },
        {
          type: "demo",
          title: "Counter Demo",
          content: "Try the encrypted counter - watch the encrypted value change!",
          demo: {
            type: "counter",
            inputs: ["incrementValue"],
            action: "Increment Counter"
          }
        },
        {
          type: "explanation",
          title: "Lesson Complete",
          content: "Great! You've learned how encrypted state management works with FHE. The counter value stays private on the blockchain."
        }
      ],
      contractAddress: "0x64F21cfF69922335A5108fFB67b2B2A4185D3064"
    },
    {
      title: "Private Voting",
      subtitle: "Conditional Logic with Secrets",
      steps: [
        {
          type: "explanation", 
          title: "The Problem with Public Voting",
          content: "On regular blockchains, everyone can see how you vote. This breaks democracy! People can be bribed, threatened, or influenced by seeing others' votes.",
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
          content: "Here's how we count votes without seeing individual choices:",
          code: `function vote(externalEuint32 encryptedChoice, bytes calldata inputProof) external {
    euint32 choice = FHE.fromExternal(encryptedChoice, inputProof);
    
    // Check if vote is "Yes" (0) or "No" (1) - without decrypting!
    ebool isYes = FHE.eq(choice, FHE.asEuint32(0));
    
    // Add 1 to correct tally - conditionally
    euint64 incYes = FHE.select(isYes, one, zero);
    tallies[0] = FHE.add(tallies[0], incYes);
}`,
          question: "How does the contract know which tally to increment?",
          options: [
            "It decrypts the vote first",
            "It uses FHE.eq() and FHE.select() to choose without decrypting",
            "It asks the user to specify",
            "It increments both tallies"
          ],
          correct: 1
        },
        {
          type: "demo",
          title: "Voting Demo", 
          content: "Cast your private vote and see how tallies work!",
          demo: {
            type: "vote",
            inputs: ["choice"],
            action: "Cast Vote"
          }
        },
        {
          type: "explanation",
          title: "Lesson Complete",
          content: "Excellent! You've mastered conditional logic with encrypted data. Individual votes stay secret while tallies are computed homomorphically."
        }
      ],
      contractAddress: "0x502E464B600780288FD5F1220944cE7e2dA0df4C"
    }
  ];

  const currentLessonData = lessons[currentLesson];
  const currentStepData = currentLessonData.steps[currentStep];

  const handleAnswer = (questionIndex, selectedOption) => {
    const key = `${currentLesson}-${currentStep}-${questionIndex}`;
    setAnswers(prev => ({ ...prev, [key]: selectedOption }));
  };

  const checkQuiz = () => {
    const step = currentStepData;
    if (step.type === 'quiz') {
      const results = step.questions.map((q, index) => {
        const key = `${currentLesson}-${currentStep}-${index}`;
        return answers[key] === q.correct;
      });
      setQuizResults(prev => ({ ...prev, [`${currentLesson}-${currentStep}`]: results }));
    } else if (step.question) {
      const key = `${currentLesson}-${currentStep}-0`;
      const isCorrect = answers[key] === step.correct;
      setQuizResults(prev => ({ ...prev, [`${currentLesson}-${currentStep}`]: [isCorrect] }));
    }
  };

  const nextStep = () => {
    // Auto-check answers when moving to next step
    checkQuiz();
    
    if (currentStep < currentLessonData.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
      setCurrentStep(lessons[currentLesson - 1].steps.length - 1);
    }
  };

  const isLastStep = () => {
    return currentLesson === lessons.length - 1 && currentStep === currentLessonData.steps.length - 1;
  };

  const isLessonComplete = () => {
    return currentStep === currentLessonData.steps.length - 1;
  };

  const calculateLessonScore = (lessonIndex) => {
    let totalQuestions = 0;
    let correctAnswers = 0;
    
    lessons[lessonIndex].steps.forEach((step, stepIndex) => {
      if (step.type === 'quiz') {
        step.questions.forEach((q, qIndex) => {
          totalQuestions++;
          const key = `${lessonIndex}-${stepIndex}-${qIndex}`;
          if (answers[key] === q.correct) correctAnswers++;
        });
      } else if (step.question) {
        totalQuestions++;
        const key = `${lessonIndex}-${stepIndex}-0`;
        if (answers[key] === step.correct) correctAnswers++;
      }
    });
    
    return { correct: correctAnswers, total: totalQuestions, percentage: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0 };
  };

  const calculateScore = () => {
    let totalQuestions = 0;
    let correctAnswers = 0;
    
    lessons.forEach((lesson, lessonIndex) => {
      lesson.steps.forEach((step, stepIndex) => {
        if (step.type === 'quiz') {
          step.questions.forEach((q, qIndex) => {
            totalQuestions++;
            const key = `${lessonIndex}-${stepIndex}-${qIndex}`;
            if (answers[key] === q.correct) correctAnswers++;
          });
        } else if (step.question) {
          totalQuestions++;
          const key = `${lessonIndex}-${stepIndex}-0`;
          if (answers[key] === step.correct) correctAnswers++;
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
        {isLastStep() ? (
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
                      href={`https://sepolia.etherscan.io/address/${lesson.contractAddress}`}
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

            <div className="lesson-contract">
              <h3>Your Contract</h3>
              <div className="contract-link">
                <span className="contract-name">{currentLessonData.title}</span>
                <a 
                  href={`https://sepolia.etherscan.io/address/${currentLessonData.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="etherscan-link"
                >
                  View on Etherscan
                </a>
              </div>
            </div>

            <div className="lesson-actions">
              <button onClick={prevStep} className="back-button">
                ← Back to Lesson
              </button>
              {currentLesson < lessons.length - 1 ? (
                <button onClick={nextStep} className="next-lesson-button">
                  Next Lesson →
                </button>
              ) : (
                <button onClick={nextStep} className="final-results-button">
                  View Final Results
                </button>
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
                      <code>{currentStepData.code}</code>
                    </pre>
                  </div>
                )}
              </div>

              <div className="interaction-section">
                {currentStepData.type === 'demo' ? (
                  <DemoComponent 
                    demo={currentStepData.demo}
                    demoState={demoState[`demo-${currentLesson}-${currentStep}`]}
                    onRunDemo={runDemo}
                  />
                ) : currentStepData.type === 'quiz' ? (
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
        <p>Built for <strong>Zama Bounty Program Season 10</strong></p>
        <p>Interactive FHEVM Learning Experience</p>
      </footer>
    </div>
  );
}

