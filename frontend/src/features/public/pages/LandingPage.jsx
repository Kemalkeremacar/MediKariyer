/**
 * LandingPage - Tek sayfa scroll yapısı
 * Home, About ve Contact bölümlerini içerir
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTE_CONFIG } from '@config/routes.js';

// Section components
import HomeSection from '../components/sections/HomeSection';
import AboutSection from '../components/sections/AboutSection';
import ContactSection from '../components/sections/ContactSection';

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  // Eğer kullanıcı giriş yapmışsa, rolüne göre dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          navigate(ROUTE_CONFIG.ADMIN.DASHBOARD, { replace: true });
          break;
        case 'doctor':
          navigate(ROUTE_CONFIG.DOCTOR.DASHBOARD, { replace: true });
          break;
        case 'hospital':
          navigate(ROUTE_CONFIG.HOSPITAL.DASHBOARD, { replace: true });
          break;
        default:
          navigate(ROUTE_CONFIG.PUBLIC.LOGIN, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Hash değişikliklerini dinle ve ilgili section'a scroll yap
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="w-full overflow-x-hidden pt-20">
      {/* Home Section */}
      <section id="home" className="scroll-mt-20">
        <HomeSection />
      </section>

      {/* About Section - scroll-mt-20 = 80px (header yüksekliği) */}
      <section id="about" className="scroll-mt-20">
        <AboutSection />
      </section>

      {/* Contact Section - scroll-mt-20 = 80px (header yüksekliği) */}
      <section id="contact" className="scroll-mt-20">
        <ContactSection />
      </section>
    </div>
  );
};

export default LandingPage;
