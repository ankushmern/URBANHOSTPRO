import mongoose from 'mongoose';
import { User } from '../models/User';
import { Dish } from '../models/Dish';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { Review } from '../models/Review';
import { Inquiry } from '../models/Inquiry';
import { AuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

export async function seedDatabaseFull(): Promise<void> {
  logger.info('Seeding database with optimized production schemas...');

  // 1. Seed Admin & Test Users
  const adminExists = await User.findOne({ phone: '9999999999' });
  let adminId = adminExists?._id;

  if (!adminExists) {
    const newAdmin = await User.create({
      name: 'Chef Mantra Admin',
      phone: '9999999999',
      email: 'admin@cookmantra.com',
      password: 'AdminPassword123!',
      role: 'admin',
      status: 'active',
      isPhoneVerified: true,
      isEmailVerified: true,
      isDeleted: false,
    });
    adminId = newAdmin._id;
  }

  const sampleUserPhone = '9876543210';
  let sampleUser = await User.findOne({ phone: sampleUserPhone });
  if (!sampleUser) {
    sampleUser = await User.create({
      name: 'Ankush Rajput',
      phone: sampleUserPhone,
      email: 'aankushrajput672@gmail.com',
      password: 'UserPassword123!',
      role: 'user',
      status: 'active',
      isPhoneVerified: true,
      isEmailVerified: true,
      isDeleted: false,
      addresses: [
        {
          title: 'Home',
          flatNo: 'A-402, Green Acres',
          addressLine: 'Palm Beach Road, Sanpada',
          city: 'Navi Mumbai',
          pincode: '400705',
          isDefault: true,
        },
      ],
    });
  }

  // 2. Seed Dishes
  const dishesData = [
    {
      dishId: 'DISH-101',
      title: 'Paneer Butter Masala & Garlic Naan Combo',
      category: 'North Indian',
      price: 349,
      originalPrice: 449,
      rating: 4.9,
      reviewsCount: 128,
      prepTime: '35 mins',
      serves: '2 Persons',
      description: 'Cottage cheese cubes simmered in rich tomato gravy served with freshly baked butter garlic naans.',
      ingredients: ['Paneer', 'Butter', 'Cream', 'Tomatoes', 'Garlic', 'Wheat Flour'],
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80',
      isVeg: true,
      isPopular: true,
      isDeleted: false,
    },
    {
      dishId: 'DISH-102',
      title: 'Hyderabadi Dum Biryani',
      category: 'Popular',
      price: 399,
      originalPrice: 499,
      rating: 4.8,
      reviewsCount: 210,
      prepTime: '45 mins',
      serves: '2-3 Persons',
      description: 'Slow-cooked aromatic basmati rice layered with marinated spices, fried onions, and saffron.',
      ingredients: ['Basmati Rice', 'Saffron', 'Whole Spices', 'Mint', 'Ghee'],
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
      isVeg: true,
      isPopular: true,
      isDeleted: false,
    },
    {
      dishId: 'DISH-103',
      title: 'Classic Masala Dosa with Sambhar',
      category: 'South Indian',
      price: 189,
      originalPrice: 249,
      rating: 4.7,
      reviewsCount: 95,
      prepTime: '20 mins',
      serves: '1 Person',
      description: 'Crispy fermented crepe stuffed with spiced potato filling, served with coconut chutney.',
      ingredients: ['Rice Flour', 'Urad Dal', 'Potatoes', 'Mustard Seeds', 'Coconut'],
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80',
      isVeg: true,
      isPopular: false,
      isDeleted: false,
    },
  ];

  for (const dish of dishesData) {
    await Dish.findOneAndUpdate({ dishId: dish.dishId }, dish, { upsert: true, returnDocument: 'after' });
  }

  // 3. Seed Booking
  const bookingId = 'CM-88201';
  let existingBooking = await Booking.findOne({ bookingId });
  if (!existingBooking) {
    existingBooking = await Booking.create({
      bookingId,
      userId: sampleUser._id,
      name: sampleUser.name,
      phone: sampleUser.phone,
      email: sampleUser.email,
      serviceType: 'culinary',
      serviceDetail: 'Private Chef for Dinner Party (3 Courses)',
      quantity: 4,
      date: '2026-08-05',
      time: '07:30 PM',
      notes: 'Less spicy food preferred for kids',
      status: 'Confirmed',
      totalAmount: 1499,
      isDeleted: false,
    });
  }

  // 4. Seed Payment
  const paymentId = 'PAY-90182';
  const existingPayment = await Payment.findOne({ paymentId });
  if (!existingPayment) {
    await Payment.create({
      paymentId,
      orderId: 'ORD_99182371',
      userId: sampleUser._id,
      bookingId: existingBooking.bookingId,
      customerName: sampleUser.name,
      customerPhone: sampleUser.phone,
      customerEmail: sampleUser.email,
      amount: 1499,
      currency: 'INR',
      status: 'Success',
      method: 'upi',
      invoiceNumber: 'INV-2026-0089',
      isDeleted: false,
    });
  }

  // 5. Seed Review
  const existingReview = await Review.findOne({ userId: sampleUser._id, dishId: 'DISH-101' });
  if (!existingReview) {
    await Review.create({
      userId: sampleUser._id,
      userName: sampleUser.name,
      dishId: 'DISH-101',
      dishName: 'Paneer Butter Masala & Garlic Naan Combo',
      rating: 5,
      comment: 'Authentic taste and spotless hygiene. Highly recommended!',
      isVerifiedCustomer: true,
      isDeleted: false,
    });
  }

  // 6. Seed Inquiry
  const existingInquiry = await Inquiry.findOne({ phone: '9876543210' });
  if (!existingInquiry) {
    await Inquiry.create({
      name: 'Ankush Rajput',
      phone: '9876543210',
      email: 'aankushrajput672@gmail.com',
      message: 'Looking for a monthly daily cook service for a family of 4 in Navi Mumbai.',
      status: 'New',
      isDeleted: false,
    });
  }

  // 7. Seed Audit Log
  const existingAudit = await AuditLog.findOne({ action: 'LOGIN' });
  if (!existingAudit) {
    await AuditLog.create({
      adminId: adminId?.toString() || 'admin_sys',
      adminEmail: 'admin@cookmantra.com',
      action: 'LOGIN',
      details: 'Admin user logged in successfully',
      targetId: adminId?.toString(),
      ipAddress: '127.0.0.1',
      isDeleted: false,
    });
  }

  logger.info('Database seeding completed successfully.');
}
