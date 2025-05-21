import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';

const BookIcon = getIcon('book');
const CalculatorIcon = getIcon('calculator');
const FlaskConicalIcon = getIcon('flask-conical');
const GlobeIcon = getIcon('globe');
const CheckCircleIcon = getIcon('check-circle');
const AlertCircleIcon = getIcon('alert-circle');
const ArrowLeftIcon = getIcon('arrow-left');
const StarIcon = getIcon('star');
const TimerIcon = getIcon('timer');
const RotateCcwIcon = getIcon('rotate-ccw');

// Sample data for educational questions
const subjects = [
  { 
    id: 'math', 
    name: 'Math', 
    icon: 'calculator', 
    color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200',
    questions: [
      {
        id: 1,
        question: "What is 5 + 3?",
        options: ["7", "8", "9", "10"],
        correctAnswer: "8",
        explanation: "5 + 3 = 8"
      },
      {
        id: 2,
        question: "What is 10 - 4?",
        options: ["4", "5", "6", "7"],
        correctAnswer: "6",
        explanation: "10 - 4 = 6"
      },
      {
        id: 3,
        question: "What is 3 × 4?",
        options: ["7", "9", "12", "15"],
        correctAnswer: "12",
        explanation: "3 × 4 = 12"
      }
    ]
  },
  { 
    id: 'science', 
    name: 'Science', 
    icon: 'flask-conical', 
    color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200',
    questions: [
      {
        id: 1,
        question: "Which of these is a plant?",
        options: ["Dog", "Car", "Tree", "Phone"],
        correctAnswer: "Tree",
        explanation: "A tree is a type of plant"
      },
      {
        id: 2,
        question: "What do plants need to grow?",
        options: ["Only water", "Water and sunlight", "Only sunlight", "None of these"],
        correctAnswer: "Water and sunlight",
        explanation: "Plants need both water and sunlight to grow"
      },
      {
        id: 3,
        question: "What is the largest planet in our solar system?",
        options: ["Earth", "Mars", "Venus", "Jupiter"],
        correctAnswer: "Jupiter",
        explanation: "Jupiter is the largest planet in our solar system"
      }
    ]
  },
  { 
    id: 'language', 
    name: 'Language', 
    icon: 'book', 
    color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-200',
    questions: [
      {
        id: 1,
        question: "Which of these is a vowel?",
        options: ["B", "C", "E", "D"],
        correctAnswer: "E",
        explanation: "E is a vowel (A, E, I, O, U are vowels)"
      },
      {
        id: 2,
        question: "What is the opposite of 'happy'?",
        options: ["Sad", "Excited", "Angry", "Tired"],
        correctAnswer: "Sad",
        explanation: "Sad is the opposite of happy"
      },
      {
        id: 3,
        question: "What is the plural of 'child'?",
        options: ["Childs", "Childen", "Children", "Childs"],
        correctAnswer: "Children",
        explanation: "The plural of 'child' is 'children'"
      }
    ]
  },
  { 
    id: 'social', 
    name: 'Social Studies', 
    icon: 'globe', 
    color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-200',
    questions: [
      {
        id: 1,
        question: "What is the capital of the United States?",
        options: ["New York", "Washington D.C.", "Los Angeles", "Chicago"],
        correctAnswer: "Washington D.C.",
        explanation: "Washington D.C. is the capital of the United States"
      },
      {
        id: 2,
        question: "Which of these is a continent?",
        options: ["France", "Asia", "Canada", "Brazil"],
        correctAnswer: "Asia",
        explanation: "Asia is a continent"
      },
      {
        id: 3,
        question: "Who helps when someone is sick?",
        options: ["Teacher", "Doctor", "Chef", "Pilot"],
        correctAnswer: "Doctor",
        explanation: "Doctors help people when they are sick"
      }
    ]
  }
];

const MainFeature = ({ grade }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [waterEffect, setWaterEffect] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [stars, setStars] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setCurrentQuestion(0);
    setScore(0);
    setQuizComplete(false);
    toast.info(`Starting ${subject.name} quiz!`);
    setWaterEffect(false);
    
    // Only start the timer for math subject
    if (subject.id === 'math') {
      setTimeLeft(30);
      setTimerActive(true);
    }
    
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setCurrentQuestion(0);
    setScore(0);
    setQuizComplete(false);
    setTimerActive(false);
    setTimeLeft(30);
    setWaterEffect(false);
    clearInterval(timerRef.current);
  };

  const handleAnswerSelect = (answer) => {
    if (answered) return;
    
    setSelectedAnswer(answer);
    setAnswered(true);
    
    const isCorrect = answer === selectedSubject.questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      toast.success('Correct answer!', {
        icon: <CheckCircleIcon className="text-green-500 w-5 h-5" />,
        autoClose: 2000
      });
      setScore(prev => prev + 1);
      setWaterEffect(true);
      
      // Pause the timer
      if (selectedSubject.id === 'math') {
        setTimerActive(false);
      }
      
    } else {
      toast.error('Not quite right!', {
        icon: <AlertCircleIcon className="text-red-500 w-5 h-5" />
      });
    }
    
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setWaterEffect(false);
    setShowExplanation(false);
    setAnswered(false);
    setSelectedAnswer(null);

    if (currentQuestion < selectedSubject.questions.length - 1) {
      // Move to the next question and reset/start timer for math
      setCurrentQuestion(prev => prev + 1);
      if (selectedSubject.id === 'math') {
        setTimeLeft(30);
        setTimerActive(true);
      }
      
    } else {
      setQuizComplete(true);
    }
  };

  // Calculate stars based on score when quiz completes
  useEffect(() => {
    if (quizComplete) {
      const percentage = (score / selectedSubject.questions.length) * 100;
      if (percentage >= 90) setStars(3);
      else if (percentage >= 60) setStars(2);
      else if (percentage >= 30) setStars(1);
      else setStars(0);
      
      // Ensure timer is stopped when quiz is complete
      setTimerActive(false);
    }
  }, [quizComplete, score, selectedSubject]);
  
  // Timer effect for math section
  useEffect(() => {
    if (selectedSubject?.id === 'math' && timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(timerRef.current);
    }
  }, [selectedSubject, timerActive, timeLeft]);
  
  // Handle timer expiration
  useEffect(() => {
    if (timeLeft === 0 && selectedSubject?.id === 'math' && !answered && !quizComplete) {
      toast.error('Time\'s up!', {
        icon: <TimerIcon className="text-red-500 w-5 h-5" />
      });
      setAnswered(true);
      setShowExplanation(true);
    }
  }, [timeLeft, selectedSubject, answered, quizComplete]);
  
  // Clean up timer on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    setQuizComplete(false);
    setShowExplanation(false);
    setTimeLeft(30);
    setWaterEffect(false);
  };

  // Helper function to get the appropriate icon component
  const getSubjectIcon = (iconName) => {
    const IconComponent = getIcon(iconName);
    return <IconComponent className="w-8 h-8" />;
  };

  return (
    <div className="mb-16">
      <AnimatePresence mode="wait">
        {!selectedSubject ? (
          <motion.div
            key="subject-selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center mb-6">
              <div className={`w-12 h-12 rounded-full ${grade.color} flex items-center justify-center mr-3`}>
                <span className="font-bold">{grade.id}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {grade.name} - Choose a Subject
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {subjects.map((subject) => (
                <motion.div
                  key={subject.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`${subject.color} rounded-xl p-6 shadow-card cursor-pointer
                    transition-all duration-300 hover:shadow-lg flex flex-col items-center justify-center`}
                  onClick={() => handleSubjectSelect(subject)}
                >
                  <div className="mb-4 p-3 bg-white/30 dark:bg-surface-800/30 rounded-full">
                    {getSubjectIcon(subject.icon)}
                  </div>
                  <h3 className="text-xl font-bold">{subject.name}</h3>
                  <p className="mt-2 text-sm opacity-80">{subject.questions.length} questions</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : quizComplete ? (
          <motion.div
            key="quiz-results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="card max-w-2xl mx-auto text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Quiz Complete!</h2>
            
            <div className="py-5">
              <div className="text-4xl font-bold mb-3">
                Your Score: {score}/{selectedSubject.questions.length}
              </div>
              
              <div className="flex justify-center space-x-2 mb-8">
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
                      className={`w-10 h-10 ${
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
                  "Excellent job! You're a superstar!"
                ) : stars === 2 ? (
                  "Good work! Keep practicing!"
                ) : stars === 1 ? (
                  "You're making progress! Try again to improve."
                ) : (
                  "Don't worry, learning takes time. Try again!"
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRestartQuiz}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <RotateCcwIcon className="w-5 h-5" />
                  Try Again
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToSubjects}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Back to Subjects
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="quiz-questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center mb-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleBackToSubjects}
                className="mr-3 p-2 rounded-full bg-surface-100 dark:bg-surface-700"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </motion.button>
              
              <div className={`w-10 h-10 rounded-full ${selectedSubject.color} flex items-center justify-center mr-3`}>
                {getSubjectIcon(selectedSubject.icon)}
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold">
                {grade.name} - {selectedSubject.name}
              </h2>
            </div>
            
            <div className={`bg-white dark:bg-surface-800 rounded-xl shadow-card p-6 
                ${selectedSubject.id === 'math' ? `question-container relative ${waterEffect ? 'container-water-effect' : ''}` : ''}`}
            >
              <div className="flex justify-between items-center mb-4 relative z-10">
                <span className="text-surface-500 dark:text-surface-400">
                  Question {currentQuestion + 1} of {selectedSubject.questions.length}
                </span>

                {selectedSubject.id === 'math' && (
                  <div className="lava-background" 
                       style={{'--lava-height': `${((30 - timeLeft) / 30) * 100}%`}}></div>
                  /* Add additional lava bubble elements */
                  <div className="lava-bubble-1" style={{
                    '--bubble-delay': '0.7s',
                    '--bubble-size': '12px', 
                    '--bubble-left': '25%',
                    '--bubble-duration': '4s',
                    opacity: timeLeft < 20 ? 1 : 0
                  }}></div>
                )}

                <div className="flex items-center space-x-3">
                  {selectedSubject.id === 'math' && (
                    <div className={`px-3 py-1 rounded-full font-bold relative z-10 ${
                      timeLeft <= 10 ? 'lava-effect-urgent' : 'lava-effect' 
                    }`}>
                      <span className="flex items-center gap-1">
                        <TimerIcon className="w-4 h-4" /> {timeLeft}s
                      </span>
                    </div>
                  )}
                  <span className="text-surface-500 dark:text-surface-400">Score: {score}</span>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-6 relative z-10 text-surface-900 dark:text-surface-100">
                  {selectedSubject.questions[currentQuestion].question}
                </h3>
                
                <div className="space-y-3">
                  {selectedSubject.questions[currentQuestion].options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={answered}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        answered && option === selectedSubject.questions[currentQuestion].correctAnswer && 
                        option === selectedAnswer ? "water-effect " : ""
                      }${answered
                          ? option === selectedSubject.questions[currentQuestion].correctAnswer
                            ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                            : option === selectedAnswer
                              ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                              : "bg-surface-100 dark:bg-surface-700 border-surface-200 dark:border-surface-600" 
                          : "bg-surface-50 dark:bg-surface-700 border-surface-200 dark:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-600"
                      } relative z-10`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                          answered
                            ? option === selectedSubject.questions[currentQuestion].correctAnswer
                              ? "bg-green-500"
                              : option === selectedAnswer
                                ? "bg-red-500"
                                : "bg-surface-300 dark:bg-surface-500"
                            : "bg-surface-300 dark:bg-surface-500"
                        }`}>
                          {answered && option === selectedSubject.questions[currentQuestion].correctAnswer ? (
                            <CheckCircleIcon className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-xs text-white">
                              {String.fromCharCode(65 + index)}
                            </span>
                          )}
                        </div>
                        {option}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-4 rounded-lg mb-6 ${
                      selectedAnswer === selectedSubject.questions[currentQuestion].correctAnswer
                        ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
                        : "bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700"
                    }`}
                  >
                    <h4 className="font-bold mb-1">Explanation:</h4>
                    <p>{selectedSubject.questions[currentQuestion].explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-end"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextQuestion}
                    className="btn-primary relative z-10"
                  >
                    {currentQuestion < selectedSubject.questions.length - 1 
                      ? "Next Question" 
                      : "See Results"}
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainFeature;