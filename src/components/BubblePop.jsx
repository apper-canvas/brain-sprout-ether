import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';

// Import icons
const ArrowLeftIcon = getIcon('arrow-left');
const StarIcon = getIcon('star');
const RefreshCwIcon = getIcon('refresh-cw');
const InfoIcon = getIcon('info');
const TimerIcon = getIcon('timer');

const BubblePop = ({ onBack }) => {
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [stars, setStars] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [popRule, setPopRule] = useState("odd"); // "odd" or "even"
  const gameAreaRef = useRef(null);
  const animationRef = useRef(null);
  
  // Start game
  const startGame = () => {
    setGameActive(true);
    setShowInstructions(false);
    setScore(0);
    setLevel(1);
    setLives(3);
    setGameOver(false);
    setPopRule(Math.random() < 0.5 ? "odd" : "even");
    generateBubbles();
    toast.success(`Game started! Pop the ${popRule.toUpperCase()} numbers!`);
  };
  
  // Generate bubbles based on level
  const generateBubbles = () => {
    const count = Math.min(5 + level, 12); // Increase bubbles with level, max 12
    const newBubbles = [];
    
    for (let i = 0; i < count; i++) {
      // Generate more complex numbers as level increases
      const maxNum = level <= 2 ? 20 : level <= 4 ? 50 : 100;
      const num = Math.floor(Math.random() * maxNum) + 1;
      
      newBubbles.push({
        id: Date.now() + i,
        number: num,
        isOdd: num % 2 !== 0,
        x: Math.random() * 80 + 10, // % across screen
        y: Math.random() * 80, // % from top
        size: Math.random() * 20 + 40, // Size between 40-60px
        popped: false,
        speed: 1 + (level * 0.5) // Speed increases with level
      });
    }
    
    setBubbles(newBubbles);
  };
  
  // Handle bubble click
  const handleBubblePop = (bubbleId) => {
    const bubble = bubbles.find(b => b.id === bubbleId);
    if (!bubble || bubble.popped) return;
    
    const isCorrectPop = 
      (popRule === "odd" && bubble.isOdd) || 
      (popRule === "even" && !bubble.isOdd);
    
    // Update bubble state
    setBubbles(prev => 
      prev.map(b => 
        b.id === bubbleId ? {...b, popped: true} : b
      )
    );
    
    // Handle scoring and feedback
    if (isCorrectPop) {
      setScore(prev => prev + 10);
      toast.success(`Correct! ${bubble.number} is ${bubble.isOdd ? 'odd' : 'even'}!`, {
        autoClose: 1000
      });
    } else {
      setLives(prev => prev - 1);
      toast.error(`Oops! ${bubble.number} is ${bubble.isOdd ? 'odd' : 'even'}, not ${popRule}!`, {
        autoClose: 1000
      });
    }
    
    // Check if all bubbles are popped
    const remainingBubbles = bubbles.filter(b => !b.popped && b.id !== bubbleId).length;
    if (remainingBubbles === 0) {
      setTimeout(() => {
        // Level up, possibly change the rule, and generate new bubbles
        setLevel(prev => prev + 1);
        setPopRule(Math.random() < 0.5 ? "odd" : "even");
        generateBubbles();
        toast.info(`Level ${level + 1}! Now pop ${popRule.toUpperCase()} numbers!`, {
          autoClose: 1500,
          icon: <InfoIcon className="text-blue-500 w-5 h-5" />
        });
      }, 1000);
    }
  };
  
  // Check for game over condition
  useEffect(() => {
    if (lives <= 0 && gameActive) {
      setGameOver(true);
      setGameActive(false);
      
      // Calculate stars based on score and level
      if (score >= 150) setStars(3);
      else if (score >= 100) setStars(2);
      else if (score >= 50) setStars(1);
      else setStars(0);
    }
  }, [lives, gameActive, score]);
  
  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="mr-3 p-2 rounded-full bg-surface-100 dark:bg-surface-700"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </motion.button>
        
        <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-800 text-pink-600 dark:text-pink-200 flex items-center justify-center mr-3">
          <span className="text-xl">🎮</span>
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold">
          Bubble Pop: Odd & Even Numbers
        </h2>
      </div>
      
      {/* Instructions */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="card max-w-2xl mx-auto text-center p-6 mb-6"
          >
            <h3 className="text-2xl font-bold mb-4">How to Play</h3>
            <div className="space-y-4 text-left mb-6">
              <div className="flex items-start">
                <span className="bg-pink-100 dark:bg-pink-800 rounded-full w-8 h-8 flex items-center justify-center text-pink-600 dark:text-pink-200 mr-3">1</span>
                <p>Each round will ask you to pop either ODD or EVEN number bubbles</p>
              </div>
              <div className="flex items-start">
                <span className="bg-pink-100 dark:bg-pink-800 rounded-full w-8 h-8 flex items-center justify-center text-pink-600 dark:text-pink-200 mr-3">2</span>
                <p>Click or tap only the bubbles that match the rule</p>
              </div>
              <div className="flex items-start">
                <span className="bg-pink-100 dark:bg-pink-800 rounded-full w-8 h-8 flex items-center justify-center text-pink-600 dark:text-pink-200 mr-3">3</span>
                <p>The game gets faster with each level!</p>
              </div>
              <div className="flex items-start">
                <InfoIcon className="text-blue-500 w-6 h-6 mr-3 mt-1" />
                <p><strong>Remember:</strong> Odd numbers cannot be divided equally by 2 (like 1, 3, 5, 7...) while even numbers can (like 2, 4, 6, 8...)</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="btn-primary px-8 py-3 text-lg"
            >
              Start Game
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Game Area */}
      {gameActive && (
        <div className="card p-6 mb-6 relative overflow-hidden" ref={gameAreaRef}>
          {/* Game stats */}
          <div className="flex justify-between items-center mb-4 relative z-10">
            <div className="flex space-x-4">
              <div className="bg-primary-light/20 dark:bg-primary-dark/30 px-3 py-1 rounded-full">
                Level: {level}
              </div>
              <div className="bg-secondary-light/20 dark:bg-secondary-dark/30 px-3 py-1 rounded-full">
                Score: {score}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(lives)].map((_, i) => (
                <div key={i} className="w-6 h-6 text-red-500">❤️</div>
              ))}
            </div>
          </div>
          
          {/* Current rule */}
          <div className="text-center mb-4 bg-pink-100 dark:bg-pink-800/40 p-3 rounded-lg font-bold text-xl">
            Pop the {popRule.toUpperCase()} numbers!
          </div>
          
          {/* Bubbles play area */}
          <div className="relative h-[400px] bg-gradient-to-b from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg overflow-hidden">
            <AnimatePresence>
              {bubbles.map(bubble => (
                !bubble.popped && (
                  <motion.div
                    key={bubble.id}
                    initial={{ 
                      x: `${bubble.x}%`, 
                      y: `${bubble.y}%`, 
                      scale: 0.5, 
                      opacity: 0.5 
                    }}
                    animate={{ 
                      y: ['0%', '100%'],
                      x: [`${bubble.x}%`, `${bubble.x + (Math.random() * 40 - 20)}%`],
                      scale: 1, 
                      opacity: 1,
                      transition: { 
                        y: { duration: 12 / bubble.speed, repeat: 0, ease: "linear" },
                        x: { duration: 8 / bubble.speed, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
                      }
                    }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    onClick={() => handleBubblePop(bubble.id)}
                    className="bubble absolute cursor-pointer select-none"
                    style={{ width: `${bubble.size}px`, height: `${bubble.size}px` }}
                  >
                    <span className="text-xl font-bold">{bubble.number}</span>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      
      {/* Game Over Screen */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="card max-w-2xl mx-auto text-center p-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Game Over!</h2>
            
            <div className="py-5">
              <div className="text-4xl font-bold mb-2">
                Final Score: {score}
              </div>
              <div className="text-xl mb-6">Level Reached: {level}</div>
              
              <div className="flex justify-center space-x-4 mb-8">
                {[...Array(3)].map((_, i) => (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1, 
                      rotate: i < stars ? [0, 15, -15, 0] : 0 
                    }}
                    transition={{ 
                      delay: 0.5 + (i * 0.2),
                      duration: 0.5,
                      type: "spring"
                    }}
                  >
                    <StarIcon 
                      className={`w-12 h-12 ${
                        i < stars 
                          ? "text-yellow-400 fill-yellow-400" 
                          : "text-surface-300 dark:text-surface-600"
                      }`} 
                    />
                  </motion.div>
                ))}
              </div>
              
              <div className="text-surface-600 dark:text-surface-300 mb-8">
                {stars === 3 ? (
                  "Amazing job! You're a math wizard!"
                ) : stars === 2 ? (
                  "Great work! You're getting good at identifying odd and even numbers!"
                ) : stars === 1 ? (
                  "Good effort! Keep practicing to get better!"
                ) : (
                  "Don't worry, with more practice you'll get better at odd and even numbers!"
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <RefreshCwIcon className="w-5 h-5" />
                  Play Again
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Back to Subjects
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BubblePop;