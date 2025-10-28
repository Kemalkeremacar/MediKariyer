/**
 * @file databaseTransport.js
 * @description Winston için custom MSSQL database transport
 * 
 * Bu transport, Winston loglarını logs.application_logs tablosuna yazar.
 * Async queue kullanarak performans optimize edilmiştir.
 * 
 * Özellikler:
 * - Batch insert (performans için)
 * - Error handling ve fallback
 * - Connection pool kullanımı
 * - Request correlation ID desteği
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

'use strict';

const Transport = require('winston-transport');

/**
 * MSSQL Database Transport for Winston
 * Winston loglarını database'e yazan custom transport
 */
class DatabaseTransport extends Transport {
  /**
   * @param {Object} opts - Transport options
   * @param {string} opts.level - Minimum log level (default: 'info')
   * @param {boolean} opts.silent - Silent mode (default: false)
   * @param {string} opts.category - Log category (default: 'application')
   * @param {number} opts.batchSize - Batch insert size (default: 10)
   * @param {number} opts.flushInterval - Flush interval in ms (default: 5000)
   */
  constructor(opts = {}) {
    super(opts);
    
    this.name = 'database';
    this.level = opts.level || 'info';
    this.category = opts.category || 'application';
    this.batchSize = opts.batchSize || 10;
    this.flushInterval = opts.flushInterval || 5000; // 5 saniye
    
    // Log queue for batch processing
    this.logQueue = [];
    this.isProcessing = false;
    
    // Periodic flush timer
    this.flushTimer = setInterval(() => {
      if (this.logQueue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }
  
  /**
   * Log method called by Winston
   * @param {Object} info - Log information object
   * @param {Function} callback - Callback function
   */
  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    
    // Queue'ya ekle
    this.logQueue.push({
      timestamp: new Date(),
      level: info.level,
      category: info.category || this.category,
      message: info.message || '',
      user_id: info.userId || info.user_id || null,
      request_id: info.requestId || info.request_id || null,
      ip_address: info.ipAddress || info.ip_address || null,
      user_agent: info.userAgent || info.user_agent || null,
      url: info.url || null,
      method: info.method || null,
      status_code: info.statusCode || info.status_code || null,
      duration_ms: info.duration || info.duration_ms || null,
      metadata: this.serializeMetadata(info),
      stack_trace: info.stack || info.stackTrace || null
    });
    
    // Batch size'a ulaştıysa flush et
    if (this.logQueue.length >= this.batchSize) {
      this.flush();
    }
    
    callback();
  }
  
  /**
   * Serialize metadata to JSON string
   * @param {Object} info - Log info object
   * @returns {string|null} - JSON string or null
   */
  serializeMetadata(info) {
    try {
      // Winston'un default field'larını çıkar
      const excluded = [
        'level', 'message', 'timestamp', 'category', 
        'userId', 'user_id', 'requestId', 'request_id',
        'ipAddress', 'ip_address', 'userAgent', 'user_agent',
        'url', 'method', 'statusCode', 'status_code',
        'duration', 'duration_ms', 'stack', 'stackTrace'
      ];
      
      const metadata = {};
      let hasData = false;
      
      for (const key in info) {
        if (!excluded.includes(key) && info[key] !== undefined) {
          metadata[key] = info[key];
          hasData = true;
        }
      }
      
      return hasData ? JSON.stringify(metadata) : null;
    } catch (error) {
      // Metadata serialization error - silent failure
      return null;
    }
  }
  
  /**
   * Get database connection (lazy load to avoid circular dependency)
   */
  getDb() {
    if (!this._db) {
      const { db } = require('../config/dbConfig');
      this._db = db;
    }
    return this._db;
  }

  /**
   * Flush log queue to database
   * Batch insert yapar
   */
  async flush() {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    const logsToInsert = [...this.logQueue];
    this.logQueue = [];
    
    try {
      // Batch insert
      const db = this.getDb();
      await db('logs.application_logs').insert(logsToInsert);
    } catch (error) {
      // Database error durumunda silent failure
      // Critical error ise logları geri queue'ya koy (maksimum 100 log)
      if (this.logQueue.length < 100) {
        this.logQueue.unshift(...logsToInsert.slice(0, 50)); // Sadece ilk 50'yi geri al
      }
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Close transport and flush remaining logs
   * Graceful shutdown için
   */
  async close() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Kalan logları flush et
    await this.flush();
    
    // Son bir kez daha kontrol et
    if (this.logQueue.length > 0) {
      await this.flush();
    }
  }
}

module.exports = DatabaseTransport;

