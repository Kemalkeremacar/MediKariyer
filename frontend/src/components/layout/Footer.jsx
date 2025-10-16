import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTE_CONFIG } from '@config/routes.js';
import { APP_CONFIG } from '@config/app.js';
import { FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-4">
        {/* Ana Footer İçeriği */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          {/* Logo ve Açıklama */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="text-base font-bold text-white">
                {APP_CONFIG.APP_NAME}
              </span>
            </div>
            <p className="text-white/80 leading-relaxed mb-2 text-xs">
              Sağlık sektöründe kariyerinizi şekillendiren platform.
            </p>
            <div className="flex space-x-2">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                 className="w-6 h-6 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors duration-300">
                <FiTwitter className="w-3 h-3" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" 
                 className="w-6 h-6 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300">
                <FiLinkedin className="w-3 h-3" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                 className="w-6 h-6 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-cyan-500 transition-colors duration-300">
                <FiInstagram className="w-3 h-3" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                 className="w-6 h-6 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-300">
                <FiFacebook className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-sm font-bold mb-2 text-white">Hızlı Linkler</h3>
            <ul className="space-y-1">
              <li>
                <Link to={ROUTE_CONFIG.PUBLIC.HOME} className="text-white/80 hover:text-blue-300 transition-colors duration-300 text-sm">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to={ROUTE_CONFIG.PUBLIC.ABOUT} className="text-white/80 hover:text-blue-300 transition-colors duration-300 text-sm">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link to={ROUTE_CONFIG.PUBLIC.CONTACT} className="text-white/80 hover:text-blue-300 transition-colors duration-300 text-sm">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim Bilgileri */}
          <div>
            <h3 className="text-sm font-bold mb-2 text-white">İletişim</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-3">
                <FiMapPin className="w-4 h-4 text-cyan-300 mt-1 flex-shrink-0" />
                <span className="text-white/80 text-xs">
                  Atatürk Mah. Turgut Özal Bulv. Gardenya 1 Plaza<br />
                  İş Merkezi, D:42/B Kat:5 Ataşehir-İstanbul
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                <span className="text-white/80 text-xs">+90 212 227 80 20</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                <span className="text-white/80 text-xs">info@monassist.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Çizgi */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-xs mb-1 md:mb-0">
              &copy; {currentYear} {APP_CONFIG.APP_NAME}. Tüm hakları saklıdır.
            </p>
            <p className="text-white/60 text-xs">
              Türkiye'nin en güvenilir sağlık kariyer platformu
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
