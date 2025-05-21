import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

const BrainIcon = getIcon('brain');
const BookOpenIcon = getIcon('book-open');
const AwardIcon = getIcon('award');
const GraduationCapIcon = getIcon('graduation-cap');

const Home = () => {
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  const grades = [
    { id: 1, name: "Grade 1", color: "bg-blue-100 dark:bg-blue-900" },
    { id: 2, name: "Grade 2", color: "bg-green-100 dark:bg-green-900" },
    { id: 3, name: "Grade 3", color: "bg-yellow-100 dark:bg-yellow-900" },
    { id: 4, name: "Grade 4", color: "bg-orange-100 dark:bg-orange-900" },
    { id: 5, name: "Grade 5", color: "bg-red-100 dark:bg-red-900" },
    { id: 6, name: "Grade 6", color: "bg-purple-100 dark:bg-purple-900" },
  ];

  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
    setShowSubjectSelector(true);
    toast.success(`Selected ${grade.name}!`, {
      icon: <GraduationCapIcon className="text-blue-500 w-5 h-5" />
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-block p-4 mb-4 rounded-full bg-primary/10 dark:bg-primary/20"
        >
          <BrainIcon className="w-12 h-12 md:w-16 md:h-16 text-primary" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-surface-900 dark:text-surface-50">
          Welcome to <span className="text-primary">BrainSprout</span>!
        </h1>
        <p className="text-lg md:text-xl text-surface-600 dark:text-surface-300 max-w-2xl mx-auto">
          Fun, interactive learning adventures for primary school students.
          Explore subjects through games and activities!
        </p>
      </motion.section>

      {!showSubjectSelector ? (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
            Choose Your Grade Level
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {grades.map((grade) => (
              <motion.button
                key={grade.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGradeSelect(grade)}
                className={`${grade.color} rounded-xl p-6 shadow-card transition-all hover:shadow-lg
                  flex flex-col items-center justify-center h-32`}
              >
                <GraduationCapIcon className="w-8 h-8 mb-3 text-surface-800 dark:text-surface-100" />
                <span className="font-bold text-surface-800 dark:text-surface-100">
                  {grade.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.section>
      ) : (
        <MainFeature grade={selectedGrade} />
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="card"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
              <BookOpenIcon className="w-6 h-6 text-blue-500 dark:text-blue-300" />
            </div>
            <h3 className="font-bold text-xl">Interactive Learning</h3>
          </div>
          <p className="text-surface-600 dark:text-surface-300">
            Engage with fun activities that make learning exciting and memorable across all subjects.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="card"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
              <AwardIcon className="w-6 h-6 text-green-500 dark:text-green-300" />
            </div>
            <h3 className="font-bold text-xl">Track Progress</h3>
          </div>
          <p className="text-surface-600 dark:text-surface-300">
            Earn badges and watch your skills grow with our visual progress tracking system.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="card"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
              <BrainIcon className="w-6 h-6 text-purple-500 dark:text-purple-300" />
            </div>
            <h3 className="font-bold text-xl">Personalized Path</h3>
          </div>
          <p className="text-surface-600 dark:text-surface-300">
            Learning adapts to your pace and interests, ensuring an optimal educational experience.
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;