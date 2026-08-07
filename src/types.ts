export interface UserAddress {
  _id?: string;
  id?: string;
  title: 'Home' | 'Work' | 'Other';
  flatNo?: string;
  addressLine: string;
  landmark?: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface NotificationItem {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'refund' | 'otp' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ReviewItem {
  _id?: string;
  id?: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  dishId?: string;
  dishName?: string;
  chefId?: string;
  rating: number;
  comment: string;
  isVerifiedCustomer: boolean;
  createdAt: string;
}

export interface UserProfile {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  location?: string;
  role?: 'admin' | 'user';
  totalBookings?: string | number;
  memberSince?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  wishlist?: string[];
  addresses?: UserAddress[];
  notifications?: NotificationItem[];
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  createdAt: string;
}

export interface Recipe {
  id: number;
  name: string;
  time: string;
  cuisine: string;
  category: string;
  img: string;
  price?: string;
  rating?: number;
  description?: string;
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  email?: string;
  userPhone?: string;
  userEmail?: string;
  serviceType: string;
  serviceDetail: string;
  date: string;
  time: string;
  notes?: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Payment Pending' | 'Payment Verification Pending' | 'Payment Failed';
  utrNumber?: string;
  createdAt: string;
  avatarImg?: string;
}

export interface Professional {
  id: number;
  name: string;
  role: string;
  exp: string;
  rating: number;
  img: string;
  searchData: string;
}

export interface HomeService {
  id: number;
  title: string;
  badge?: string;
  img: string;
  description: string;
  features: string[];
  price: string;
  searchData: string;
}

export interface SpecialMoment {
  id: number;
  title: string;
  subtitle: string;
  badge?: string;
  img: string;
  buttonText?: string;
  gridClass: string;
  searchData: string;
}

export interface ComboPackage {
  id: number;
  title: string;
  price: string;
  originalPrice: string;
  discount: string;
  badge?: string;
  isPopular?: boolean;
  img: string;
  features: string[];
  searchData: string;
}
