/**
 * @file mobileDoctorService.js
 * @description Mobile doctor servisi - Mobil uygulama için doktor profil ve dashboard işlemlerini yönetir.
 * Bu servis, mobileDoctorController tarafından kullanılan temel doktor işlemlerini içerir.
 * 
 * Ana İşlevler:
 * - Dashboard verileri (özet bilgiler, istatistikler)
 * - Doktor profil bilgileri (minimal)
 * 
 * Veritabanı Tabloları:
 * - doctor_profiles: Doktor profil bilgileri
 * - notifications: Bildirimler
 * - applications: Başvurular
 * - jobs: İş ilanları
 * - specialties: Branşlar
 * - subspecialties: Yan dallar
 * - cities: Şehirler
 * 
 * Özellikler:
 * - Minimal payload (mobile optimized)
 * - Transformer kullanımı
 * - Profil tamamlanma yüzdesi hesaplama
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const db = require('../../config/dbConfig').db;
const { AppError } = require('../../utils/errorHandler');
const jobTransformer = require('../../mobile/transformers/jobTransformer');
const applicationTransformer = require('../../mobile/transformers/applicationTransformer');
const profileTransformer = require('../../mobile/transformers/profileTransformer');

const parseCount = (row) => {
  if (!row) return 0;
  const value = row.count ?? row[''] ?? Object.values(row)[0];
  return Number(value) || 0;
};

const calculateCompletion = (profile) => {
  if (!profile) return 0;

  const fields = [
    profile.first_name,
    profile.last_name,
    profile.title,
    profile.specialty_id,
    profile.phone,
    profile.profile_photo,
    profile.residence_city_id
  ];

  const filled = fields.filter((field) => field !== null && field !== undefined && `${field}`.trim() !== '').length;
  const percentage = Math.round((filled / fields.length) * 100);

  return Number.isNaN(percentage) ? 0 : percentage;
};

const getDoctorProfile = async (userId) => {
  const profile = await db('doctor_profiles as dp')
    .leftJoin('specialties as s', 'dp.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'dp.subspecialty_id', 'ss.id')
    .leftJoin('cities as c', 'dp.residence_city_id', 'c.id')
    .select(
      'dp.*',
      's.name as specialty_name',
      'ss.name as subspecialty_name',
      'c.name as residence_city_name'
    )
    .where('dp.user_id', userId)
    .first();

  if (!profile) {
    throw new AppError('Doktor profili bulunamadı', 404);
  }

  profile.completion_percent = calculateCompletion(profile);

  return profile;
};

const getDashboard = async (userId) => {
  const profile = await getDoctorProfile(userId);

  const unreadQuery = await db('notifications')
    .where({ user_id: userId })
    .whereNull('read_at')
    .count({ count: '*' })
    .first();

  const applications = await db('applications as a')
    .distinct('a.id', 'a.job_id', 'a.applied_at', 'a.updated_at')
    .leftJoin('jobs as j', 'j.id', 'a.job_id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('application_statuses as st', 'st.id', 'a.status_id')
    .select(
      'a.id',
      'a.job_id',
      'a.applied_at as created_at', // SQL'de applied_at var, created_at yok
      'a.updated_at',
      'j.title as job_title',
      'hp.institution_name as hospital_name',
      'st.name as status_label'
    )
    .where('a.doctor_profile_id', profile.id)
    .whereNull('a.deleted_at')
    .orderBy('a.applied_at', 'desc') // SQL'de applied_at var, created_at yok
    .orderBy('a.id', 'desc') // SQL Server için unique sıralama
    .limit(5);

  const recommendedJobs = await db('jobs as j')
    .distinct('j.id', 'j.title', 'j.created_at', 'j.employment_type')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('applications as a', function joinApplications() {
      this.on('a.job_id', '=', 'j.id')
        .andOn('a.doctor_profile_id', '=', db.raw('?', [profile.id]))
        .andOnNull('a.deleted_at');
    })
    .select(
      'j.id',
      'j.title',
      'j.created_at',
      'j.employment_type', // SQL'de work_type yok, employment_type var
      'c.name as city_name',
      's.name as specialty_name',
      'hp.institution_name as hospital_name',
      'a.id as application_id'
    )
    .whereNull('j.deleted_at')
    .orderBy('j.created_at', 'desc')
    .orderBy('j.id', 'desc') // SQL Server için unique sıralama
    .limit(5);

  return {
    stats: {
      unread_notifications_count: parseCount(unreadQuery),
      active_applications_count: applications.length,
      recommended_jobs_count: recommendedJobs.length,
      profile_completion_percent: profile.completion_percent
    },
    recent_applications: applications.map(applicationTransformer.toListItem),
    recommended_jobs: recommendedJobs.map((job) => jobTransformer.toListItem({
      ...job,
      is_applied: Boolean(job.application_id)
    }))
  };
};

const getProfile = async (userId) => {
  const profile = await getDoctorProfile(userId);
  return profileTransformer.toMobileProfile(profile);
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  getDashboard,
  getProfile,
  getDoctorProfile
};

