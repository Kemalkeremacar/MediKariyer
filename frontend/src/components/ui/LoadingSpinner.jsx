import React from 'react';

/**
 * Gelişmiş Loading Spinner Component
 * Farklı boyutlar ve stiller destekler
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = null,
  overlay = false,
  fullScreen = false
}) => {
  // Size variants
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  // Color variants
  const colorClasses = {
    primary: 'text-emerald-600',
    secondary: 'text-teal-600',
    white: 'text-white',
    gray: 'text-gray-400',
    blue: 'text-blue-600',
    red: 'text-red-600'
  };

  // Text size based on spinner size
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  const spinnerClasses = `
    animate-spin 
    ${sizeClasses[size]} 
    ${colorClasses[color]} 
    ${className}
  `.trim();

  const Spinner = () => (
    <svg 
      className={spinnerClasses}
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const SpinnerWithText = () => (
    <div className="flex flex-col items-center space-y-2">
      <Spinner />
      {text && (
        <p className={`${textSizeClasses[size]} ${colorClasses[color]} font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  // Overlay wrapper
  if (overlay || fullScreen) {
    const overlayClasses = fullScreen 
      ? 'fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm'
      : 'absolute inset-0 bg-white bg-opacity-75 backdrop-blur-sm z-10';

    return (
      <div className={overlayClasses}>
        <div className="flex items-center justify-center h-full">
          <SpinnerWithText />
        </div>
      </div>
    );
  }

  return text ? <SpinnerWithText /> : <Spinner />;
};

/**
 * Skeleton Loading Component
 * Content placeholder için
 */
export const SkeletonLoader = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '',
  rows = 1,
  avatar = false,
  card = false
}) => {
  if (card) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`animate-pulse ${className}`}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <div 
            key={index}
            className={`bg-gray-300 rounded ${height} ${
              index === rows - 1 ? 'w-2/3' : width
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Button Loading State
 */
export const ButtonSpinner = ({ size = 'sm', className = '' }) => (
  <LoadingSpinner 
    size={size} 
    color="white" 
    className={`mr-2 ${className}`}
  />
);

/**
 * Page Loading Component
 */
export const PageLoader = ({ text = 'Yükleniyor...' }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="xl" color="primary" />
      <p className="mt-4 text-lg text-gray-600 font-medium">{text}</p>
    </div>
  </div>
);

/**
 * Table Loading Component
 */
export const TableLoader = ({ rows = 5, columns = 4 }) => (
  <div className="animate-pulse">
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Inline Loading Component
 */
export const InlineLoader = ({ text = 'Yükleniyor' }) => (
  <div className="flex items-center space-x-2 text-gray-600">
    <LoadingSpinner size="sm" color="gray" />
    <span className="text-sm">{text}</span>
  </div>
);

export default LoadingSpinner;