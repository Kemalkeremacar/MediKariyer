/**
 * @file formatTitle.ts
 * @description Ünvan formatlama utility fonksiyonları
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - Ünvanların sonuna nokta ekleme (Dr → Dr., Uz.Dr → Uz.Dr.)
 * - Tam isim formatlama (ünvan + isim + soyisim)
 */

// ============================================================================
// TITLE FORMATTING
// ============================================================================

/**
 * Ünvanın sonuna nokta ekler (eğer yoksa)
 * 
 * @param title - Formatlanacak ünvan (örn: "Dr", "Uz.Dr", "Prof.Dr")
 * @returns Formatlanmış ünvan (örn: "Dr.", "Uz.Dr.", "Prof.Dr.")
 * 
 * @example
 * ```typescript
 * formatTitle("Dr")        // "Dr."
 * formatTitle("Uz.Dr")     // "Uz.Dr."
 * formatTitle("Prof.Dr.")  // "Prof.Dr." (zaten nokta var)
 * ```
 */
export const formatTitle = (title: string | null | undefined): string => {
  if (!title) return '';
  
  // Eğer zaten sonunda nokta varsa, değiştirme
  if (title.endsWith('.')) {
    return title;
  }
  
  // "Dr" ile bitiyorsa nokta ekle
  if (title.endsWith('Dr')) {
    return `${title}.`;
  }
  
  // Diğer durumlarda olduğu gibi döndür
  return title;
};

/**
 * Ünvan + İsim + Soyisim formatında tam isim oluşturur
 * 
 * @param title - Ünvan (örn: "Dr", "Uz.Dr")
 * @param firstName - İsim
 * @param lastName - Soyisim
 * @returns Formatlanmış tam isim (örn: "Dr. Ahmet Yılmaz")
 * 
 * @example
 * ```typescript
 * formatFullName("Dr", "Ahmet", "Yılmaz")           // "Dr. Ahmet Yılmaz"
 * formatFullName("Uz.Dr", "Ayşe", "Demir")          // "Uz.Dr. Ayşe Demir"
 * formatFullName(null, "Mehmet", "Kaya")            // "Mehmet Kaya"
 * formatFullName(null, null, null)                  // "Kullanıcı"
 * ```
 */
export const formatFullName = (
  title: string | null | undefined,
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string => {
  const formattedTitle = formatTitle(title);
  const parts = [formattedTitle, firstName, lastName].filter(Boolean);
  return parts.join(' ').trim() || 'Kullanıcı';
};
