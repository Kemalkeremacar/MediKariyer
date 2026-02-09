/**
 * @file Footer.jsx
 * @description Footer Bileşeni - Modern ve responsive footer
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { ROUTE_CONFIG } from '@config/routes.js';
import { APP_CONFIG } from '@config/app.js';
import logoImage from '../../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    kurumsal: [
      { text: 'Hakkımızda', to: '/#about' },
      { text: 'İletişim', to: '/#contact' },
      { text: 'Gizlilik Politikası', to: ROUTE_CONFIG.PUBLIC.PRIVACY_POLICY },
      { text: 'Kullanım Koşulları', to: ROUTE_CONFIG.PUBLIC.TERMS_OF_SERVICE },
    ],
    hizmetler: [
      { text: 'Doktorlar İçin', to: ROUTE_CONFIG.PUBLIC.REGISTER },
      { text: 'Hastaneler İçin', to: ROUTE_CONFIG.PUBLIC.REGISTER },
      { text: 'Yardım Merkezi', to: ROUTE_CONFIG.PUBLIC.HELP_CENTER },
    ],
    destek: [
      { text: 'Yardım Merkezi', to: ROUTE_CONFIG.PUBLIC.HELP_CENTER },
      { text: 'İletişim', to: '/#contact' },
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
    <footer className="bg-[#2c3e50] text-gray-300">
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
            <h3 className="text-white font-semibold mb-4 text-base border-b-2 border-blue-500 pb-2 inline-block">Kurumsal</h3>
            <ul className="space-y-2 mt-4">
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
            <h3 className="text-white font-semibold mb-4 text-base border-b-2 border-blue-500 pb-2 inline-block">Hizmetler</h3>
            <ul className="space-y-2 mt-4">
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
            <h3 className="text-white font-semibold mb-4 text-base border-b-2 border-blue-500 pb-2 inline-block">Destek</h3>
            <ul className="space-y-2 mt-4">
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
      <div className="border-t border-gray-700 bg-[#1a252f]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            {/* Test Notice */}
            <div className="text-xs sm:text-sm text-gray-400 order-2 md:order-1">
              "TEST YAYINIDIR" "İŞKUR istihdam ofisi başvuru süreci devam etmektedir."
            </div>

            {/* Copyright */}
            <div className="text-xs sm:text-sm text-gray-400 order-1 md:order-2">
              Copyright © {currentYear} by <span className="lowercase font-semibold">{APP_CONFIG.APP_NAME.toLowerCase()}</span>.
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 order-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-blue-600 flex items-center justify-center transition-all duration-300"
                  >
                    <Icon className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
