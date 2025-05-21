import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const BubbleZone = forwardRef(({ children, title }, ref) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      ref={ref}
      className="bubble-zone relative h-[500px] w-full rounded-lg overflow-hidden shadow-lg"
    >
      {title && (
        <div className="absolute top-3 left-0 right-0 z-10 text-center">
          <div className="game-title text-2xl md:text-3xl font-extrabold">{title}</div>
        </div>
      )}
      {children}
    </motion.div>
  );
});

export default BubbleZone;