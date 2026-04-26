import React, { useEffect, useState, useRef } from 'react';

const FlyingBirds = () => {
  const [birdPositions, setBirdPositions] = useState([
    { emoji: '🐰', left: -150, top: 8, speed: 1.2, waveOffset: 0, amplitude: 3, frequency: 0.008, phase: 0 },
    { emoji: '🐹', left: -200, top: 18, speed: 1.8, waveOffset: 55, amplitude: 2.5, frequency: 0.012, phase: 45 },
    { emoji: '🐻‍❄️', left: -100, top: 28, speed: 1.5, waveOffset: 110, amplitude: 4, frequency: 0.006, phase: 90 },
    { emoji: '🦅', left: -180, top: 38, speed: 2.0, waveOffset: 165, amplitude: 5, frequency: 0.015, phase: 135 },
    { emoji: '🦇', left: -120, top: 48, speed: 1.3, waveOffset: 220, amplitude: 6, frequency: 0.020, phase: 180 },
    { emoji: '🐶', left: -160, top: 58, speed: 1.6, waveOffset: 275, amplitude: 2, frequency: 0.007, phase: 225 },
    { emoji: '🐣', left: -140, top: 68, speed: 1.1, waveOffset: 330, amplitude: 3.5, frequency: 0.010, phase: 270 },
    { emoji: '🐥', left: -190, top: 78, speed: 1.9, waveOffset: 385, amplitude: 4.5, frequency: 0.014, phase: 315 },
    { emoji: '🐼', left: -110, top: 88, speed: 1.4, waveOffset: 440, amplitude: 2.8, frequency: 0.009, phase: 360 },
    { emoji: '🐻', left: -170, top: 98, speed: 1.5, waveOffset: 495, amplitude: 3.2, frequency: 0.011, phase: 405 },
    { emoji: '🦁', left: -130, top: 108, speed: 1.7, waveOffset: 550, amplitude: 4.8, frequency: 0.018, phase: 450 },
    { emoji: '🐯', left: -195, top: 118, speed: 1.0, waveOffset: 605, amplitude: 5.5, frequency: 0.022, phase: 495 }
  ]);
  
  const animationRef = useRef();
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      
      // Target 60fps (16.67ms per frame)
      if (deltaTime >= 16.67) {
        setBirdPositions(prev => prev.map(bird => {
          let newLeft = bird.left + bird.speed;
          
          // Improved natural flow with individual bird characteristics
          let time = newLeft * bird.frequency;
          let newTop = bird.top + 
            Math.sin(time + (bird.phase * Math.PI / 180)) * bird.amplitude +
            Math.sin(time * 1.5 + (bird.waveOffset * 0.01)) * (bird.amplitude * 0.3) +
            Math.cos(time * 0.7 + (bird.phase * 0.5)) * (bird.amplitude * 0.2);
          
          // Add slight speed variation for more natural movement
          let speedVariation = Math.sin(time * 0.3) * 0.1;
          newLeft = newLeft + speedVariation;
          
          if (newLeft >= window.innerWidth + 200) {
            newLeft = -200 - Math.random() * 50; // Staggered restart
          }
          
          return {
            ...bird,
            left: newLeft,
            top: newTop
          };
        }));
        lastTimeRef.current = timestamp;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      {birdPositions.map((bird, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            fontSize: '60px',
            color: '#FFFFFF',
            textShadow: '0 0 20px rgba(0,0,0,1), 0 0 40px rgba(255,255,255,0.5)',
            zIndex: 999999,
            top: `${bird.top}px`,
            left: `${bird.left}px`,
            backgroundColor: 'transparent',
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))',
            transition: 'none'
          }}
        >
          {bird.emoji}
        </div>
      ))}
    </>
  );
};

export default FlyingBirds;
