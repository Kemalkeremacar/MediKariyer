/**
 * Title Formatting Utility
 * Ünvanların sonuna nokta ekler (Dr → Dr., Uz.Dr → Uz.Dr., vb.)
 */

/**
 * Ünvanın sonuna nokta ekler (eğer yoksa)
 * @param title - Formatlanacak ünvan (örn: "Dr", "Uz.Dr", "Prof.Dr")
 * @returns Formatlanmış ünvan (örn: "Dr.", "Uz.Dr.", "Prof.Dr.")
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
 * @param title - Ünvan (örn: "Dr", "Uz.Dr")
 * @param firstName - İsim
 * @param lastName - Soyisim
 * @returns Formatlanmış tam isim (örn: "Dr. Ahmet Yılmaz")
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

