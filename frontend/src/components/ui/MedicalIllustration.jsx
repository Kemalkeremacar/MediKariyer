/**
 * MedicalIllustration - Network Tarzı İletişimli Componentler
 * Birbirine bağlı sistem görseli
 */

import React from 'react';
import logoImage from '@/assets/logo.png';
import mobileAppImage from '@/assets/Mobil Uygulama.png';
import dashboardImage from '@/assets/DashboardLaptop.png';
import hospitalImage from '@/assets/Hastane.png';
import doctorImage from '@/assets/Doktor Profili.png';

const MedicalIllustration = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 900 720"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ maxWidth: '100%' }}
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="geometricPrecision"
      >

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

        {/* Connection Lines Between Components - With Arrows */}
        <g className="animate-draw-line" opacity="0.5">
          {/* Center to Top Left (Laptop) */}
          <line x1="450" y1="360" x2="220" y2="210" stroke="#3b82f6" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowBlue)" />
          
          {/* Center to Top Right (Hospital) */}
          <line x1="450" y1="360" x2="680" y2="210" stroke="#06b6d4" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowCyan)" />
          
          {/* Center to Bottom Left (Doctor) */}
          <line x1="450" y1="360" x2="220" y2="530" stroke="#2563a8" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowDarkBlue)" />
          
          {/* Center to Bottom Right (Mobile) */}
          <line x1="450" y1="360" x2="680" y2="530" stroke="#5ba3d0" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowLightBlue)" />
        </g>


        <defs>
          {/* Blue Gradient */}
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563a8" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          
          {/* Light Blue Gradient */}
          <linearGradient id="lightBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5ba3d0" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          
          {/* Cyan Gradient */}
          <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>

          {/* White Gradient */}
          <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0f9ff" />
          </linearGradient>

          {/* Green Gradient */}
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>


        </defs>



        {/* Component 1: Modern Laptop/Dashboard - Top Left */}
        <g className="animate-slide-in-left">
          {/* Card Shadow */}
          <ellipse cx="220" cy="300" rx="140" ry="12" fill="#000000" opacity="0.1" />
          
          {/* Title - Centered above the card */}
          <text x="220" y="115" fontSize="11" fill="#1e40af" fontWeight="bold" textAnchor="middle">💻 Dashboard</text>
          
          {/* Card Background - Same size as others: 260x160 */}
          <rect x="90" y="130" width="260" height="160" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" rx="15" />
          
          {/* Dashboard Image - Full size to fit the card */}
          <defs>
            <clipPath id="dashboardClip">
              <rect x="95" y="135" width="250" height="150" rx="12" />
            </clipPath>
          </defs>
          
          <foreignObject x="95" y="135" width="250" height="150" clipPath="url(#dashboardClip)">
            <div xmlns="http://www.w3.org/1999/xhtml" className="w-full h-full flex items-center justify-center bg-white">
              <img 
                src={dashboardImage} 
                alt="MediKariyer Dashboard" 
                className="w-full h-full object-contain"
                style={{
                  borderRadius: '12px',
                  WebkitTransform: 'translateZ(0)',
                  WebkitBackfaceVisibility: 'hidden',
                  WebkitPerspective: '1000',
                  transform: 'translate3d(0,0,0)'
                }}
              />
            </div>
          </foreignObject>
        </g>

        {/* Component 2: Modern Hospital Building - Top Right */}
        <g className="animate-slide-in-right">
          {/* Card Shadow */}
          <ellipse cx="680" cy="300" rx="140" ry="12" fill="#000000" opacity="0.1" />
          
          {/* Title - Centered above the card */}
          <text x="680" y="115" fontSize="11" fill="#1e40af" fontWeight="bold" textAnchor="middle">🏥 Hastane</text>
          
          {/* Card Background - Same size: 260x160 */}
          <rect x="550" y="130" width="260" height="160" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" rx="15" />
          
          {/* Hospital Image - Full size to fit the card */}
          <defs>
            <clipPath id="hospitalClip">
              <rect x="555" y="135" width="250" height="150" rx="12" />
            </clipPath>
          </defs>
          
          <foreignObject x="555" y="135" width="250" height="150" clipPath="url(#hospitalClip)">
            <div xmlns="http://www.w3.org/1999/xhtml" className="w-full h-full flex items-center justify-center bg-white">
              <img 
                src={hospitalImage} 
                alt="MediKariyer Hastane" 
                className="w-full h-full object-contain"
                style={{
                  borderRadius: '12px',
                  WebkitTransform: 'translateZ(0)',
                  WebkitBackfaceVisibility: 'hidden',
                  WebkitPerspective: '1000',
                  transform: 'translate3d(0,0,0)'
                }}
              />
            </div>
          </foreignObject>
        </g>

        {/* Component 3: Central Hub/Logo */}
        <g className="animate-scale-in">
          {/* Main Circle Background */}
          <circle cx="450" cy="360" r="75" fill="url(#cyanGradient)" opacity="0.95" />
          
          {/* White Inner Circle for Logo */}
          <circle cx="450" cy="360" r="63" fill="#ffffff" />
          
          {/* Logo Image - Circular Clip */}
          <defs>
            <clipPath id="circleClip">
              <circle cx="450" cy="360" r="57" />
            </clipPath>
          </defs>
          
          <foreignObject x="393" y="303" width="114" height="114" clipPath="url(#circleClip)">
            <div xmlns="http://www.w3.org/1999/xhtml" className="w-full h-full flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="MediKariyer Logo" 
                className="w-full h-full object-contain"
                style={{
                  borderRadius: '50%',
                  WebkitTransform: 'translateZ(0)',
                  WebkitBackfaceVisibility: 'hidden',
                  WebkitPerspective: '1000',
                  transform: 'translate3d(0,0,0)'
                }}
              />
            </div>
          </foreignObject>
          
          {/* Corner Dots */}
          <circle cx="400" cy="310" r="6" fill="#ffffff" opacity="0.8" className="animate-pulse-slow" />
          <circle cx="500" cy="310" r="6" fill="#ffffff" opacity="0.8" className="animate-pulse-slow delay-100" />
          <circle cx="400" cy="410" r="6" fill="#ffffff" opacity="0.8" className="animate-pulse-slow delay-200" />
          <circle cx="500" cy="410" r="6" fill="#ffffff" opacity="0.8" className="animate-pulse-slow delay-300" />
        </g>

        {/* Component 4: Doctor Profile Card - Bottom Left */}
        <g className="animate-slide-in-left delay-200">
          {/* Card Shadow */}
          <ellipse cx="220" cy="620" rx="140" ry="12" fill="#000000" opacity="0.1" />
          
          {/* Title - Centered above the card */}
          <text x="220" y="435" fontSize="11" fill="#1e40af" fontWeight="bold" textAnchor="middle">👨‍⚕️ Doktor Profili</text>
          
          {/* Card Background - Same size: 260x160 */}
          <rect x="90" y="450" width="260" height="160" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" rx="15" />
          
          {/* Doctor Profile Image - Full size to fit the card */}
          <defs>
            <clipPath id="doctorClip">
              <rect x="95" y="455" width="250" height="150" rx="12" />
            </clipPath>
          </defs>
          
          <foreignObject x="95" y="455" width="250" height="150" clipPath="url(#doctorClip)">
            <div xmlns="http://www.w3.org/1999/xhtml" className="w-full h-full flex items-center justify-center bg-white">
              <img 
                src={doctorImage} 
                alt="MediKariyer Doktor Profili" 
                className="w-full h-full object-contain"
                style={{
                  borderRadius: '12px',
                  WebkitTransform: 'translateZ(0)',
                  WebkitBackfaceVisibility: 'hidden',
                  WebkitPerspective: '1000',
                  transform: 'translate3d(0,0,0)'
                }}
              />
            </div>
          </foreignObject>
        </g>

        {/* Component 5: Mobile App Preview - Bottom Right */}
        <g className="animate-slide-in-right delay-200">
          {/* Card Shadow */}
          <ellipse cx="680" cy="620" rx="140" ry="12" fill="#000000" opacity="0.1" />
          
          {/* Title - Centered above the card */}
          <text x="680" y="435" fontSize="11" fill="#1e40af" fontWeight="bold" textAnchor="middle">📱 Mobil Uygulama</text>
          
          {/* Card Background - Same size: 260x160 */}
          <rect x="550" y="450" width="260" height="160" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" rx="15" />
          
          {/* Mobile App Image - Full size to fit the card */}
          <defs>
            <clipPath id="mobileClip">
              <rect x="555" y="455" width="250" height="150" rx="12" />
            </clipPath>
          </defs>
          
          <foreignObject x="555" y="455" width="250" height="150" clipPath="url(#mobileClip)">
            <div xmlns="http://www.w3.org/1999/xhtml" className="w-full h-full flex items-center justify-center bg-white">
              <img 
                src={mobileAppImage} 
                alt="MediKariyer Mobil Uygulama" 
                className="w-full h-full object-contain"
                style={{
                  borderRadius: '12px',
                  WebkitTransform: 'translateZ(0)',
                  WebkitBackfaceVisibility: 'hidden',
                  WebkitPerspective: '1000',
                  transform: 'translate3d(0,0,0)'
                }}
              />
            </div>
          </foreignObject>
        </g>
      </svg>

      {/* CSS Animations */}
      <style jsx={true}>{`
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

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0.6;
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

        @keyframes flow-1 {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
          }
        }

        @keyframes flow-2 {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
          }
        }

        @keyframes flow-3 {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
          }
        }

        @keyframes flow-4 {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
          }
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes rotate-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 2.5s ease-in-out infinite;
          transform-origin: center;
        }

        .animate-ping-slow {
          animation: ping-slow 2s ease-in-out infinite;
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

        .animate-flow-1 {
          animation: flow-1 3s ease-in-out infinite;
        }

        .animate-flow-2 {
          animation: flow-2 3s ease-in-out infinite 0.5s;
        }

        .animate-flow-3 {
          animation: flow-3 3s ease-in-out infinite 1s;
        }

        .animate-flow-4 {
          animation: flow-4 3s ease-in-out infinite 1.5s;
        }

        .animate-rotate {
          animation: rotate 20s linear infinite;
          transform-origin: center;
        }

        .animate-rotate-slow {
          animation: rotate-slow 30s linear infinite;
          transform-origin: center;
        }

        .animate-blink {
          animation: blink 2s ease-in-out infinite;
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
