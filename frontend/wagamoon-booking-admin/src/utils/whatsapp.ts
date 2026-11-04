/**
 * WhatsApp Integration Utilities
 * 
 * Instead of hardcoding click-to-chat text in the frontend, messages containing
 * direct product links are generated on the backend, and re-routed directly to WhatsApp.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://wagamoonbooking.onrender.com/api').replace(/\/+$/, '');

/**
 * Cleans phone number down to digits only for wa.me link.
 * Example: "+91 98765-43210" -> "919876543210"
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d]/g, '');
}

/**
 * Checks if a phone number is reasonably valid.
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const digits = cleanPhoneNumber(phone);
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Returns the backend WhatsApp re-route URL for a property.
 * When visited, the backend generates the enquiry message with the product link
 * and issues an HTTP 302 redirect directly to WhatsApp.
 */
export function getPropertyWhatsAppUrl(propertyId: string): string {
  if (!propertyId) return '';
  return `${API_BASE_URL}/public/properties/${propertyId}/whatsapp`;
}

/**
 * Returns the backend WhatsApp re-route URL for an adventure activity.
 */
export function getActivityWhatsAppUrl(activityId: string): string {
  if (!activityId) return '';
  return `${API_BASE_URL}/public/activities/${activityId}/whatsapp`;
}

/**
 * Builds the WhatsApp re-route URL. If a property ID is provided, it uses the
 * direct backend product re-route route. Otherwise it uses the fallback redirect route.
 */
export function buildWhatsAppUrl(phone: string, propertyName?: string, propertyId?: string): string {
  if (propertyId) {
    return getPropertyWhatsAppUrl(propertyId);
  }

  const digits = cleanPhoneNumber(phone);
  if (!digits) return '';

  const params = new URLSearchParams();
  params.set('phone', digits);
  if (propertyName) {
    params.set('name', propertyName);
  }

  return `${API_BASE_URL}/public/properties/whatsapp/redirect?${params.toString()}`;
}
