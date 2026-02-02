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
        style={{ maxWidth: '700px' }}
      >
        {/* Outer Dashed Border */}
        <rect 
          x="100" 
          y="80" 
          width="600" 
          height="440" 
          fill="none" 
          stroke="#93c5fd" 
          strokeWidth="3" 
          strokeDasharray="12,8" 
          rx="20" 
          opacity="0.6"
        />
        {/* Definitions for gradients */}
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
        </defs>

        {/* Connection Lines Between Components - With Arrows */}
        <g className="animate-draw-line" opacity="0.5">
          {/* Center to Top Left (Laptop) */}
          <line x1="400" y1="300" x2="250" y2="200" stroke="#3b82f6" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowBlue)" />
          
          {/* Center to Top Right (Documents) */}
          <line x1="400" y1="300" x2="550" y2="200" stroke="#06b6d4" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowCyan)" />
          
          {/* Center to Bottom Left (User) */}
          <line x1="400" y1="300" x2="250" y2="420" stroke="#2563a8" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowDarkBlue)" />
          
          {/* Center to Bottom Right (Server) */}
          <line x1="400" y1="300" x2="550" y2="420" stroke="#5ba3d0" strokeWidth="3" strokeDasharray="8,8" markerEnd="url(#arrowLightBlue)" />
        </g>

        {/* Component 1: Laptop/Dashboard - Top Left */}
        <g className="animate-slide-in-left">
          {/* Laptop Base */}
          <rect x="180" y="150" width="140" height="100" fill="url(#whiteGradient)" stroke="#2563a8" strokeWidth="4" rx="8" />
          
          {/* Screen */}
          <rect x="190" y="160" width="120" height="80" fill="#dbeafe" rx="4" />
          
          {/* Header Bar */}
          <rect x="190" y="160" width="120" height="12" fill="#2563a8" opacity="0.8" rx="4" />
          <circle cx="198" cy="166" r="2" fill="#ffffff" />
          <circle cx="205" cy="166" r="2" fill="#ffffff" />
          <circle cx="212" cy="166" r="2" fill="#ffffff" />
          
          {/* Dashboard Cards */}
          <rect x="200" y="180" width="25" height="22" fill="#2563a8" opacity="0.7" rx="3" />
          <rect x="230" y="180" width="25" height="22" fill="#5ba3d0" opacity="0.7" rx="3" />
          <rect x="260" y="180" width="35" height="22" fill="#06b6d4" opacity="0.7" rx="3" />
          
          {/* Mini Icons in Cards */}
          <circle cx="212" cy="188" r="3" fill="#ffffff" opacity="0.8" />
          <rect x="209" y="193" width="6" height="4" fill="#ffffff" opacity="0.6" rx="1" />
          
          <path d="M 238 186 L 242 190 L 246 184" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.8" />
          
          <rect x="268" y="186" width="8" height="2" fill="#ffffff" opacity="0.6" rx="0.5" />
          <rect x="268" y="190" width="12" height="2" fill="#ffffff" opacity="0.6" rx="0.5" />
          <rect x="268" y="194" width="10" height="2" fill="#ffffff" opacity="0.6" rx="0.5" />
          
          {/* Chart Area */}
          <polyline points="200,215 212,210 224,208 236,205 248,207 260,202 272,204 284,200 296,203" stroke="#2563a8" strokeWidth="2" fill="none" opacity="0.7" />
          
          {/* Chart Points */}
          <circle cx="224" cy="208" r="2.5" fill="#2563a8" />
          <circle cx="248" cy="207" r="2.5" fill="#5ba3d0" />
          <circle cx="272" cy="204" r="2.5" fill="#06b6d4" />
          
          {/* Bottom Stats */}
          <text x="200" y="232" fontSize="8" fill="#2563a8" opacity="0.7" fontWeight="bold">2.5K</text>
          <text x="240" y="232" fontSize="8" fill="#5ba3d0" opacity="0.7" fontWeight="bold">150+</text>
          <text x="275" y="232" fontSize="8" fill="#06b6d4" opacity="0.7" fontWeight="bold">98%</text>
        </g>

        {/* Component 2: Documents/Files - Top Right */}
        <g className="animate-slide-in-right">
          {/* Document Stack */}
          <rect x="480" y="150" width="140" height="100" fill="url(#whiteGradient)" stroke="#06b6d4" strokeWidth="4" rx="8" />
          
          {/* Title Bar */}
          <rect x="490" y="160" width="120" height="10" fill="#06b6d4" opacity="0.2" rx="2" />
          <text x="495" y="167" fontSize="7" fill="#06b6d4" fontWeight="bold">Başvurular</text>
          
          {/* File Icons with Details */}
          <g>
            <rect x="495" y="178" width="32" height="40" fill="#e0f2fe" stroke="#5ba3d0" strokeWidth="2" rx="3" />
            <rect x="500" y="183" width="22" height="2" fill="#06b6d4" opacity="0.6" rx="0.5" />
            <rect x="500" y="188" width="18" height="2" fill="#06b6d4" opacity="0.5" rx="0.5" />
            <rect x="500" y="193" width="20" height="2" fill="#06b6d4" opacity="0.5" rx="0.5" />
            <circle cx="513" cy="208" r="6" fill="#10b981" opacity="0.9" />
            <path d="M 510 208 L 512 210 L 516 206" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
          
          <g>
            <rect x="535" y="178" width="32" height="40" fill="#e0f2fe" stroke="#5ba3d0" strokeWidth="2" rx="3" />
            <rect x="540" y="183" width="22" height="2" fill="#06b6d4" opacity="0.6" rx="0.5" />
            <rect x="540" y="188" width="18" height="2" fill="#06b6d4" opacity="0.5" rx="0.5" />
            <rect x="540" y="193" width="20" height="2" fill="#06b6d4" opacity="0.5" rx="0.5" />
            <circle cx="553" cy="208" r="6" fill="#f59e0b" opacity="0.9" />
            <text x="550" y="211" fontSize="8" fill="#ffffff" fontWeight="bold">!</text>
          </g>
          
          <g>
            <rect x="575" y="178" width="32" height="40" fill="#e0f2fe" stroke="#5ba3d0" strokeWidth="2" rx="3" />
            <rect x="580" y="183" width="22" height="2" fill="#06b6d4" opacity="0.6" rx="0.5" />
            <rect x="580" y="188" width="18" height="2" fill="#06b6d4" opacity="0.5" rx="0.5" />
            <rect x="580" y="193" width="20" height="2" fill="#06b6d4" opacity="0.5" rx="0.5" />
            <circle cx="593" cy="208" r="6" fill="#3b82f6" opacity="0.9" />
            <path d="M 593 204 L 593 209 M 593 211 L 593 212" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          
          {/* Success Badge */}
          <circle cx="605" cy="235" r="12" fill="url(#greenGradient)" />
          <path d="M 600 235 L 603 238 L 610 231" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
          <text x="490" y="238" fontSize="7" fill="#10b981" fontWeight="bold">Onaylandı</text>
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

        {/* Component 4: User Profile - Bottom Left */}
        <g className="animate-slide-in-left delay-200">
          {/* Card Background */}
          <rect x="180" y="370" width="140" height="100" fill="url(#whiteGradient)" stroke="#2563a8" strokeWidth="4" rx="8" />
          
          {/* Header */}
          <text x="190" y="385" fontSize="8" fill="#2563a8" fontWeight="bold">Doktor Profili</text>
          
          {/* User Avatar with Badge */}
          <circle cx="220" cy="415" r="22" fill="url(#blueGradient)" />
          <circle cx="220" cy="410" r="9" fill="#ffffff" />
          <path d="M 208 425 Q 220 418 232 425" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          
          {/* Online Badge - Static */}
          <circle cx="235" cy="400" r="6" fill="#10b981" />
          
          {/* User Info */}
          <text x="250" y="405" fontSize="9" fill="#2563a8" fontWeight="bold">Dr. Ahmet Y.</text>
          <text x="250" y="415" fontSize="7" fill="#5ba3d0">Kardiyoloji</text>
          <text x="250" y="423" fontSize="7" fill="#5ba3d0">İstanbul</text>
          
          {/* Stats Bar */}
          <rect x="190" y="440" width="110" height="20" fill="#f0f9ff" rx="3" />
          
          <g>
            <circle cx="200" cy="450" r="3" fill="#10b981" />
            <text x="207" y="453" fontSize="7" fill="#2563a8">12 Başvuru</text>
          </g>
          
          <g>
            <circle cx="260" cy="450" r="3" fill="#3b82f6" />
            <text x="267" y="453" fontSize="7" fill="#2563a8">5 Yıl</text>
          </g>
        </g>

        {/* Component 5: Server/Database - Bottom Right */}
        <g className="animate-slide-in-right delay-200">
          {/* Server Rack */}
          <rect x="480" y="370" width="140" height="100" fill="url(#whiteGradient)" stroke="#5ba3d0" strokeWidth="4" rx="8" />
          
          {/* Title */}
          <text x="490" y="385" fontSize="8" fill="#5ba3d0" fontWeight="bold">Sistem Durumu</text>
          
          {/* Server Layer 1 */}
          <rect x="495" y="392" width="110" height="22" fill="#e0f2fe" stroke="#5ba3d0" strokeWidth="2" rx="3" />
          <text x="500" y="405" fontSize="7" fill="#2563a8" fontWeight="bold">API Server</text>
          <circle cx="510" cy="408" r="3" fill="#10b981" className="animate-blink" />
          <circle cx="520" cy="408" r="3" fill="#10b981" className="animate-blink delay-100" />
          <circle cx="530" cy="408" r="3" fill="#3b82f6" className="animate-blink delay-200" />
          <text x="580" y="405" fontSize="7" fill="#10b981" fontWeight="bold">99.9%</text>
          
          {/* Server Layer 2 */}
          <rect x="495" y="418" width="110" height="22" fill="#e0f2fe" stroke="#5ba3d0" strokeWidth="2" rx="3" />
          <text x="500" y="431" fontSize="7" fill="#2563a8" fontWeight="bold">Database</text>
          <circle cx="510" cy="434" r="3" fill="#10b981" className="animate-blink delay-100" />
          <circle cx="520" cy="434" r="3" fill="#3b82f6" className="animate-blink delay-200" />
          <circle cx="530" cy="434" r="3" fill="#10b981" className="animate-blink delay-300" />
          <rect x="575" y="428" width="25" height="8" fill="#10b981" opacity="0.2" rx="2" />
          <rect x="575" y="428" width="18" height="8" fill="#10b981" opacity="0.6" rx="2" />
          
          {/* Server Layer 3 */}
          <rect x="495" y="444" width="110" height="22" fill="#e0f2fe" stroke="#5ba3d0" strokeWidth="2" rx="3" />
          <text x="500" y="457" fontSize="7" fill="#2563a8" fontWeight="bold">Storage</text>
          <circle cx="510" cy="460" r="3" fill="#3b82f6" className="animate-blink delay-200" />
          <circle cx="520" cy="460" r="3" fill="#10b981" className="animate-blink delay-300" />
          <circle cx="530" cy="460" r="3" fill="#10b981" className="animate-blink" />
          <text x="575" y="457" fontSize="7" fill="#2563a8" fontWeight="bold">2.4 TB</text>
        </g>
      </svg>

      {/* CSS Animations */}
      <style jsx>{`
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
