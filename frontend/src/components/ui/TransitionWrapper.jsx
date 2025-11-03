/**
 * @file TransitionWrapper.jsx
 * @description Transition Wrapper Bileşeni - Framer Motion ile animasyon yönetimi
 * 
 * Bu bileşen, uygulama genelinde kullanılan sayfa geçişleri ve animasyonlar için
 * merkezi bir wrapper sağlar. Framer Motion kütüphanesi kullanılarak smooth
 * animasyonlar ve geçişler sağlar.
 * 
 * Ana Özellikler:
 * - Sayfa geçiş animasyonları: Fade, slide, scale, page
 * - Staggered animasyonlar: Sıralı element animasyonları
 * - AnimatePresence desteği: Mount/unmount animasyonları
 * - Kart animasyonları: Hover efektleri ile kart animasyonları
 * - Liste animasyonları: Liste öğeleri için sıralı animasyonlar
 * - Özelleştirilebilir: Delay, duration, easing ayarları
 * - Performans optimizasyonu: GPU hızlandırmalı animasyonlar
 * 
 * Animasyon Tipleri:
 * - page: Sayfa geçiş animasyonu (fade + slide + scale)
 * - fade: Sadece opacity animasyonu
 * - slide: X ekseninde kaydırma animasyonu
 * - scale: Ölçeklendirme animasyonu
 * 
 * Bileşenler:
 * 1. TransitionWrapper: Ana wrapper bileşeni
 * 2. StaggeredAnimation: Sıralı animasyon wrapper'ı
 * 3. AnimatedPage: Sayfa için AnimatePresence wrapper'ı
 * 4. AnimatedCard: Kart için animasyon wrapper'ı
 * 5. AnimatedList: Liste için animasyon wrapper'ı
 * 
 * Kullanım Örnekleri:
 * ```jsx
 * // Sayfa geçişi
 * <TransitionWrapper variant="page">
 *   <PageContent />
 * </TransitionWrapper>
 * 
 * // Sıralı animasyon
 * <StaggeredAnimation staggerDelay={0.1}>
 *   {items.map(item => <Item key={item.id} />)}
 * </StaggeredAnimation>
 * ```
 * 
 * Teknik Detaylar:
 * - Framer Motion variants kullanımı
 * - React key prop ile animasyon kontrolü
 * - requestAnimationFrame optimizasyonu
 * - CSS transform kullanımı (GPU hızlandırma)
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// ANIMATION VARIANTS - Animasyon varyant tanımlamaları
// ============================================================================

/**
 * Sayfa geçiş animasyon varyantları
 * Fade, slide ve scale kombinasyonu
 */
const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: -20,
    scale: 0.98
  }
};

/**
 * Sayfa geçiş animasyon ayarları
 */
const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

/**
 * ============================================================================
 * STAGGERED ANIMATION VARIANTS - Sıralı animasyon varyantları
 * ============================================================================
 * 
 * Liste öğeleri için sıralı animasyon (stagger children)
 */
export const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

/**
 * Liste öğesi animasyon varyantları
 * Her öğe için fade-in ve slide-up animasyonu
 */
export const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

/**
 * ============================================================================
 * TRANSITION WRAPPER - Ana animasyon wrapper bileşeni
 * ============================================================================
 * 
 * Sayfa ve içerik geçişleri için kullanılan ana wrapper bileşeni
 * 
 * Parametreler:
 * @param {ReactNode} children - Animasyonlu gösterilecek içerik
 * @param {string} className - Ek CSS sınıfları
 * @param {string} variant - Animasyon tipi (page, fade, slide, scale)
 * @param {number} delay - Animasyon gecikmesi (saniye)
 */
const TransitionWrapper = ({ 
  children, 
  className = '', 
  variant = 'page',
  delay = 0 
}) => {
  const getVariants = () => {
    switch (variant) {
      case 'page':
        return pageVariants;
      case 'fade':
        return {
          initial: { opacity: 0 },
          in: { opacity: 1 },
          out: { opacity: 0 }
        };
      case 'slide':
        return {
          initial: { opacity: 0, x: 50 },
          in: { opacity: 1, x: 0 },
          out: { opacity: 0, x: -50 }
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.8 },
          in: { opacity: 1, scale: 1 },
          out: { opacity: 0, scale: 0.8 }
        };
      default:
        return pageVariants;
    }
  };

  const getTransition = () => {
    return {
      ...pageTransition,
      delay: delay
    };
  };

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="in"
      exit="out"
      variants={getVariants()}
      transition={getTransition()}
    >
      {children}
    </motion.div>
  );
};

/**
 * ============================================================================
 * STAGGERED ANIMATION - Sıralı animasyon wrapper bileşeni
 * ============================================================================
 * 
 * Çocuk öğeleri sırayla animasyonlu gösteren wrapper
 * 
 * Parametreler:
 * @param {ReactNode} children - Sıralı animasyonlu gösterilecek öğeler
 * @param {string} className - Ek CSS sınıfları
 * @param {number} staggerDelay - Öğeler arası animasyon gecikmesi (saniye)
 */
export const StaggeredAnimation = ({ 
  children, 
  className = '',
  staggerDelay = 0.1 
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

/**
 * ============================================================================
 * ANIMATED PAGE - Sayfa için AnimatePresence wrapper
 * ============================================================================
 * 
 * React Router sayfa geçişleri için AnimatePresence kullanan wrapper
 * Sayfa değişikliklerinde mount/unmount animasyonları sağlar
 * 
 * Parametreler:
 * @param {ReactNode} children - Animasyonlu gösterilecek sayfa içeriği
 * @param {string} key - Sayfa değişikliğini tetikleyen unique key
 */
export const AnimatedPage = ({ children, key }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * ============================================================================
 * ANIMATED CARD - Kart için animasyon wrapper bileşeni
 * ============================================================================
 * 
 * Kart bileşenleri için fade-in ve hover efektleri sağlar
 * 
 * Parametreler:
 * @param {ReactNode} children - Animasyonlu gösterilecek kart içeriği
 * @param {string} className - Ek CSS sınıfları
 * @param {boolean} hover - Hover animasyonu aktif (varsayılan: true)
 * @param {number} delay - Animasyon gecikmesi (saniye)
 */
export const AnimatedCard = ({ 
  children, 
  className = '',
  hover = true,
  delay = 0 
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: delay,
        ease: 'easeOut'
      }}
      whileHover={hover ? { 
        y: -5, 
        transition: { duration: 0.2 } 
      } : {}}
    >
      {children}
    </motion.div>
  );
};

/**
 * ============================================================================
 * ANIMATED LIST - Liste için animasyon wrapper bileşeni
 * ============================================================================
 * 
 * Liste öğeleri için sıralı animasyon sağlar
 * 
 * Parametreler:
 * @param {ReactNode} children - Sıralı animasyonlu gösterilecek liste öğeleri
 * @param {string} className - Ek CSS sınıfları
 * @param {number} staggerDelay - Öğeler arası animasyon gecikmesi (saniye)
 */
export const AnimatedList = ({ 
  children, 
  className = '',
  staggerDelay = 0.1 
}) => {
  return (
    <motion.div
      className={className}
      variants={staggerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TransitionWrapper;
