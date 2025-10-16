/**
 * TransitionWrapper Component
 * 
 * Framer Motion ile sayfa geçişlerini ve animasyonları yöneten wrapper component
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sayfa geçiş animasyonları
const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: -20,
    scale: 0.98
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

// Staggered animation için variants
export const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// Ana TransitionWrapper component'i
const TransitionWrapper = ({ 
  children, 
  className = '', 
  variant = 'page',
  delay = 0 
}) => {
  const getVariants = () => {
    switch (variant) {
      case 'page':
        return pageVariants;
      case 'fade':
        return {
          initial: { opacity: 0 },
          in: { opacity: 1 },
          out: { opacity: 0 }
        };
      case 'slide':
        return {
          initial: { opacity: 0, x: 50 },
          in: { opacity: 1, x: 0 },
          out: { opacity: 0, x: -50 }
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.8 },
          in: { opacity: 1, scale: 1 },
          out: { opacity: 0, scale: 0.8 }
        };
      default:
        return pageVariants;
    }
  };

  const getTransition = () => {
    return {
      ...pageTransition,
      delay: delay
    };
  };

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="in"
      exit="out"
      variants={getVariants()}
      transition={getTransition()}
    >
      {children}
    </motion.div>
  );
};

// StaggeredAnimation component'i
export const StaggeredAnimation = ({ 
  children, 
  className = '',
  staggerDelay = 0.1 
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

// AnimatePresence wrapper
export const AnimatedPage = ({ children, key }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Card animation component'i
export const AnimatedCard = ({ 
  children, 
  className = '',
  hover = true,
  delay = 0 
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: delay,
        ease: 'easeOut'
      }}
      whileHover={hover ? { 
        y: -5, 
        transition: { duration: 0.2 } 
      } : {}}
    >
      {children}
    </motion.div>
  );
};

// List animation component'i
export const AnimatedList = ({ 
  children, 
  className = '',
  staggerDelay = 0.1 
}) => {
  return (
    <motion.div
      className={className}
      variants={staggerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TransitionWrapper;
