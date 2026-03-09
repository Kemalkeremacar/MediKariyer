/**
 * SearchContainer - Arama Konteyner Component'i
 * 
 * Log arama işlevselliği için özel tasarlanmış component.
 * Global state kullanarak React render döngüsünden bağımsız çalışır.
 * 
 * Özellikler:
 * - Tab bazında arama değeri saklama
 * - 400ms debounce ile performans optimizasyonu
 * - Global state ile persistence
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

// Global arama state'i - React render döngüsünden bağımsız
window.globalSearchState = {
  application: '',
  audit: '',
  security: ''
};

const SearchContainer = ({ onSearch, activeTab }) => {
  const [searchValue, setSearchValue] = useState(() => window.globalSearchState[activeTab] || '');
  const timeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Tab değiştiğinde global state'den değeri al
  useEffect(() => {
    const globalValue = window.globalSearchState[activeTab] || '';
    setSearchValue(globalValue);
  }, [activeTab]);

  // Input değişiklik handler'ı - debounce ile optimize edilmiş
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    // Global state'e kaydet (persistence için)
    window.globalSearchState[activeTab] = value;
    
    // Önceki timeout'u temizle
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 400ms debounce ile arama yap
    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, 400);
  };

  return (
    <div className="p-6 border-b border-gray-200">
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Tüm alanlarda ara (mesaj, kategori, kullanıcı...)..."
          value={searchValue}
          onChange={handleInputChange}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          autoComplete="off"
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default SearchContainer;