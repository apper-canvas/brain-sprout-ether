import { useState, useEffect, useCallback, useRef } from 'react';
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
  const bubblesToRemoveRef = useRef(new Set());
  // Create grid to track occupied positions - divide the playzone into a 10x10 grid
  const GRID_COLS = 20; // 20 columns for more granular positioning
  const occupiedPositionsRef = useRef(Array(GRID_COLS).fill().map(() => []));
  const playAreaRef = useRef(null);

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
    // Reset occupied positions
    occupiedPositionsRef.current = Array(GRID_COLS).fill().map(() => []);
    
    // Create a starter set of bubbles (will be continued by the useEffect)
    const initialBubbles = Array.from({ length: Math.min(5, level + 2) }, () => {
      // Generate random number between 1 and 100
      const num = Math.floor(Math.random() * 100) + 1;
      
      // Find a free position for the bubble
      // Distribute bubbles evenly along the width of the container with some randomness
      // Use larger bubbles for better visibility
      const size = Math.floor(Math.random() * 25) + 45; // 45-70px
      
      // Position bubbles evenly across the full width
      // Add an offset to ensure bubbles start at different horizontal positions
      const section = GRID_COLS / Math.min(5, level + 2); // Divide container into sections
      const sectionIndex = initialBubbles.length;
      const baseX = (sectionIndex * section) + (Math.random() * section * 0.6) - (section * 0.3);
      const position = Math.max(5, Math.min(95, (baseX / GRID_COLS) * 100));
      
      // Note: positions are now percentages (0-100) of container width
      const x = position;
      
      // Mark this position as occupied
      const gridX = Math.floor(x / (100 / GRID_COLS));
      const safeGridX = Math.max(0, Math.min(GRID_COLS - 1, gridX));
      
      // Calculate bubble width in grid cells
      const bubbleWidthInCells = Math.ceil((size / (window.innerWidth * 0.8)) * GRID_COLS);
      const halfBubbleWidth = Math.floor(bubbleWidthInCells / 2);
      
      // Reserve space for this bubble in the grid (mark adjacent cells as occupied too)
      for (let i = Math.max(0, safeGridX - halfBubbleWidth); 
           i <= Math.min(GRID_COLS - 1, safeGridX + halfBubbleWidth); i++) {
        occupiedPositionsRef.current[i].push({
          id: Date.now() + Math.random(),
          y: 100, // Bottom of container
          size
        });
      }
      
      // Calculate a speed based on level with less randomness for more predictable movement
      const speed = 2 + (level * 0.3) + (Math.random() * 0.5);
      
      return {
        id: Date.now() + Math.random() + num,
        number: num,
        isOdd: num % 2 !== 0,
        x, y: 100, size, speed
      };
    });
    setBubbles(initialBubbles);
  }, [level]);

  // Function to find a free position for new bubbles
  const findFreePosition = (minSize, maxSize) => {
    // Generate random size first
    const size = Math.random() * (maxSize - minSize) + minSize;
    
    // Calculate bubble width in grid cells
    const bubbleWidthInCells = Math.ceil((size / (window.innerWidth * 0.8)) * GRID_COLS);
    const halfBubbleWidth = Math.floor(bubbleWidthInCells / 2);
    
    // First, analyze which sections of the grid have fewer bubbles
    const sectionBubbleCounts = [];
    const sectionWidth = Math.ceil(GRID_COLS / 4); // Divide into 4 sections
    
    for (let i = 0; i < 4; i++) {
      let count = 0;
      for (let j = i * sectionWidth; j < (i + 1) * sectionWidth && j < GRID_COLS; j++) {
        count += occupiedPositionsRef.current[j].filter(b => b.y > 70).length;
      }
      sectionBubbleCounts.push({ section: i, count });
    }
    
    // Sort sections by bubble count, prefer sections with fewer bubbles
    sectionBubbleCounts.sort((a, b) => a.count - b.count);
    
    // Try finding a position in each section, starting with least populated
    for (const { section } of sectionBubbleCounts) {
      const sectionStart = section * sectionWidth;
      const sectionEnd = Math.min(GRID_COLS, (section + 1) * sectionWidth);
      
      // Try multiple positions within this section
      for (let attempt = 0; attempt < 5; attempt++) {
        // Generate a position within this section
        const gridX = sectionStart + Math.floor(Math.random() * (sectionEnd - sectionStart));
        const x = ((gridX + 0.5) / GRID_COLS) * 100; // Convert to percentage
        
        // Check if this position and surrounding cells are free
        let positionIsFree = true;
        
        // Check surrounding grid cells based on bubble size
        for (let i = Math.max(0, gridX - halfBubbleWidth); 
             i <= Math.min(GRID_COLS - 1, gridX + halfBubbleWidth); i++) {
          // Only check for bubbles near the bottom area
          const bottomBubbles = occupiedPositionsRef.current[i].filter(b => b.y > 80);
          if (bottomBubbles.length > 0) {
            positionIsFree = false;
            break;
          }
        }
        
        if (positionIsFree) {
          return { x, size };
        }
      }
    }
    
    // If all attempts with preferred sections failed, try completely random positions
    for (let attempt = 0; attempt < 10; attempt++) {
      const x = 5 + Math.random() * 90; // Keep within 5-95% range
      const gridX = Math.floor(x / (100 / GRID_COLS));
      const safeGridX = Math.max(0, Math.min(GRID_COLS - 1, gridX));
      
      // Less strict check - just make sure immediate position isn't too crowded
      const immediate = occupiedPositionsRef.current[safeGridX].filter(b => b.y > 90);
      
      if (immediate.length < 1) {
        return { x, size };
      }
    }
    
    // If all attempts failed, just return a random position anyway
    return { 
      x: 5 + Math.random() * 90,
      size: Math.random() * (maxSize - minSize) + minSize 
    };
  };

  // Continuously generate new bubbles
  useEffect(() => {
    if (gameActive && bubbles.length < Math.min(Math.max(10, level + 9), 15)) {
      const timer = setInterval(() => { 
        if (gameActive && !gameOver) {
          const num = Math.floor(Math.random() * 100) + 1;
          const { x, size } = findFreePosition(45, 65); // Slightly larger bubbles

          // Mark this position as occupied in the grid
          const gridX = Math.floor(x / (100 / GRID_COLS));
          const safeGridX = Math.max(0, Math.min(GRID_COLS - 1, gridX));

          // Calculate bubble width in grid cells for better collision prevention
          const bubbleWidthInCells = Math.ceil((size / (window.innerWidth * 0.8)) * GRID_COLS);
          const halfBubbleWidth = Math.floor(bubbleWidthInCells / 2);

          // Mark adjacent grid cells as occupied
          for (let i = Math.max(0, safeGridX - halfBubbleWidth); 
               i <= Math.min(GRID_COLS - 1, safeGridX + halfBubbleWidth); i++) {
            occupiedPositionsRef.current[i].push({
              id: Date.now() + Math.random(),
              y: 100, // Bottom of container
              size
            });
          }
          
          // Add the new bubble to the game
          const newBubble = {
            id: Date.now() + Math.random(),
            number: num,
            isOdd: num % 2 !== 0,
            x: x, // Position from findFreePosition
            y: 100,
            size, // Use the size from findFreePosition
            speed: 2 + Math.random() * (level * 0.5)
          };
          
          setBubbles(prev => [...prev, newBubble]);
        }
      }, Math.max(300, 600 - (level * 30))); // Adjust generation speed based on level

      return () => clearInterval(timer);
    }
  }, [bubbles.length, gameActive, gameOver, level]);

  // Handle bubbles that need to be removed after animation completes
  useEffect(() => {
    if (bubblesToRemoveRef.current.size > 0) {
      const bubblesIdsToRemove = Array.from(bubblesToRemoveRef.current);
      setBubbles(prev => prev.filter(b => !bubblesIdsToRemove.includes(b.id)));
      
      // Clear the set after processing
      bubblesToRemoveRef.current = new Set();
      
      // Also clean up old entries in occupiedPositionsRef
      // This helps prevent memory leaks and keeps collision detection accurate
      // Update grid structure - calculate more accurately when bubbles leave the screen
      // This cleans up positions for better collision detection
      for (let col = 0; col < GRID_COLS; col++) {
        // Filter out bubbles that have moved significantly up the screen
        // y < 0 means they've left the top of the screen, but we give some buffer room
        occupiedPositionsRef.current[col] = occupiedPositionsRef.current[col].filter(b => b.y > -20);
      }
    }
  }, [bubblesToRemoveRef.current.size]);
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

    // Always add a point when a bubble is manually popped
    setScore(prev => prev + 1);
    
    // Remove the bubble
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));

    // Also remove the bubble from occupied positions grid for better tracking
    const gridX = Math.floor(bubble.x / (100 / GRID_COLS));
    const safeGridX = Math.max(0, Math.min(GRID_COLS - 1, gridX));
    
    // Calculate bubble width in grid cells
    const bubbleWidthInCells = Math.ceil((bubble.size / (window.innerWidth * 0.8)) * GRID_COLS);
    const halfBubbleWidth = Math.floor(bubbleWidthInCells / 2);
    
    // Clear this bubble from the grid in all cells it might occupy
    for (let i = Math.max(0, safeGridX - halfBubbleWidth); 
         i <= Math.min(GRID_COLS - 1, safeGridX + halfBubbleWidth); i++) {
      // Remove any entries at this approximate position
      occupiedPositionsRef.current[i] = occupiedPositionsRef.current[i].filter(b => Math.abs(b.y - bubble.y) > 10);
    }

    // Handle scoring and feedback
    if (isCorrect) {
      // Add bonus points for correct pops
      setScore(prev => prev + 9); // +1 already added, so +9 more for a total of +10
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
          {/* Game stats row */}
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
          <BubbleZone title={`POP ${currentRule.toUpperCase()} NUMBERS!`} ref={playAreaRef}>
            <AnimatePresence>
              {bubbles.map(bubble => (
                <motion.div
                  key={bubble.id}
                  initial={{ 
                    x: `${bubble.x}%`, 
                    y: '100%', 
                    opacity: 0.7 
                  }}
                  animate={{
                    y: '-20%', // Move to above the screen
                    x: [`${bubble.x}%`, `${bubble.x - 5 + Math.random() * 10}%`, `${bubble.x + 5 + Math.random() * 10}%`, `${bubble.x}%`], // Gentle zigzag movement
                    opacity: [0.8, 1, 0.8]
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8, 
                    transition: { duration: 0.3 }
                  }}
                  transition={{ 
                    y: { duration: 12 / bubble.speed, ease: "linear" },
                    x: { duration: 8, times: [0, 0.33, 0.66, 1], ease: "easeInOut" },
                    opacity: { duration: 15 / bubble.speed, times: [0, 0.5, 1], ease: "linear" }
                  }}
                  onClick={() => handleBubbleTap(bubble)} 
                  onAnimationComplete={(definition) => {
                    // Only remove the bubble when it's fully off the top of the screen
                    if (definition === "y" || definition?.y === '-20%') {
                      bubblesToRemoveRef.current.add(bubble.id);
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