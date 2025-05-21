import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';

const CheckCircleIcon = getIcon('check-circle');
const XCircleIcon = getIcon('x-circle');
const ArrowLeftIcon = getIcon('arrow-left');
const StarIcon = getIcon('star');
const RefreshCwIcon = getIcon('refresh-cw');
const InfoIcon = getIcon('info');

const BubblePop = ({ onBack }) => {
  const [gameActive, setGameActive] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [stars, setStars] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentRule, setCurrentRule] = useState('odd'); // 'odd' or 'even'
  const [bubblesPopped, setBubblesPopped] = useState(0);
  const [requiredPops, setRequiredPops] = useState(5);

  // Initialize game
  const startGame = () => {
    setGameActive(true);
    setShowInstructions(false);
    setScore(0);
    setLevel(1);
    setLives(3);
    setGameOver(false);
    setBubblesPopped(0);
    setRequiredPops(5);
    setCurrentRule(Math.random() > 0.5 ? 'odd' : 'even');
    generateBubbles();
    toast.success(`Game started! Pop the ${currentRule.toUpperCase()} numbers!`);
  };

  // Generate random bubbles based on current level
  const generateBubbles = useCallback(() => {
    // Clear existing bubbles
    setBubbles([]);
    
    // Generate new bubbles
    const newBubbles = [];
    const numBubbles = Math.min(8 + level, 15); // More bubbles as level increases, max 15
    
    for (let i = 0; i < numBubbles; i++) {
      // Generate a random number between 1 and 100 (inclusive) regardless of level
      const num = Math.floor(Math.random() * 100) + 1;
      
      newBubbles.push({
        id: Date.now() + i,
        number: num,
        isOdd: num % 2 !== 0,
        x: Math.random() * 100, // Full screen width (0-100%)
        y: 110 + Math.random() * 10, // Start below the visible area
        size: Math.random() * 20 + 50, // Size between 50-70px
        speed: 2 + Math.random() * (level * 0.5) // Speed increases with level
      });
    }
    
    setBubbles(prev => [...prev, ...newBubbles]);
  }, [level]);

  // Continuously generate new bubbles
  useEffect(() => {
    if (gameActive && bubbles.length < 15) {
      const timer = setTimeout(() => {
        if (gameActive && !gameOver) {
          const newBubble = {
            id: Date.now(),
            number: Math.floor(Math.random() * 100) + 1,
            isOdd: false, // Will be set properly below
            x: Math.random() * 100, // Full screen width (0-100%)
            y: 110 + Math.random() * 20,
            size: Math.random() * 20 + 50,
            speed: 2 + Math.random() * (level * 0.5)
          };
          newBubble.isOdd = newBubble.number % 2 !== 0;
          
          setBubbles(prev => [...prev, newBubble]);
        }
      }, 800 + Math.random() * 800); // Random delay between 0.8-1.6 seconds
      
      return () => clearTimeout(timer);
    }
  }, [bubbles.length, gameActive, gameOver, level]);

  // Handle bubble tap/click
  const handleBubbleTap = (bubble) => {
    if (!gameActive || gameOver) return;
    
    const isCorrect = 
      (currentRule === 'odd' && bubble.isOdd) || 
      (currentRule === 'even' && !bubble.isOdd);
    
    // Remove the bubble
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    
    // Handle scoring and feedback
    if (isCorrect) {
      setScore(prev => prev + 10);
      setBubblesPopped(prev => prev + 1);
      
      toast.success(`Correct! ${bubble.number} is ${bubble.isOdd ? 'odd' : 'even'}!`, {
        icon: <CheckCircleIcon className="text-green-500 w-5 h-5" />,
        autoClose: 1000
      });
    } else {
      setLives(prev => prev - 1);
      
      toast.error(`Oops! ${bubble.number} is ${bubble.isOdd ? 'odd' : 'even'}!`, {
        icon: <XCircleIcon className="text-red-500 w-5 h-5" />,
        autoClose: 1000
      });
    }
  };

  // Check for level progression
  useEffect(() => {
    if (bubblesPopped >= requiredPops && gameActive) {
      // Level up
      setLevel(prev => prev + 1);
      setBubblesPopped(0);
      setRequiredPops(prev => Math.min(prev + 2, 15)); // More pops required as level increases, max 15
      
      // Switch rule
      setCurrentRule(prev => prev === 'odd' ? 'even' : 'odd');
      
      toast.info(`Level ${level + 1}! Now pop ${currentRule === 'odd' ? 'EVEN' : 'ODD'} numbers!`, {
        autoClose: 1500
      });
    }
  }, [bubblesPopped, requiredPops, gameActive, level, currentRule]);

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
        
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 flex items-center justify-center mr-3">
          <span className="text-xl">🎮</span>
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold">
          Bubble Pop - Odd and Even Numbers
        </h2>
      </div>
      
      {/* Instructions Modal */}
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
                <span className="bg-blue-100 dark:bg-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 dark:text-blue-200 mr-3">1</span>
                <p>Bubbles with numbers will float upward on the screen</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 dark:bg-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 dark:text-blue-200 mr-3">2</span>
                <p>Tap/click ONLY on bubbles that match the rule (odd or even numbers)</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 dark:bg-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 dark:text-blue-200 mr-3">3</span>
                <p>Get points for correct answers and try to reach the highest level!</p>
              </div>
              <div className="flex items-start">
                <InfoIcon className="text-blue-500 w-6 h-6 mr-3 mt-1" />
                <p><strong>Remember:</strong> Odd numbers cannot be divided equally by 2 (like 1, 3, 5, 7, 9...) while even numbers can (like 2, 4, 6, 8, 10...)</p>
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
        <div className="card p-6 mb-6 relative overflow-hidden min-h-[500px]">
          {/* Game stats */}
          <div className="flex justify-between items-center mb-4 relative z-10">
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="bg-primary-light/20 dark:bg-primary-dark/30 px-3 py-1 rounded-full mb-2 md:mb-0">
                Level: {level}
              </div>
              <div className="bg-secondary-light/20 dark:bg-secondary-dark/30 px-3 py-1 rounded-full">
                Score: {score}
              </div>
            </div>
            <div className="flex flex-col items-end"> 
              <div className="flex items-center gap-1">
                {[...Array(lives)].map((_, i) => (
                  <div key={i} className="w-6 h-6 text-red-500">❤️</div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Centered game title */}
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${(bubblesPopped / requiredPops) * 100}%` }}>
            </div>
          </div>
          
          {/* Bubble play area */}
          <div className="relative h-[400px] bg-gradient-to-b from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg overflow-hidden">
            {/* Centered game title */}
            <div className="absolute top-3 left-0 right-0 z-10 text-center">
              <div className="game-title text-2xl md:text-3xl font-extrabold">
                POP {currentRule.toUpperCase()} NUMBERS!
              </div>
            </div>
            <AnimatePresence>
              {bubbles.map(bubble => (
                <motion.div
                  key={bubble.id}
                  initial={{ x: `${bubble.x}%`, y: `${bubble.y}%`, opacity: 0.7 }}
                  animate={{ y: [null, '-120%'], x: [`${bubble.x}%`, `${bubble.x - 5 + Math.random() * 10}%`], opacity: [0.7, 1, 0.7] }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ y: { duration: 8 / bubble.speed, ease: "linear" }, opacity: { duration: 8 / bubble.speed, times: [0, 0.5, 1], ease: "linear" } }}
                  onClick={() => handleBubbleTap(bubble)}
                  className="bubble absolute cursor-pointer"
                  style={{ width: `${bubble.size}px`, height: `${bubble.size}px` }}
                >
                  <span className="text-xl font-bold">{bubble.number}</span>
                </motion.div>
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