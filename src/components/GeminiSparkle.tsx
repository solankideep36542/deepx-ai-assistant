import React from 'react';

interface Props {
  className?: string;
  size?: number;
  animated?: boolean;
}

export const GeminiSparkle: React.FC<Props> = ({
  className = 'w-5 h-5',
  size,
  animated = false,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} ${animated ? 'animate-pulse' : ''} shrink-0`}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="geminiGradientA"
          x1="2"
          y1="2"
          x2="22"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4a8cf6" />
          <stop offset="35%" stopColor="#7075f5" />
          <stop offset="70%" stopColor="#c471ed" />
          <stop offset="100%" stopColor="#12c2e9" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
        fill="url(#geminiGradientA)"
      />
    </svg>
  );
};
