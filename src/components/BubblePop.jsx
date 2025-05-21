import { useState, useEffect, useRef } from 'react';
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

// ✅ Bubble that floats from bottom to top
const FloatingBubble = ({ bubble, onClick, onComplete }) => {
  return (
    <motion.div
      className="bubble absolute cursor-pointer"
      initial={{ y: 0, opacity: 0.8 }}
      animate={{ y: -600, opacity: 1 }}
      transition={{ duration: 10, ease: 'linear' }}
      style={{
        x: `${bubble.x}%`,
        left: `${bubble.x}%`,
        bottom: '-80px',
        width: `${bubble.size}px`,
        height: `${bubble.size}px`
      }}
      onAnimationComplete={() => onComplete(bubble.id)}
      onClick={() => onClick(bubble)}
    >
      <span className="text-xl font-bold">{bubble.number}</span>
    </motion.div>
  );
};

const BubblePop = ({ onBack }) => {
  const [gameActive, setGameActive] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [stars, setStars] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentRule, setCurrentRule] = useState('odd');
  const [bubblesPopped, setBubblesPopped] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);

  const playAreaRef = useRef(null);

  const startGame = () => {
    setGameActive(true);
    setShowInstructions(false);
    setScore(0);
    setLevel(1);
    setLives(3);
    setGameOver(false);
    setBubblesPopped(0);
    setTimeRemaining(120);
    setCurrentRule(Math.random() > 0.5 ? 'odd' : 'even');
    setBubbles([]);
    toast.success(`Game started! Pop the ${currentRule.toUpperCase()} numbers!`);
  };

  const generateBubble = () => {
    const num = Math.floor(Math.random() * 100) + 1;
    const x = Math.random() * 90 + 5; // 5% to 95%
    const size = Math.floor(Math.random() * 30) + 40;

    return {
      id: Date.now() + Math.random(),
      number: num,
      isOdd: num % 2 !== 0,
      x,
      size
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameActive && !gameOver && timeRemaining > 0 && bubbles.length < 15) {
        setBubbles(prev => [...prev, generateBubble()]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActive, gameOver, bubbles, timeRemaining]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (gameActive && !gameOver) {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameOver(true);
            setGameActive(false);
            if (score >= 150) setStars(3);
            else if (score >= 100) setStars(2);
            else if (score >= 50) setStars(1);
            else setStars(0);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, gameOver]);

  const handleBubbleTap = (bubble) => {
    if (!gameActive || gameOver) return;

    const isCorrect =
      (currentRule === 'odd' && bubble.isOdd) ||
      (currentRule === 'even' && !bubble.isOdd);

    setScore(prev => prev + (isCorrect ? 10 : 1));
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    setBubblesPopped(prev => prev + (isCorrect ? 1 : 0));
    if (!isCorrect) setLives(prev => prev - 1);

    toast[isCorrect ? 'success' : 'error'](
      `${bubble.number} is ${bubble.isOdd ? 'odd' : 'even'}!`,
      {
        icon: isCorrect
          ? <CheckCircleIcon className="text-green-500 w-5 h-5" />
          : <XCircleIcon className="text-red-500 w-5 h-5" />,
        autoClose: 1000
      }
    );
  };

  const handleBubbleExit = (id) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
  };

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
        <h2 className="text-xl md:text-2xl font-bold">
          Bubble Pop - Odd and Even Numbers
        </h2>
      </div>

      {/* Game */}
      {showInstructions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="card max-w-2xl mx-auto text-center p-6 mb-6"
        >
          <h3 className="text-2xl font-bold mb-4">How to Play</h3>
          <p className="mb-4">Tap the {currentRule.toUpperCase()} numbers as they float up!</p>
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

      {gameActive && (
        <div className="card p-6 mb-6 relative overflow-hidden min-h-[500px]">
          <div className="flex justify-between mb-4">
            <div>Level: {level} | Score: {score}</div>
            <div>Lives: {'❤️'.repeat(lives)} | Time: {Math.floor(timeRemaining / 60)}:{`${timeRemaining % 60}`.padStart(2, '0')}</div>
          </div>
          <BubbleZone title={`POP ${currentRule.toUpperCase()} NUMBERS!`} ref={playAreaRef}>
            <AnimatePresence>
              {bubbles.map(bubble => (
                <FloatingBubble
                  key={bubble.id}
                  bubble={bubble}
                  onClick={handleBubbleTap}
                  onComplete={handleBubbleExit}
                />
              ))}
            </AnimatePresence>
          </BubbleZone>
        </div>
      )}

      {/* Game Over */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="card max-w-2xl mx-auto text-center p-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Game Over!</h2>
          <div className="text-xl mb-6">Final Score: {score}</div>
          <div className="text-xl mb-6">Level Reached: {level}</div>
          <div className="flex justify-center gap-3 mb-6">
            {[...Array(3)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-10 h-10 ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="btn-primary px-8 py-3 text-lg"
          >
            Play Again
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default BubblePop;