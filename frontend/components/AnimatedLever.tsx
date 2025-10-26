'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Zap, ArrowRight, Play, Sparkles } from 'lucide-react';

interface AnimatedLeverProps {
  onActivate: () => void;
  isActivated: boolean;
  isDisabled: boolean;
  className?: string;
}

const AnimatedLever: React.FC<AnimatedLeverProps> = ({
  onActivate,
  isActivated,
  isDisabled,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);
  const leverRef = useRef<HTMLDivElement>(null);
  
  // Motion values for lever position
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Spring animation for smooth movement
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });
  
  // Transform lever rotation based on position
  const rotate = useTransform(x, [-100, 100], [-15, 15]);
  const scale = useTransform(x, [-100, 100], [0.95, 1.05]);
  
  // Transform background glow based on position
  const glowOpacity = useTransform(x, [-100, 100], [0.3, 1]);
  const glowScale = useTransform(x, [-100, 100], [0.8, 1.2]);

  // Reset position when not dragging
  useEffect(() => {
    if (!isDragging && !isActivated) {
      x.set(0);
      y.set(0);
    }
  }, [isDragging, isActivated, x, y]);

  // Handle activation
  useEffect(() => {
    if (isActivated && !hasActivated) {
      setHasActivated(true);
      // Trigger haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }
    }
  }, [isActivated, hasActivated]);

  const handleDragStart = () => {
    if (isDisabled || isActivated) return;
    setIsDragging(true);
  };

  const handleDrag = (event: any, info: any) => {
    if (isDisabled || isActivated) return;
    
    // Constrain to horizontal movement
    x.set(Math.max(-100, Math.min(100, info.point.x - 200)));
    y.set(0);
  };

  const handleDragEnd = () => {
    if (isDisabled || isActivated) return;
    
    setIsDragging(false);
    
    // Check if lever was pulled far enough to activate
    const currentX = x.get();
    if (currentX > 60) {
      onActivate();
    } else {
      // Snap back to center
      x.set(0);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isDisabled || isActivated) return;
    
    const currentX = x.get();
    if (currentX > 60) {
      onActivate();
    } else {
      x.set(0);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/30 to-red-500/20 rounded-3xl blur-xl"
        style={{
          opacity: glowOpacity,
          scale: glowScale,
        }}
        animate={{
          opacity: isActivated ? [0.3, 0.8, 0.3] : 0.3,
        }}
        transition={{
          duration: 2,
          repeat: isActivated ? Infinity : 0,
        }}
      />

      {/* Main Lever Container */}
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 border-2 border-slate-700 shadow-2xl">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Instructions */}
        <div className="text-center mb-8">
          <motion.h3
            className="text-2xl font-bold text-white mb-2"
            animate={{
              scale: isActivated ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: isActivated ? Infinity : 0,
            }}
          >
            {isActivated ? 'LAUNCHING!' : 'PULL TO LAUNCH'}
          </motion.h3>
          <p className="text-slate-300 text-sm">
            {isActivated 
              ? 'Your dubbing job is starting...' 
              : 'Slide the lever to the right to start dubbing'
            }
          </p>
        </div>

        {/* Lever Track */}
        <div className="relative h-16 bg-slate-700 rounded-2xl mb-6 overflow-hidden">
          {/* Track Glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Progress Indicator */}
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl"
            style={{
              width: useTransform(x, [-100, 100], ['0%', '100%']),
            }}
          />
        </div>

        {/* Lever Handle */}
        <motion.div
          ref={leverRef}
          className="relative w-32 h-16 mx-auto cursor-grab active:cursor-grabbing"
          style={{
            x: springX,
            y: springY,
            rotate: rotate,
            scale: scale,
          }}
          drag="x"
          dragConstraints={{ left: -100, right: 100, top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onTouchEnd={handleTouchEnd}
          whileDrag={{ scale: 1.1 }}
          animate={isActivated ? {
            x: [0, 100, 0],
            rotate: [0, 15, 0],
          } : {}}
          transition={isActivated ? {
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
        >
          {/* Lever Base */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl shadow-lg border-2 border-red-400">
            {/* Lever Grip */}
            <div className="absolute inset-2 bg-gradient-to-br from-red-300 to-red-500 rounded-xl flex items-center justify-center">
              <motion.div
                animate={{
                  scale: isDragging ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 0.3,
                  repeat: isDragging ? Infinity : 0,
                }}
              >
                {isActivated ? (
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Zap className="w-8 h-8 text-white" />
                  </motion.div>
                ) : (
                  <ArrowRight className="w-8 h-8 text-white" />
                )}
              </motion.div>
            </div>

            {/* Lever Glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          {/* Activation Particles */}
          {isActivated && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: [0, (Math.random() - 0.5) * 200],
                    y: [0, (Math.random() - 0.5) * 200],
                    opacity: [1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Status Indicator */}
        <motion.div
          className="mt-6 text-center"
          animate={{
            opacity: isActivated ? [0.5, 1, 0.5] : 1,
          }}
          transition={{
            duration: 1,
            repeat: isActivated ? Infinity : 0,
          }}
        >
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              className="w-3 h-3 rounded-full bg-green-500"
              animate={{
                scale: isActivated ? [1, 1.5, 1] : 1,
                opacity: isActivated ? [1, 0.3, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: isActivated ? Infinity : 0,
              }}
            />
            <span className="text-sm text-slate-300">
              {isActivated ? 'Processing...' : 'Ready to launch'}
            </span>
          </div>
        </motion.div>

        {/* Floating Sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-400"
              style={{
                left: `${20 + i * 15}%`,
                top: `${20 + (i % 3) * 30}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedLever;