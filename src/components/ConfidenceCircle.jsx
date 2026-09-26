import { useState, useEffect } from 'react';

export default function ConfidenceCircle({ confidence, isFake }) {
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedConfidence / 100) * circumference;

  const colorClass = isFake ? 'text-red-500' : 'text-green-500';
  const bgColorClass = isFake ? 'text-red-100' : 'text-green-100';

  useEffect(() => {
    // Animate from 0 to actual confidence
    setAnimatedConfidence(0);
    const duration = 1000;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = confidence / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= confidence) {
        setAnimatedConfidence(confidence);
        clearInterval(timer);
      } else {
        setAnimatedConfidence(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [confidence]);

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {/* Background Circle */}
      <svg className="absolute w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className={bgColorClass}
        />
        {/* Progress Circle */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-[33ms] ease-linear`}
        />
      </svg>
      {/* Text */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold tracking-tighter text-slate-900">{animatedConfidence}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-1">Confidence</span>
      </div>
    </div>
  );
}
