import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';

const CheckCircleIcon = getIcon('check-circle');
const XCircleIcon = getIcon('x-circle');
const ArrowLeftIcon = getIcon('arrow-left');
const StarIcon = getIcon('star');
const RefreshCwIcon = getIcon('refresh-cw');
const InfoIcon = getIcon('info');

const BubbleGame = ({ onBack }) => {
  const [gameActive, setGameActive] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [stars, setStars] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Initialize game
  const startGame = () => {
    setGameActive(true);
    setShowInstructions(false);
    setScore(0);
    setLevel(1);
    setLives(3);
    setGameOver(false);
    generateBubbles();
    toast.success('Game started! Pop the bubbles into the right container!');
  };
  
  // Generate random bubbles based on current level
  const generateBubbles = () => {
    const count = Math.min(3 + level, 8); // More bubbles as level increases, max 8
    const newBubbles = [];
    
    for (let i = 0; i < count; i++) {
      // Generate random number based on level
      const maxNum = level <= 2 ? 10 : level <= 4 ? 20 : 50;
      const num = Math.floor(Math.random() * maxNum) + 1;
      
      newBubbles.push({
        id: Date.now() + i,
        number: num,
        isOdd: num % 2 !== 0,
        x: Math.random() * 80 + 10, // % across screen
        y: Math.random() * 30 + 5,  // % from top
        size: Math.random() * 20 + 50, // Size between 50-70px
        popped: false,
        speed: Math.random() * 2 + 1 // Different floating speeds
      });
    }
    
    setBubbles(newBubbles);
  };
  
  // Handle bubble click/tap
  const handleBubbleDrag = (bubbleId, container) => {
    const bubble = bubbles.find(b => b.id === bubbleId);
    if (!bubble || bubble.popped) return;
    
    const isCorrect = 
      (container === 'odd' && bubble.isOdd) || 
      (container === 'even' && !bubble.isOdd);
    
    // Update bubble state
    setBubbles(prev => 
      prev.map(b => 
        b.id === bubbleId ? {...b, popped: true} : b
      )
    );
    
    // Handle scoring and feedback
    if (isCorrect) {
      setScore(prev => prev + 10);
      toast.success(`Correct! ${bubble.number} is ${bubble.isOdd ? 'odd' : 'even'}!`, {
        icon: <CheckCircleIcon className="text-green-500 w-5 h-5" />,
        autoClose: 1500
      });
    } else {
      setLives(prev => prev - 1);
      toast.error(`Oops! ${bubble.number} is ${bubble.isOdd ? 'odd' : 'even'}!`, {
        icon: <XCircleIcon className="text-red-500 w-5 h-5" />,
        autoClose: 1500
      });
    }
    
    // Check if all bubbles are popped
    const remainingBubbles = bubbles.filter(b => !b.popped && b.id !== bubbleId).length;
    if (remainingBubbles === 0) {
      setTimeout(() => {
        // Level up and generate new bubbles
        setLevel(prev => prev + 1);
        generateBubbles();
        toast.info(`Level ${level + 1}!`, { autoClose: 1500 });
      }, 1000);
    }
  };
  
  // Check for game over condition
  useEffect(() => {
    if (lives <= 0 && gameActive) {
      setGameOver(true);
      setGameActive(false);
      
      // Calculate stars based on score and level
      if (score >= 100) setStars(3);
      else if (score >= 50) setStars(2);
      else if (score >= 20) setStars(1);
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
          Bubble Game - Odd and Even Numbers
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
                <p>Bubbles with numbers will float on the screen</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 dark:bg-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 dark:text-blue-200 mr-3">2</span>
                <p>Drag each bubble to the correct container - odd numbers to the "ODD" container, even numbers to the "EVEN" container</p>
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
          
          {/* Bubble play area */}
          <div className="relative h-[350px] mb-4 bg-gradient-to-b from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg overflow-hidden">
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
                      x: [`${bubble.x}%`, `${bubble.x + (Math.random() * 10 - 5)}%`],
                      y: [`${bubble.y}%`, `${bubble.y + (Math.random() * 15 - 5)}%`], 
                      scale: 1, 
                      opacity: 1,
                      transition: { 
                        y: { duration: 2 * bubble.speed, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                        x: { duration: 3 * bubble.speed, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                      }
                    }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    drag
                    dragSnapToOrigin
                    className="bubble absolute flex items-center justify-center"
                    style={{ width: `${bubble.size}px`, height: `${bubble.size}px` }}
                    onDragEnd={(e, info) => {
                      // Detect which container the bubble was dropped on
                      const elements = document.elementsFromPoint(info.point.x, info.point.y);
                      const oddContainer = elements.find(el => el.id === 'odd-container');
                      const evenContainer = elements.find(el => el.id === 'even-container');
                      
                      if (oddContainer) handleBubbleDrag(bubble.id, 'odd');
                      else if (evenContainer) handleBubbleDrag(bubble.id, 'even');
                    }}
                  >
                    <span className="text-xl font-bold">{bubble.number}</span>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
          
          {/* Containers for odd/even */}
          <div className="flex justify-between gap-4">
            <div 
              id="odd-container"
              className="bubble-container odd-container"
            >
              <h3 className="text-xl font-bold">ODD</h3>
              <p className="text-sm">1, 3, 5, 7...</p>
            </div>
            
            <div 
              id="even-container"
              className="bubble-container even-container"
            >
              <h3 className="text-xl font-bold">EVEN</h3>
              <p className="text-sm">2, 4, 6, 8...</p>
            </div>
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

export default BubbleGame;