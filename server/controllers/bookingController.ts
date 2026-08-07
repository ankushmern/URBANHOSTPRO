import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { executeTransaction } from '../utils/dbTransaction';

/**
 * @desc    Create a new booking request
 * @route   POST /api/v1/bookings
 * @access  Public / Authenticated
 */
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, serviceType, serviceDetail, quantity, date, time, notes, utrNumber, totalAmount } = req.body;

    const bookingId = `CM-${Date.now().toString().slice(-6)}`;
    const status = utrNumber ? 'Payment Verification Pending' : 'Confirmed';

    const validServiceTypes = ['culinary', 'cleaning', 'combo', 'catering', 'daily_cook'];
    const normalizedServiceType = validServiceTypes.includes((serviceType || '').toLowerCase())
      ? (serviceType || '').toLowerCase()
      : 'culinary';

    const newBooking = await executeTransaction(async (session) => {
      const options = session ? { session } : {};
      const createdArray = await Booking.create(
        [
          {
            bookingId,
            name,
            phone,
            email: email || '',
            serviceType: normalizedServiceType,
            serviceDetail,
            quantity: quantity || 1,
            date: date || new Date().toISOString().split('T')[0],
            time: time || '12:00 PM',
            notes: notes || '',
            status,
            utrNumber: utrNumber || '',
            totalAmount: totalAmount || 0,
            isDeleted: false,
          },
        ],
        options
      );

      const bookingDoc = createdArray[0];

      if (phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone) {
          await User.findOneAndUpdate(
            { phone: cleanPhone, isDeleted: false },
            { $inc: { totalBookings: 1 } },
            options
          ).catch(() => null);
        }
      }

      return bookingDoc;
    });

    res.status(201).json({
      success: true,
      message: 'Booking request placed successfully!',
      booking: newBooking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create booking.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all bookings
 * @route   GET /api/v1/bookings
 * @access  Public / Admin
 */
export const getAllBookings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ isDeleted: false }).sort({ createdAt: -1 }).lean().catch(() => []);

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving bookings.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user specific bookings
 * @route   GET /api/v1/bookings/my
 * @access  Private
 */
export const getUserBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userPhone = req.user?.phone;

    const bookings = await Booking.find({ phone: userPhone, isDeleted: false }).sort({ createdAt: -1 }).lean().catch(() => []);

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your bookings.',
      error: error.message,
    });
  }
};

/**
 * @desc    Update booking status
 * @route   PATCH /api/v1/bookings/:id/status
 * @access  Private / Admin
 */
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findOneAndUpdate({ _id: id, isDeleted: false }, { status }, { returnDocument: 'after' });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully.',
      booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating status.', error: error.message });
  }
};
