/**
 * MedicalIllustration - Network Tarzı İletişimli Componentler
 * Birbirine bağlı sistem görseli
 */

import React from 'react';
import logoImage from '@/assets/logo.png';

const MedicalIllustration = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ maxWidth: '100%' }}
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
          <line x1="400" y1="300" x2="250" y2="200" stroke="#3b82f6" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowBlue)" />
          
          {/* Center to Top Right (Hospital) */}
          <line x1="400" y1="300" x2="550" y2="200" stroke="#06b6d4" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowCyan)" />
          
          {/* Center to Bottom Left (Doctor) */}
          <line x1="400" y1="300" x2="250" y2="420" stroke="#2563a8" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowDarkBlue)" />
          
          {/* Center to Bottom Right (Mobile) */}
          <line x1="400" y1="300" x2="550" y2="420" stroke="#5ba3d0" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowLightBlue)" />
        </g>

        {/* Animated Data Flow Particles */}
        <g>
          {/* Path definitions for particles */}
          <defs>
            <path id="path1" d="M 400 300 L 250 200" />
            <path id="path2" d="M 400 300 L 550 200" />
            <path id="path3" d="M 400 300 L 250 420" />
            <path id="path4" d="M 400 300 L 550 420" />
          </defs>
          
          {/* Flowing particles on each line */}
          <circle r="4" fill="#3b82f6" opacity="0.8" className="animate-flow-1">
            <animateMotion dur="3s" repeatCount="indefinite">
              <mpath href="#path1"/>
            </animateMotion>
          </circle>
          
          <circle r="3" fill="#06b6d4" opacity="0.8" className="animate-flow-2">
            <animateMotion dur="3.5s" repeatCount="indefinite">
              <mpath href="#path2"/>
            </animateMotion>
          </circle>
          
          <circle r="4" fill="#2563a8" opacity="0.8" className="animate-flow-3">
            <animateMotion dur="2.8s" repeatCount="indefinite">
              <mpath href="#path3"/>
            </animateMotion>
          </circle>
          
          <circle r="3" fill="#5ba3d0" opacity="0.8" className="animate-flow-4">
            <animateMotion dur="3.2s" repeatCount="indefinite">
              <mpath href="#path4"/>
            </animateMotion>
          </circle>
          
          {/* Additional smaller particles */}
          <circle r="2" fill="#ffffff" opacity="0.9" className="animate-flow-1" style={{animationDelay: '1.5s'}}>
            <animateMotion dur="3s" repeatCount="indefinite">
              <mpath href="#path1"/>
            </animateMotion>
          </circle>
          
          <circle r="2" fill="#ffffff" opacity="0.9" className="animate-flow-2" style={{animationDelay: '1.8s'}}>
            <animateMotion dur="3.5s" repeatCount="indefinite">
              <mpath href="#path2"/>
            </animateMotion>
          </circle>
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
          {/* Laptop Shadow */}
          <ellipse cx="250" cy="255" rx="75" ry="8" fill="#000000" opacity="0.1" />
          
          {/* Laptop Base */}
          <rect x="175" y="240" width="150" height="15" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" rx="8" />
          <rect x="180" y="145" width="140" height="100" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="8" />
          
          {/* Screen Bezel */}
          <rect x="185" y="150" width="130" height="90" fill="#000000" rx="6" />
          
          {/* Screen */}
          <rect x="190" y="155" width="120" height="80" fill="#1e40af" rx="4" />
          
          {/* macOS Style Header Bar */}
          <rect x="190" y="155" width="120" height="15" fill="#374151" rx="4" />
          <circle cx="198" cy="162" r="2.5" fill="#ef4444" />
          <circle cx="206" cy="162" r="2.5" fill="#f59e0b" />
          <circle cx="214" cy="162" r="2.5" fill="#10b981" />
          
          {/* Dashboard Content */}
          <rect x="195" y="175" width="110" height="55" fill="#dbeafe" rx="3" />
          
          {/* Header */}
          <text x="200" y="185" fontSize="6" fill="#1e40af" fontWeight="bold">MediKariyer Dashboard</text>
          
          {/* Stats Cards */}
          <rect x="200" y="190" width="30" height="25" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" rx="4" />
          <rect x="235" y="190" width="30" height="25" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" rx="4" />
          <rect x="270" y="190" width="30" height="25" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" rx="4" />
          
          {/* Card Icons and Numbers */}
          <circle cx="215" cy="200" r="4" fill="#3b82f6" />
          <text x="212" y="203" fontSize="4" fill="#ffffff" fontWeight="bold">👨‍⚕️</text>
          <text x="205" y="212" fontSize="5" fill="#1e40af" fontWeight="bold" className="animate-pulse">2.5K</text>
          
          <circle cx="250" cy="200" r="4" fill="#10b981" />
          <text x="247" y="203" fontSize="4" fill="#ffffff" fontWeight="bold">🏥</text>
          <text x="243" y="212" fontSize="5" fill="#059669" fontWeight="bold" className="animate-pulse" style={{animationDelay: '0.5s'}}>150+</text>
          
          <circle cx="285" cy="200" r="4" fill="#f59e0b" />
          <text x="282" y="203" fontSize="4" fill="#ffffff" fontWeight="bold">📊</text>
          <text x="280" y="212" fontSize="5" fill="#d97706" fontWeight="bold" className="animate-pulse" style={{animationDelay: '1s'}}>98%</text>
          
          {/* Chart Area */}
          <rect x="200" y="220" width="100" height="8" fill="#f3f4f6" rx="2" />
          <text x="202" y="226" fontSize="4" fill="#6b7280">Aylık İstatistikler</text>
        </g>

        {/* Component 2: Modern Hospital Building - Top Right */}
        <g className="animate-slide-in-right">
          {/* Building Shadow */}
          <ellipse cx="550" cy="255" rx="75" ry="8" fill="#000000" opacity="0.1" />
          
          {/* Card Background */}
          <rect x="480" y="150" width="140" height="100" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" rx="12" />
          
          {/* Hospital Building */}
          <g>
            {/* Main Building Structure */}
            <rect x="505" y="185" width="90" height="55" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="4" />
            
            {/* Building Entrance */}
            <rect x="540" y="220" width="20" height="20" fill="#1e40af" rx="2" />
            <rect x="545" y="225" width="10" height="15" fill="#3b82f6" rx="1" />
            <circle cx="555" cy="232" r="1" fill="#ffffff" />
            
            {/* Hospital Cross Sign */}
            <rect x="520" y="165" width="50" height="15" fill="#ef4444" rx="3" />
            <rect x="540" y="170" width="10" height="3" fill="#ffffff" rx="0.5" />
            <rect x="542" y="168" width="6" height="7" fill="#ffffff" rx="0.5" />
            
            {/* Windows - First Floor */}
            <rect x="515" y="195" width="12" height="15" fill="#dbeafe" stroke="#94a3b8" strokeWidth="1" rx="2" />
            <rect x="532" y="195" width="12" height="15" fill="#dbeafe" stroke="#94a3b8" strokeWidth="1" rx="2" />
            <rect x="556" y="195" width="12" height="15" fill="#fef3c7" stroke="#94a3b8" strokeWidth="1" rx="2" className="animate-blink" />
            <rect x="573" y="195" width="12" height="15" fill="#dbeafe" stroke="#94a3b8" strokeWidth="1" rx="2" />
            
            {/* Window Frames */}
            <line x1="521" y1="195" x2="521" y2="210" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="515" y1="202" x2="527" y2="202" stroke="#94a3b8" strokeWidth="0.5" />
            
            <line x1="538" y1="195" x2="538" y2="210" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="532" y1="202" x2="544" y2="202" stroke="#94a3b8" strokeWidth="0.5" />
            
            <line x1="562" y1="195" x2="562" y2="210" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="556" y1="202" x2="568" y2="202" stroke="#94a3b8" strokeWidth="0.5" />
            
            <line x1="579" y1="195" x2="579" y2="210" stroke="#94a3b8" strokeWidth="0.5" />
            <line x1="573" y1="202" x2="585" y2="202" stroke="#94a3b8" strokeWidth="0.5" />
            
            {/* Ambulance Parking */}
            <rect x="510" y="245" width="25" height="8" fill="#ef4444" rx="2" />
            <text x="515" y="250" fontSize="4" fill="#ffffff" fontWeight="bold">AMBULANS</text>
            
            {/* Hospital Sign */}
            <text x="490" y="167" fontSize="7" fill="#1e40af" fontWeight="bold">HASTANE</text>
          </g>
        </g>

        {/* Component 3: Central Hub/Logo */}
        <g className="animate-scale-in">
          {/* Main Circle Background */}
          <circle cx="400" cy="300" r="60" fill="url(#cyanGradient)" opacity="0.95" />
          
          {/* White Inner Circle for Logo */}
          <circle cx="400" cy="300" r="50" fill="#ffffff" />
          
          {/* Logo Image - Circular Clip */}
          <defs>
            <clipPath id="circleClip">
              <circle cx="400" cy="300" r="45" />
            </clipPath>
          </defs>
          
          <foreignObject x="355" y="255" width="90" height="90" clipPath="url(#circleClip)">
            <div xmlns="http://www.w3.org/1999/xhtml" className="w-full h-full flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="MediKariyer Logo" 
                className="w-full h-full object-cover"
                style={{
                  borderRadius: '50%'
                }}
              />
            </div>
          </foreignObject>
          
          {/* Corner Dots */}
          <circle cx="360" cy="260" r="5" fill="#ffffff" opacity="0.8" className="animate-pulse-slow" />
          <circle cx="440" cy="260" r="5" fill="#ffffff" opacity="0.8" className="animate-pulse-slow delay-100" />
          <circle cx="360" cy="340" r="5" fill="#ffffff" opacity="0.8" className="animate-pulse-slow delay-200" />
          <circle cx="440" cy="340" r="5" fill="#ffffff" opacity="0.8" className="animate-pulse-slow delay-300" />
        </g>

        {/* Component 4: Doctor Profile Card - Bottom Left */}
        <g className="animate-slide-in-left delay-200">
          {/* Card Shadow */}
          <ellipse cx="250" cy="475" rx="75" ry="8" fill="#000000" opacity="0.1" />
          
          {/* Card Background */}
          <rect x="180" y="370" width="140" height="100" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" rx="12" />
          
          {/* Profile Header */}
          <rect x="185" y="375" width="130" height="25" fill="#f8fafc" rx="8" />
          <text x="190" y="385" fontSize="7" fill="#1e40af" fontWeight="bold">👨‍⚕️ Doktor Profili</text>
          
          {/* Profile Photo */}
          <circle cx="210" cy="420" r="18" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="2" />
          <circle cx="210" cy="415" r="8" fill="#6b7280" />
          <path d="M 195 430 Q 210 425 225 430" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" fill="none" />
          
          {/* Online Status */}
          <circle cx="225" cy="405" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          
          {/* Profile Info */}
          <text x="235" y="410" fontSize="8" fill="#1f2937" fontWeight="bold">Dr. Ahmet Yılmaz</text>
          <text x="235" y="420" fontSize="6" fill="#6b7280">Kardiyoloji Uzmanı</text>
          <text x="235" y="428" fontSize="6" fill="#6b7280">📍 İstanbul Anadolu</text>
          
          {/* Experience Badge */}
          <rect x="235" y="432" width="35" height="12" fill="#dbeafe" rx="6" />
          <text x="240" y="440" fontSize="5" fill="#1e40af" fontWeight="bold">5 Yıl Deneyim</text>
          
          {/* Stats */}
          <rect x="185" y="450" width="130" height="15" fill="#f9fafb" rx="4" />
          <text x="190" y="460" fontSize="6" fill="#374151">📋 12 Başvuru</text>
          <text x="250" y="460" fontSize="6" fill="#374151">⭐ 4.8/5.0</text>
        </g>

        {/* Component 5: Modern iPhone App - Bottom Right */}
        <g className="animate-slide-in-right delay-200">
          {/* Phone Shadow */}
          <ellipse cx="550" cy="475" rx="75" ry="8" fill="#000000" opacity="0.1" />
          
          {/* Card Background */}
          <rect x="480" y="370" width="140" height="100" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" rx="12" />
          
          {/* Title */}
          <text x="490" y="385" fontSize="7" fill="#1e40af" fontWeight="bold">📱 Mobil Uygulama</text>
          
          {/* iPhone Frame */}
          <rect x="520" y="395" width="60" height="70" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="12" />
          
          {/* Screen */}
          <rect x="525" y="402" width="50" height="56" fill="#000000" rx="8" />
          
          {/* Dynamic Island */}
          <rect x="540" y="404" width="20" height="4" fill="#1f2937" rx="2" />
          
          {/* Screen Content */}
          <rect x="527" y="410" width="46" height="46" fill="#f8fafc" rx="6" />
          
          {/* App Header */}
          <rect x="529" y="412" width="42" height="8" fill="#1e40af" rx="2" />
          <text x="531" y="417" fontSize="4" fill="#ffffff" fontWeight="bold">MediKariyer</text>
          <circle cx="567" cy="416" r="2" fill="#ffffff" />
          
          {/* Job Cards */}
          <rect x="530" y="423" width="40" height="10" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" rx="2" />
          <circle cx="535" cy="428" r="2" fill="#3b82f6" />
          <rect x="540" y="425" width="20" height="1.5" fill="#1f2937" rx="0.5" />
          <rect x="540" y="427.5" width="15" height="1.5" fill="#6b7280" rx="0.5" />
          <rect x="565" y="426" width="4" height="4" fill="#10b981" rx="1" />
          
          <rect x="530" y="436" width="40" height="10" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" rx="2" />
          <circle cx="535" cy="441" r="2" fill="#ef4444" />
          <rect x="540" y="438" width="20" height="1.5" fill="#1f2937" rx="0.5" />
          <rect x="540" y="440.5" width="15" height="1.5" fill="#6b7280" rx="0.5" />
          <rect x="565" y="439" width="4" height="4" fill="#f59e0b" rx="1" />
          
          <rect x="530" y="449" width="40" height="6" fill="#f3f4f6" rx="2" />
          <text x="532" y="453" fontSize="3" fill="#6b7280">Daha fazla ilan...</text>
          
          {/* Home Indicator */}
          <rect x="545" y="460" width="10" height="2" fill="#6b7280" rx="1" />
          
          {/* Notification Badge */}
          <circle cx="575" cy="398" r="6" fill="#ef4444" />
          <text x="572" y="401" fontSize="5" fill="#ffffff" fontWeight="bold">3</text>
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
