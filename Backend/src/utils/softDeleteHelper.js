/**
 * @file softDeleteHelper.js
 * @description Soft delete utility functions - DRY helper for applying soft delete pattern across the application.
 * 
 * Soft Delete Pattern:
 * - Records are not physically deleted from the database
 * - Instead, a `deleted_at` timestamp is set to mark the record as deleted
 * - Queries must filter out soft-deleted records using `WHERE deleted_at IS NULL`
 * 
 * Benefits:
 * - Data integrity and audit trails preserved
 * - Ability to restore deleted records
 * - Referential integrity maintained
 * 
 * Usage:
 * - Use applySoftDeleteFilter() to automatically exclude soft-deleted records in queries
 * - Use softDelete() to perform soft delete operations
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

/**
 * Applies soft delete filter to a Knex query builder
 * Automatically adds `WHERE deleted_at IS NULL` condition to exclude soft-deleted records
 * 
 * @param {object} queryBuilder - Knex query builder instance
 * @param {string} [tableAlias] - Optional table alias (e.g., 'n' for notifications as 'n')
 * @returns {object} Modified query builder with soft delete filter applied
 * 
 * @example
 * // Without alias
 * const notifications = await applySoftDeleteFilter(
 *   db('notifications').where('user_id', userId)
 * );
 * 
 * @example
 * // With alias
 * const notifications = await applySoftDeleteFilter(
 *   db('notifications as n').where('n.user_id', userId),
 *   'n'
 * );
 */
const applySoftDeleteFilter = (queryBuilder, tableAlias = null) => {
  const column = tableAlias ? `${tableAlias}.deleted_at` : 'deleted_at';
  return queryBuilder.whereNull(column);
};

/**
 * Performs soft delete by updating deleted_at timestamp
 * Sets the deleted_at field to current timestamp instead of physically deleting the record
 * 
 * @param {object} trx - Knex transaction object (or db instance)
 * @param {string} tableName - Table name to perform soft delete on
 * @param {object} whereClause - WHERE conditions to identify records to soft delete
 * @returns {Promise<number>} Number of rows updated (soft deleted)
 * 
 * @example
 * // Soft delete a single notification
 * await db.transaction(async (trx) => {
 *   const deletedCount = await softDelete(trx, 'notifications', {
 *     id: notificationId,
 *     user_id: userId
 *   });
 * });
 * 
 * @example
 * // Soft delete multiple notifications
 * await db.transaction(async (trx) => {
 *   const deletedCount = await softDelete(trx, 'notifications', {
 *     user_id: userId,
 *     read_at: db.raw('IS NOT NULL')
 *   });
 * });
 */
const softDelete = async (trx, tableName, whereClause) => {
  return await trx(tableName)
    .where(whereClause)
    .whereNull('deleted_at')  // Don't update already soft-deleted records
    .update({ deleted_at: new Date() });
};

/**
 * Performs batch soft delete for multiple IDs
 * Convenience function for soft deleting multiple records by ID
 * 
 * @param {object} trx - Knex transaction object (or db instance)
 * @param {string} tableName - Table name to perform soft delete on
 * @param {number[]} ids - Array of record IDs to soft delete
 * @param {object} [additionalWhere] - Optional additional WHERE conditions (e.g., user_id check)
 * @returns {Promise<number>} Number of rows updated (soft deleted)
 * 
 * @example
 * // Soft delete multiple notifications by ID
 * await db.transaction(async (trx) => {
 *   const deletedCount = await batchSoftDelete(
 *     trx, 
 *     'notifications', 
 *     [1, 2, 3],
 *     { user_id: userId }  // Additional security check
 *   );
 * });
 */
const batchSoftDelete = async (trx, tableName, ids, additionalWhere = {}) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return 0;
  }

  const query = trx(tableName)
    .whereIn('id', ids)
    .whereNull('deleted_at');

  // Apply additional WHERE conditions if provided
  if (additionalWhere && Object.keys(additionalWhere).length > 0) {
    query.where(additionalWhere);
  }

  return await query.update({ deleted_at: new Date() });
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  applySoftDeleteFilter,
  softDelete,
  batchSoftDelete
};
