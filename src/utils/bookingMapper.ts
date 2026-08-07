import { Booking } from '../types';

/**
 * Maps raw backend booking document to client Booking type
 */
export const mapServerBookingToClient = (
  savedDoc: any,
  fallbackUserPhone?: string,
  fallbackUserEmail?: string,
  fallbackAvatar?: string
): Booking => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  return {
    id: savedDoc.bookingId || savedDoc._id || `bk-${Date.now()}`,
    name: savedDoc.name || 'Customer',
    phone: savedDoc.phone || '',
    email: savedDoc.email || '',
    userPhone: fallbackUserPhone || savedDoc.phone || '',
    userEmail: fallbackUserEmail || savedDoc.email || '',
    serviceType: savedDoc.serviceType || 'culinary',
    serviceDetail: savedDoc.serviceDetail || 'Home Chef Service',
    date: savedDoc.date || todayStr,
    time: savedDoc.time || '19:00',
    notes: savedDoc.notes || '',
    status: savedDoc.status || 'Confirmed',
    utrNumber: savedDoc.utrNumber || '',
    createdAt: savedDoc.createdAt ? String(savedDoc.createdAt).split('T')[0] : todayStr,
    avatarImg: fallbackAvatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=100&auto=format&fit=crop',
  };
};
