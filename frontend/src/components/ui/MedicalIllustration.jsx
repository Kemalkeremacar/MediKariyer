/**
 * MedicalIllustration - Network Tarzı İletişimli Componentler
 * Birbirine bağlı sistem görseli
 */

import React, { useState } from 'react';
import logoImage from '@/assets/logo.png';
import mobileAppImage from '@/assets/Mobil Uygulama-compressed.webp';
import dashboardImage from '@/assets/DashboardLaptop-compressed.webp';
import hospitalImage from '@/assets/Hastane-compressed.webp';
import doctorImage from '@/assets/Doktor Profili-compressed.webp';

const MedicalIllustration = () => {
  const [imageErrors, setImageErrors] = useState({
    dashboard: false,
    hospital: false,
    logo: false,
    doctor: false,
    mobile: false
  });

  const handleImageError = (imageKey) => {
    setImageErrors(prev => ({ ...prev, [imageKey]: true }));
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 900 720"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-full"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="geometricPrecision"
      >
        <defs>
          {/* Arrow Markers */}
          <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
          </marker>
          
          <marker id="arrowCyan" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#06b6d4" />
          </marker>
          
          <marker id="arrowDarkBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#2563a8" />
          </marker>
          
          <marker id="arrowLightBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#5ba3d0" />
          </marker>

          {/* Gradients */}
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563a8" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          
          <linearGradient id="lightBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5ba3d0" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          
          <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>

          <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0f9ff" />
          </linearGradient>

          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Clip Paths */}
          <clipPath id="dashboardClip">
            <rect x="95" y="135" width="250" height="150" rx="12" />
          </clipPath>
          
          <clipPath id="hospitalClip">
            <rect x="555" y="135" width="250" height="150" rx="12" />
          </clipPath>
          
          <clipPath id="circleClip">
            <circle cx="450" cy="360" r="57" />
          </clipPath>
          
          <clipPath id="doctorClip">
            <rect x="95" y="455" width="250" height="150" rx="12" />
          </clipPath>
          
          <clipPath id="mobileClip">
            <rect x="555" y="455" width="250" height="150" rx="12" />
          </clipPath>
        </defs>

        {/* Connection Lines Between Components - With Arrows */}
        <g className="animate-draw-line" opacity="0.5">
          <line x1="450" y1="360" x2="220" y2="210" stroke="#3b82f6" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowBlue)" />
          <line x1="450" y1="360" x2="680" y2="210" stroke="#06b6d4" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowCyan)" />
          <line x1="450" y1="360" x2="220" y2="530" stroke="#2563a8" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowDarkBlue)" />
          <line x1="450" y1="360" x2="680" y2="530" stroke="#5ba3d0" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowLightBlue)" />
        </g>

        {/* Component 1: Dashboard - Top Left */}
        <g className="animate-slide-in-left">
          <ellipse cx="220" cy="300" rx="140" ry="12" fill="#000000" opacity="0.1" />
          <text x="220" y="115" fontSize="11" fill="#1e40af" fontWeight="bold" textAnchor="middle">💻 Dashboard</text>
          <rect x="90" y="130" width="260" height="160" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" rx="15" />
          
          <foreignObject x="95" y="135" width="250" height="150" clipPath="url(#dashboardClip)">
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' }}>
              {!imageErrors.dashboard ? (
                <img 
                  src={dashboardImage} 
                  alt="MediKariyer Dashboard" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }}
                  loading="lazy"
                  onError={() => handleImageError('dashboard')}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#3b82f6', fontSize: '48px' }}>💻</div>
              )}
            </div>
          </foreignObject>
        </g>

        {/* Component 2: Hospital - Top Right */}
        <g className="animate-slide-in-right">
          <ellipse cx="680" cy="300" rx="140" ry="12" fill="#000000" opacity="0.1" />
          <text x="680" y="115" fontSize="11" fill="#1e40af" fontWeight="bold" textAnchor="middle">🏥 Hastane</text>
          <rect x="550" y="130" width="260" height="160" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" rx="15" />
          
          <foreignObject x="555" y="135" width="250" height="150" clipPath="url(#hospitalClip)">
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #ecfeff, #cffafe)' }}>
              {!imageErrors.hospital ? (
                <img 
                  src={hospitalImage} 
                  alt="MediKariyer Hastane" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }}
                  loading="lazy"
                  onError={() => handleImageError('hospital')}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#06b6d4', fontSize: '48px' }}>🏥</div>
              )}
            </div>
          </foreignObject>
        </g>

        {/* Component 3: Central Logo */}
        <g className="animate-scale-in">
          <circle cx="450" cy="360" r="75" fill="url(#cyanGradient)" opacity="0.95" />
          <circle cx="450" cy="360" r="63" fill="#ffffff" />
          
          <foreignObject x="393" y="303" width="114" height="114" clipPath="url(#circleClip)">
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
              {!imageErrors.logo ? (
                <img 
                  src={logoImage} 
                  alt="MediKariyer Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px', borderRadius: '50%' }}
                  onError={() => handleImageError('logo')}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#06b6d4', fontSize: '48px', fontWeight: 'bold' }}>M</div>
              )}
            </div>
          </foreignObject>
          
          <circle cx="400" cy="310" r="6" fill="#ffffff" opacity="0.8" className="animate-pulse-slow" />
          <circle cx="500" cy="310" r="6" fill="#ffffff" opacity="0.8" className="animate-pulse-slow delay-100" />
          <circle cx="400" cy="410" r="6" fill="#ffffff" opacity="0.8" className="animate-pulse-slow delay-200" />
          <circle cx="500" cy="410" r="6" fill="#ffffff" opacity="0.8" className="animate-pulse-slow delay-300" />
        </g>

        {/* Component 4: Doctor Profile - Bottom Left */}
        <g className="animate-slide-in-left delay-200">
          <ellipse cx="220" cy="620" rx="140" ry="12" fill="#000000" opacity="0.1" />
          <text x="220" y="435" fontSize="11" fill="#1e40af" fontWeight="bold" textAnchor="middle">👨‍⚕️ Doktor Profili</text>
          <rect x="90" y="450" width="260" height="160" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" rx="15" />
          
          <foreignObject x="95" y="455" width="250" height="150" clipPath="url(#doctorClip)">
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)' }}>
              {!imageErrors.doctor ? (
                <img 
                  src={doctorImage} 
                  alt="MediKariyer Doktor Profili" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }}
                  loading="lazy"
                  onError={() => handleImageError('doctor')}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#2563a8', fontSize: '48px' }}>👨‍⚕️</div>
              )}
            </div>
          </foreignObject>
        </g>

        {/* Component 5: Mobile App - Bottom Right */}
        <g className="animate-slide-in-right delay-200">
          <ellipse cx="680" cy="620" rx="140" ry="12" fill="#000000" opacity="0.1" />
          <text x="680" y="435" fontSize="11" fill="#1e40af" fontWeight="bold" textAnchor="middle">📱 Mobil Uygulama</text>
          <rect x="550" y="450" width="260" height="160" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" rx="15" />
          
          <foreignObject x="555" y="455" width="250" height="150" clipPath="url(#mobileClip)">
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #eff6ff, #e0f2fe)' }}>
              {!imageErrors.mobile ? (
                <img 
                  src={mobileAppImage} 
                  alt="MediKariyer Mobil Uygulama" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }}
                  loading="lazy"
                  onError={() => handleImageError('mobile')}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#5ba3d0', fontSize: '48px' }}>📱</div>
              )}
            </div>
          </foreignObject>
        </g>
      </svg>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.95;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        @keyframes slide-in-left {
          0% {
            transform: translateX(-100px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-in-right {
          0% {
            transform: translateX(100px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes draw-line {
          0% {
            stroke-dashoffset: 100;
            opacity: 0.2;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.4;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 2.5s ease-in-out infinite;
          transform-origin: center;
        }

        .animate-slide-in-left {
          animation: slide-in-left 1s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 1.2s ease-out;
        }

        .animate-draw-line {
          animation: draw-line 3s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};

export default MedicalIllustration;
