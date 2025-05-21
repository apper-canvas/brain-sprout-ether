import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import BubbleZone from './BubbleZone';

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
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes in seconds
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
    setTimeRemaining(120); // Reset timer to 2 minutes
    setRequiredPops(5);
    setCurrentRule(Math.random() > 0.5 ? 'odd' : 'even');
    generateBubbles();
    toast.success(`Game started! Pop the ${currentRule.toUpperCase()} numbers!`);
  };

  // Generate random bubbles based on current level
  const generateBubbles = useCallback(() => {
    // Clear existing bubbles
    setBubbles([]);
    
    // Create a starter set of bubbles (will be continued by the useEffect)
    const initialBubbles = Array.from({ length: Math.min(5, level + 2) }, () => {
      // Generate random number between 1 and 100
      const num = Math.floor(Math.random() * 100) + 1;
      // Generate random x position along the width (covering 80% of the screen with 10% margin on each side)
      const randomXPos = 5 + Math.random() * 90;
      
      return {
        id: Date.now() + Math.random(),
        number: num,
        isOdd: num % 2 !== 0,
        x: randomXPos, // Random position along the width
        y: 100, // Start at the bottom edge of the game screen
        size: Math.random() * 20 + 50, // Size between 50-70px
        speed: 2 + Math.random() * (level * 0.5),
      };
    });
    setBubbles(initialBubbles);
  }, [level]);

  // Continuously generate new bubbles
  useEffect(() => {
    if (gameActive && bubbles.length < Math.min(Math.max(10, level + 9), 15)) {
      const timer = setInterval(() => { 
        if (gameActive && !gameOver) {
          // Generate random number between 1 and 100
          const num = Math.floor(Math.random() * 100) + 1; 
          // Generate random x position along the bottom of the screen
          const randomXPos = 5 + Math.random() * 90;
          
          const newBubble = {
            id: Date.now(),
            number: num,
            isOdd: num % 2 !== 0,
            x: randomXPos, // Random position along the bottom
            y: 100, // Start at the bottom edge of the game screen
            size: Math.random() * 20 + 50, // Size between 50-70px
            speed: 2 + Math.random() * (level * 0.5),
          };
          setBubbles(prev => [...prev, newBubble]);
        }
      }, 500); // Generate a new bubble every 0.5 seconds
      
      return () => clearInterval(timer);
    }
  }, [bubbles.length, gameActive, gameOver, level]);

  // Timer countdown for 2 minutes of continuous play
  useEffect(() => {
    if (gameActive && !gameOver && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - end the game
            setGameOver(true);
            setGameActive(false);
            clearInterval(timer);
            toast.info("Time's up! Game over.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameActive, gameOver, timeRemaining]);

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
  
  // Format time as MM:SS
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Calculate time percentage for progress bar
  const timePercentage = (timeRemaining / 120) * 100;
  
  // Determine if time is running low (less than 30 seconds)
  const isTimeRunningLow = timeRemaining <= 30;

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
              <div className={`timer-display px-3 py-1 rounded-full mb-2 ${
                isTimeRunningLow ? 'bg-red-500/80 text-white animate-pulse' : 'bg-blue-500/20'
              }`}>
                <span className="font-mono">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(lives)].map((_, i) => (
                  <div key={i} className="w-6 h-6 text-red-500">❤️</div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Progress bar for bubbles popped */}
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${(bubblesPopped / requiredPops) * 100}%` }}>
            </div>
          </div>
          
          {/* Time remaining progress bar */}
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                isTimeRunningLow ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${timePercentage}%` }}></div>
          </div>
          
          {/* Bubble play area */}
          <BubbleZone title={`POP ${currentRule.toUpperCase()} NUMBERS!`}>
            <AnimatePresence>
              {bubbles.map(bubble => (
                <motion.div
                  key={bubble.id}
                  initial={{ x: `${bubble.x}%`, y: `${bubble.y}%`, opacity: 0.7 }}
                  animate={{ 
                    y: [null, '-120%'],  
                    x: [`${bubble.x}%`, `${bubble.x - 15 + Math.random() * 30}%`], 
                    opacity: [0.7, 1, 0.7] 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ y: { duration: 8 / bubble.speed, ease: "linear" }, x: { duration: 3 + Math.random() * 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }, opacity: { duration: 8 / bubble.speed, times: [0, 0.5, 1], ease: "linear" } }}
                  onClick={() => handleBubbleTap(bubble)} 
                  onAnimationComplete={(definition) => {
                    // Only remove bubbles when they've completed the y-axis animation (fully off screen)
                    if (definition && definition.y === '-120%') {
                      // Remove bubble when it fully exits the top (y < 0)
                      setBubbles(prev => prev.filter(b => b.id !== bubble.id));
                    }
                  }}
                  className="bubble absolute cursor-pointer"
                  style={{ width: `${bubble.size}px`, height: `${bubble.size}px` }}
                >
                  <span className="text-xl font-bold">{bubble.number}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </BubbleZone>
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
              <div className="text-xl mb-2">Time Played: {formatTime(120 - timeRemaining)}</div>
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