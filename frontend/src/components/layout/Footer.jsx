/**
 * @file Footer.jsx
 * @description Footer Bileşeni - Modern ve responsive footer
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { ROUTE_CONFIG } from '@config/routes.js';
import { APP_CONFIG } from '@config/app.js';
import logoImage from '../../assets/logo.jpg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    kurumsal: [
      { text: 'Hakkımızda', to: ROUTE_CONFIG.PUBLIC.ABOUT },
      { text: 'İletişim', to: ROUTE_CONFIG.PUBLIC.CONTACT },
      { text: 'Gizlilik Politikası', to: '#' },
      { text: 'Kullanım Şartları', to: '#' },
    ],
    hizmetler: [
      { text: 'Doktorlar İçin', to: ROUTE_CONFIG.PUBLIC.REGISTER },
      { text: 'Hastaneler İçin', to: ROUTE_CONFIG.PUBLIC.REGISTER },
      { text: 'İş İlanları', to: '#' },
      { text: 'Kariyer Fırsatları', to: '#' },
    ],
    destek: [
      { text: 'SSS', to: '#' },
      { text: 'Yardım Merkezi', to: '#' },
      { text: 'İletişim', to: ROUTE_CONFIG.PUBLIC.CONTACT },
      { text: 'Geri Bildirim', to: '#' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: APP_CONFIG.SOCIAL_LINKS.FACEBOOK, label: 'Facebook' },
    { icon: Twitter, href: APP_CONFIG.SOCIAL_LINKS.TWITTER, label: 'Twitter' },
    { icon: Instagram, href: APP_CONFIG.SOCIAL_LINKS.INSTAGRAM, label: 'Instagram' },
    { icon: Linkedin, href: APP_CONFIG.SOCIAL_LINKS.LINKEDIN, label: 'LinkedIn' },
    { icon: Youtube, href: APP_CONFIG.SOCIAL_LINKS.YOUTUBE, label: 'YouTube' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                <img 
                  src={logoImage} 
                  alt="MediKariyer Logo" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <span className="text-2xl font-black lowercase text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {APP_CONFIG.APP_NAME.toLowerCase()}
              </span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
              {APP_CONFIG.APP_DESCRIPTION}. {APP_CONFIG.APP_TAGLINE}.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  {APP_CONFIG.CONTACT_INFO.ADDRESS}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a href={`tel:${APP_CONFIG.CONTACT_INFO.PHONE.replace(/\s/g, '')}`} className="text-gray-400 hover:text-white transition-colors">
                  {APP_CONFIG.CONTACT_INFO.PHONE_DISPLAY}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a href={`mailto:${APP_CONFIG.CONTACT_INFO.EMAIL}`} className="text-gray-400 hover:text-white transition-colors">
                  {APP_CONFIG.CONTACT_INFO.EMAIL}
                </a>
              </div>
            </div>
          </div>

          {/* Kurumsal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Kurumsal</h3>
            <ul className="space-y-2">
              {footerLinks.kurumsal.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hizmetler Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Hizmetler</h3>
            <ul className="space-y-2">
              {footerLinks.hizmetler.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destek Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Destek</h3>
            <ul className="space-y-2">
              {footerLinks.destek.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {currentYear} <span className="lowercase font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{APP_CONFIG.APP_NAME.toLowerCase()}</span>. Tüm hakları saklıdır.
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="group w-9 h-9 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </a>
                );
              })}
            </div>

            {/* Additional Links */}
            <div className="flex items-center gap-4 text-sm">
              <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                Gizlilik
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                Çerezler
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                Şartlar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
