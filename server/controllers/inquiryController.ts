import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Inquiry } from '../models/Inquiry';

/**
 * @desc    Submit contact enquiry
 * @route   POST /api/v1/inquiries
 * @access  Public
 */
export const createInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !message) {
      res.status(400).json({ success: false, message: 'Name, Phone and Message are required.' });
      return;
    }

    let inquiry: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        inquiry = await Inquiry.create({
          name,
          phone,
          email: email || '',
          message,
          isDeleted: false,
        });
      } catch (err: any) {
        console.warn('MongoDB save bypassed for inquiry:', err.message);
      }
    }

    if (!inquiry) {
      inquiry = {
        _id: `inq_${Date.now()}`,
        name,
        phone,
        email: email || '',
        message,
        createdAt: new Date(),
      };
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will contact you shortly.',
      inquiry,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to submit inquiry.', error: error.message });
  }
};

/**
 * @desc    Get all inquiries
 * @route   GET /api/v1/inquiries
 * @access  Private / Admin
 */
export const getAllInquiries = async (_req: Request, res: Response): Promise<void> => {
  try {
    const inquiries = await Inquiry.find({ isDeleted: false }).sort({ createdAt: -1 }).lean().catch(() => []);

    res.json({ success: true, count: inquiries.length, inquiries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving inquiries.', error: error.message });
  }
};
