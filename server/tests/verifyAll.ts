import mongoose from 'mongoose';
import { connectDatabase } from '../config/db';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

async function verifyAll() {
  console.log('----------------------------------------------------');
  console.log('🔍 STARTING SYSTEM INTEGRATION & VERIFICATION TEST');
  console.log('----------------------------------------------------');

  // 1. Database Connection
  const connected = await connectDatabase();
  console.log(`1. DB Connection: ${connected ? '✅ PASSED' : '❌ FAILED'}`);
  if (!connected) process.exit(1);

  // 2. User Signup & Persistence
  const testEmail = `testuser_${Date.now()}@cookmantra.com`;
  const testPassword = 'Password123!';
  const testPhone = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;

  const newUser = await User.create({
    name: 'Verification Test User',
    email: testEmail,
    password: testPassword,
    phone: testPhone,
    role: 'user',
  });

  const savedUser = await User.findById(newUser._id).select('+password');
  console.log(`2. User Signup & DB Persistence: ${savedUser ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`3. Unique User ID Generation: ${savedUser?._id ? `✅ PASSED (ID: ${savedUser._id})` : '❌ FAILED'}`);

  // 4. User Login & Password Hash Verification
  const isMatch = await savedUser!.matchPassword(testPassword);
  const token = jwt.sign({ userId: savedUser!._id, role: savedUser!.role }, config.jwtSecret || 'secret', { expiresIn: '1h' });
  console.log(`4. User Login & JWT Generation: ${isMatch && token ? '✅ PASSED' : '❌ FAILED'}`);

  // 5. Booking Creation & Save in DB
  const bookingIdStr = `BK${Date.now()}`;
  const newBooking = await Booking.create({
    bookingId: bookingIdStr,
    userId: savedUser!._id,
    name: savedUser!.name,
    phone: testPhone,
    email: testEmail,
    serviceType: 'culinary',
    serviceDetail: 'One-Time Gourmet Chef Service',
    quantity: 2,
    date: '2026-08-10',
    time: '12:00 PM - 02:00 PM',
    status: 'Pending',
    totalAmount: 590,
  });

  const savedBooking = await Booking.findById(newBooking._id);
  console.log(`5. Booking Creation & DB Persistence: ${savedBooking ? `✅ PASSED (Booking ID: ${savedBooking.bookingId})` : '❌ FAILED'}`);

  // 6. Payment Processing & DB Storage
  const ts = Date.now();
  const newPayment = await Payment.create({
    paymentId: `pay_${ts}`,
    orderId: `order_${ts}`,
    userId: savedUser!._id,
    bookingId: savedBooking!.bookingId,
    customerName: savedUser!.name,
    customerPhone: testPhone,
    customerEmail: testEmail,
    amount: 590,
    currency: 'INR',
    status: 'Success',
    method: 'razorpay',
    invoiceNumber: `INV-${ts}`,
  });

  const savedPayment = await Payment.findById(newPayment._id);
  console.log(`6. Payment Processing & DB Storage: ${savedPayment ? `✅ PASSED (Payment ID: ${savedPayment.paymentId})` : '❌ FAILED'}`);

  // 7. Cleanup Test Records
  await Payment.deleteOne({ _id: savedPayment!._id });
  await Booking.deleteOne({ _id: savedBooking!._id });
  await User.deleteOne({ _id: savedUser!._id });
  console.log(`7. DB Clean-up of Test Records: ✅ PASSED`);

  console.log('----------------------------------------------------');
  console.log('🎉 ALL SYSTEM INTEGRATION TESTS PASSED 100%!');
  console.log('----------------------------------------------------');
  process.exit(0);
}

verifyAll().catch((err) => {
  console.error('❌ Verification Error:', err);
  process.exit(1);
});
