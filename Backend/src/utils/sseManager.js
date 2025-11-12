/**
 * @file sseManager.js
 * @description Server-Sent Events (SSE) yönetimi için utility
 * Kullanıcılara real-time bildirim göndermek için SSE bağlantılarını yönetir
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

const logger = require('./logger');

/**
 * SSE Client Manager
 * Her kullanıcı için SSE bağlantılarını yönetir
 */
class SSEManager {
  constructor() {
    // user_id -> Response array mapping
    // Bir kullanıcının birden fazla sekmesi olabilir
    this.clients = new Map();
  }

  /**
   * Kullanıcıya SSE bağlantısı ekle
   * @param {number} userId - Kullanıcı ID'si
   * @param {Object} res - Express response nesnesi
   */
  addClient(userId, res) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    
    this.clients.get(userId).push(res);
    logger.info(`SSE client eklendi - User ID: ${userId}, Toplam bağlantı: ${this.clients.get(userId).length}`);
    
    // Bağlantı kapandığında temizle
    res.on('close', () => {
      this.removeClient(userId, res);
    });
  }

  /**
   * Kullanıcıdan SSE bağlantısını kaldır
   * @param {number} userId - Kullanıcı ID'si
   * @param {Object} res - Express response nesnesi
   */
  removeClient(userId, res) {
    if (!this.clients.has(userId)) {
      return;
    }
    
    const userClients = this.clients.get(userId);
    const index = userClients.indexOf(res);
    
    if (index > -1) {
      userClients.splice(index, 1);
      logger.info(`SSE client kaldırıldı - User ID: ${userId}, Kalan bağlantı: ${userClients.length}`);
      
      // Eğer kullanıcının bağlantısı kalmadıysa Map'ten kaldır
      if (userClients.length === 0) {
        this.clients.delete(userId);
      }
    }
  }

  /**
   * Kullanıcıya bildirim gönder
   * @param {number} userId - Kullanıcı ID'si
   * @param {Object} notification - Bildirim objesi
   */
  sendToUser(userId, notification) {
    if (!this.clients.has(userId)) {
      return false; // Kullanıcı bağlı değil
    }
    
    const userClients = this.clients.get(userId);
    const data = JSON.stringify(notification);
    
    let sentCount = 0;
    const toRemove = [];
    
    userClients.forEach((res, index) => {
      try {
        res.write(`data: ${data}\n\n`);
        // Response'u flush et (browser'a hemen gönder)
        if (typeof res.flush === 'function') {
          res.flush();
        }
        sentCount++;
      } catch (error) {
        logger.warn(`SSE gönderim hatası - User ID: ${userId}, Index: ${index}`, error);
        toRemove.push(res);
      }
    });
    
    // Hatalı bağlantıları temizle
    toRemove.forEach(res => {
      this.removeClient(userId, res);
    });
    
    if (sentCount > 0) {
      logger.debug(`SSE bildirim gönderildi - User ID: ${userId}, Gönderilen: ${sentCount}/${userClients.length}`);
    }
    
    return sentCount > 0;
  }

  /**
   * Tüm bağlı kullanıcılara bildirim gönder
   * @param {Object} notification - Bildirim objesi
   */
  broadcast(notification) {
    let totalSent = 0;
    
    this.clients.forEach((userClients, userId) => {
      if (this.sendToUser(userId, notification)) {
        totalSent++;
      }
    });
    
    logger.debug(`SSE broadcast - Toplam gönderilen: ${totalSent}`);
    return totalSent;
  }

  /**
   * Kullanıcının bağlı olup olmadığını kontrol et
   * @param {number} userId - Kullanıcı ID'si
   * @returns {boolean}
   */
  isUserConnected(userId) {
    return this.clients.has(userId) && this.clients.get(userId).length > 0;
  }

  /**
   * Toplam bağlı kullanıcı sayısını getir
   * @returns {number}
   */
  getConnectedUserCount() {
    return this.clients.size;
  }

  /**
   * Toplam bağlantı sayısını getir (birden fazla sekme olabilir)
   * @returns {number}
   */
  getTotalConnectionCount() {
    let total = 0;
    this.clients.forEach(userClients => {
      total += userClients.length;
    });
    return total;
  }
}

// Singleton instance
const sseManager = new SSEManager();

module.exports = sseManager;

