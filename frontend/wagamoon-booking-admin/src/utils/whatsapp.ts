/**
 * Cleans phone number down to digits only for wa.me link.
 * Example: "+91 98765-43210" -> "919876543210"
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d]/g, '');
}

/**
 * Builds standard WhatsApp direct click-to-chat URL with pre-filled enquiry message.
 */
export function buildWhatsAppUrl(phone: string, propertyName: string): string {
  const digits = cleanPhoneNumber(phone);
  if (!digits) return '';
  const text = encodeURIComponent(`Hi, I'm interested in ${propertyName || 'this property'}.`);
  return `https://wa.me/${digits}?text=${text}`;
}

/**
 * Checks if a phone number is reasonably valid.
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const digits = cleanPhoneNumber(phone);
  return digits.length >= 7 && digits.length <= 15;
}
