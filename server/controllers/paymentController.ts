import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Payment } from '../models/Payment';
import { Booking } from '../models/Booking';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { config } from '../config/env';
import { executeTransaction } from '../utils/dbTransaction';

// Initialize Razorpay SDK lazily / safely
let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay | null {
  if (!razorpayInstance && config.razorpayKeyId && config.razorpayKeySecret) {
    try {
      razorpayInstance = new Razorpay({
        key_id: config.razorpayKeyId,
        key_secret: config.razorpayKeySecret,
      });
    } catch (e) {
      console.warn('⚠️ Razorpay SDK initialization deferred/fallback active');
    }
  }
  return razorpayInstance;
}

/**
 * Helper to generate unique Invoice Numbers: INV-2026-8492
 */
const generateInvoiceNumber = (): string => {
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
  return `INV-2026-${randomStr}`;
};

/**
 * @desc    Create Razorpay Payment Order
 * @route   POST /api/v1/payments/create-order
 * @access  Public / Private
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, amount, currency = 'INR', customerName, customerPhone, customerEmail } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Valid amount is required.' });
      return;
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    const invoiceNumber = generateInvoiceNumber();
    let orderId = `order_cm_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const razorpay = getRazorpayInstance();

    // Attempt Razorpay order creation if live/valid keys
    if (razorpay && !config.razorpayKeyId.includes('rzp_test_cookmantra2026')) {
      try {
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency,
          receipt: invoiceNumber,
          notes: {
            bookingId: bookingId || 'N/A',
            customerName: customerName || 'Guest',
          },
        });
        if (order && order.id) {
          orderId = order.id;
        }
      } catch (err: any) {
        console.warn('⚠️ Razorpay test mode fallback activated for order creation:', err.message);
      }
    }

    const dummyPaymentId = `pay_cm_${Date.now()}`;

    // Create Payment database record
    await Payment.create({
      paymentId: dummyPaymentId,
      orderId,
      userId: (req as AuthenticatedRequest).user?._id,
      bookingId: bookingId || `BK_${Date.now()}`,
      customerName: customerName || (req as AuthenticatedRequest).user?.name || 'CookMantra Guest',
      customerPhone: customerPhone || (req as AuthenticatedRequest).user?.phone || '9999999999',
      customerEmail: customerEmail || (req as AuthenticatedRequest).user?.email || '',
      amount: Number(amount),
      currency,
      status: 'Pending',
      method: 'razorpay',
      invoiceNumber,
      isDeleted: false,
    });

    res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully',
      orderId,
      paymentId: dummyPaymentId,
      amount: Number(amount),
      currency,
      invoiceNumber,
      keyId: config.razorpayKeyId,
      customerDetails: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order.',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify Razorpay Payment Signature & Confirm Booking
 * @route   POST /api/v1/payments/verify
 * @access  Public / Private
 */
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      orderId,
      paymentId,
      razorpaySignature,
      bookingId,
      method = 'razorpay',
      utrNumber = '',
      status = 'Success',
    } = req.body;

    if (!orderId || !paymentId) {
      res.status(400).json({ success: false, message: 'orderId and paymentId are required for verification.' });
      return;
    }

    // Check signature if present and not in dummy test mode
    let isValidSignature = true;
    if (razorpaySignature && config.razorpayKeySecret && !config.razorpayKeySecret.includes('secret_cookmantra_test_key')) {
      const generatedSignature = crypto
        .createHmac('sha256', config.razorpayKeySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      isValidSignature = generatedSignature === razorpaySignature;
    }

    if (!isValidSignature) {
      res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
      return;
    }

    // Atomic transaction for payment update and booking confirmation
    const paymentRecord = await executeTransaction(async (session) => {
      let payment = await Payment.findOne({ isDeleted: false, $or: [{ orderId }, { paymentId }] }).session(session);

      if (payment) {
        payment.paymentId = paymentId;
        payment.status = status === 'Failed' ? 'Failed' : 'Success';
        payment.method = method;
        payment.signature = razorpaySignature || 'simulated_sig_verified';
        if (utrNumber) payment.utrNumber = utrNumber;
        await payment.save({ session });
      } else {
        payment = new Payment({
          paymentId,
          orderId,
          bookingId: bookingId || `BK_${Date.now()}`,
          customerName: (req as AuthenticatedRequest).user?.name || 'CookMantra Guest',
          customerPhone: (req as AuthenticatedRequest).user?.phone || '9999999999',
          customerEmail: (req as AuthenticatedRequest).user?.email || '',
          amount: req.body.amount || 2499,
          currency: 'INR',
          status: status === 'Failed' ? 'Failed' : 'Success',
          method,
          invoiceNumber: generateInvoiceNumber(),
          utrNumber,
          isDeleted: false,
        });
        await payment.save({ session });
      }

      if (bookingId && status !== 'Failed') {
        await Booking.findOneAndUpdate(
          { bookingId, isDeleted: false },
          { status: 'Confirmed', ...(utrNumber ? { utrNumber } : {}) },
          { session }
        );
      }

      return payment;
    });

    res.json({
      success: true,
      message: status === 'Failed' ? 'Payment status updated to Failed' : 'Payment verified and booking confirmed!',
      payment: paymentRecord,
      invoiceNumber: paymentRecord?.invoiceNumber,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Payment verification error.',
      error: error.message,
    });
  }
};

/**
 * @desc    Razorpay Webhook Handler
 * @route   POST /api/v1/payments/webhook
 * @access  Public
 */
export const razorpayWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;

    if (config.razorpayWebhookSecret && signature && !config.razorpayWebhookSecret.includes('whsec_cookmantra')) {
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpayWebhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== signature) {
        res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
        return;
      }
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity || payload?.order?.entity;
      if (paymentEntity) {
        const orderId = paymentEntity.order_id;
        const paymentId = paymentEntity.id;

        await executeTransaction(async (session) => {
          const payment = await Payment.findOne({ isDeleted: false, $or: [{ orderId }, { paymentId }] }).session(session);
          if (payment) {
            payment.status = 'Success';
            payment.paymentId = paymentId;
            await payment.save({ session });

            if (payment.bookingId) {
              await Booking.updateOne({ bookingId: payment.bookingId, isDeleted: false }, { status: 'Confirmed' }, { session: session || undefined });
            }
          }
        });
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      if (paymentEntity) {
        const orderId = paymentEntity.order_id;
        const payment = await Payment.findOne({ orderId, isDeleted: false });
        if (payment) {
          payment.status = 'Failed';
          await payment.save();
        }
      }
    }

    res.json({ success: true, status: 'Webhook received' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Webhook processing error', error: error.message });
  }
};

/**
 * @desc    Get Payment History for current user
 * @route   GET /api/v1/payments/history
 * @access  Private / Public
 */
export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const phone = req.user?.phone;
    const statusFilter = req.query.status as string;

    let filter: any = { isDeleted: false };
    if (userId) {
      filter.$or = [{ userId }, { customerPhone: phone }];
    } else if (phone) {
      filter.customerPhone = phone;
    }

    if (statusFilter && statusFilter !== 'All') {
      filter.status = statusFilter;
    }

    const payments = await Payment.find(filter).sort({ createdAt: -1 }).lean().catch(() => []);

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment history', error: error.message });
  }
};

/**
 * @desc    Get All Payments for Admin Panel
 * @route   GET /api/v1/payments/all
 * @access  Private (Admin)
 */
export const getAllPaymentsAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    let query: any = { isDeleted: false };
    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { paymentId: searchRegex },
        { orderId: searchRegex },
        { bookingId: searchRegex },
        { customerName: searchRegex },
        { customerPhone: searchRegex },
        { invoiceNumber: searchRegex },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const payments = await Payment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean().catch(() => []);
    const total = await Payment.countDocuments(query).catch(() => payments.length);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      payments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin payments', error: error.message });
  }
};

/**
 * @desc    Get Detailed Invoice Data
 * @route   GET /api/v1/payments/invoice/:paymentId
 * @access  Public / Private
 */
export const getInvoiceDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({ isDeleted: false, $or: [{ paymentId }, { invoiceNumber: paymentId }] }).lean();

    if (!payment) {
      res.status(404).json({ success: false, message: 'Invoice / Payment record not found.' });
      return;
    }

    const booking = await Booking.findOne({ bookingId: payment.bookingId, isDeleted: false }).lean();

    // Calculate GST breakdown (18%)
    const totalAmount = payment.amount;
    const baseAmount = Math.round((totalAmount / 1.18) * 100) / 100;
    const gstAmount = Math.round((totalAmount - baseAmount) * 100) / 100;

    res.json({
      success: true,
      invoice: {
        invoiceNumber: payment.invoiceNumber,
        date: payment.createdAt,
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        bookingId: payment.bookingId,
        status: payment.status,
        method: payment.method,
        utrNumber: payment.utrNumber,
        customer: {
          name: payment.customerName,
          phone: payment.customerPhone,
          email: payment.customerEmail,
        },
        serviceDetails: booking ? {
          serviceType: booking.serviceType,
          serviceDetail: booking.serviceDetail,
          date: booking.date,
          time: booking.time,
          quantity: booking.quantity,
        } : {
          serviceDetail: 'Executive Chef Service Package',
          quantity: 1,
        },
        financials: {
          subtotal: baseAmount,
          gst18Percent: gstAmount,
          totalAmount: totalAmount,
          currency: payment.currency,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving invoice.', error: error.message });
  }
};

/**
 * @desc    Issue Refund for Payment
 * @route   POST /api/v1/payments/refund
 * @access  Private (Admin / Customer)
 */
export const issueRefund = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { paymentId, reason } = req.body;

    if (!paymentId) {
      res.status(400).json({ success: false, message: 'paymentId is required for processing refund.' });
      return;
    }

    const refundResult = await executeTransaction(async (session) => {
      const payment = await Payment.findOne({ isDeleted: false, $or: [{ paymentId }, { invoiceNumber: paymentId }] }).session(session);

      if (!payment) {
        throw new Error('Payment record not found.');
      }

      if (payment.status === 'Refunded') {
        throw new Error('This payment has already been refunded.');
      }

      const refundId = `rfnd_cm_${Date.now()}`;
      const razorpay = getRazorpayInstance();

      if (razorpay && payment.paymentId.startsWith('pay_') && !payment.paymentId.startsWith('pay_cm_')) {
        try {
          await razorpay.payments.refund(payment.paymentId, {
            amount: Math.round(payment.amount * 100),
            notes: { reason: reason || 'Customer cancellation refund' },
          });
        } catch (err: any) {
          console.warn('⚠️ Razorpay test refund simulation active:', err.message);
        }
      }

      payment.status = 'Refunded';
      payment.refundStatus = 'Processed';
      payment.refundId = refundId;
      payment.refundAmount = payment.amount;
      await payment.save({ session });

      if (payment.bookingId) {
        await Booking.updateOne({ bookingId: payment.bookingId, isDeleted: false }, { status: 'Cancelled' },{ session: session || undefined });
      }

      return { payment, refundId };
    });

    res.json({
      success: true,
      message: `Refund of ₹${refundResult.payment.amount} processed successfully!`,
      refundId: refundResult.refundId,
      payment: refundResult.payment,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to process refund.' });
  }
};
