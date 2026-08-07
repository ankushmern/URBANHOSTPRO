import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { Inquiry } from '../models/Inquiry';
import { MigrationScript } from './runner';

export const migration002: MigrationScript = {
  name: '002_normalize_user_phones',
  up: async () => {
    // Trim and normalize phone numbers in User model
    const users = await User.find({});
    for (const user of users) {
      let modified = false;
      if (user.phone) {
        const cleaned = user.phone.trim().replace(/\s+/g, '');
        if (cleaned !== user.phone) {
          user.phone = cleaned;
          modified = true;
        }
      }
      if (user.email) {
        const cleaned = user.email.trim().toLowerCase();
        if (cleaned !== user.email) {
          user.email = cleaned;
          modified = true;
        }
      }
      if (modified) {
        await user.save();
      }
    }

    // Trim phone numbers in Booking model
    const bookings = await Booking.find({});
    for (const b of bookings) {
      if (b.phone) {
        const cleaned = b.phone.trim().replace(/\s+/g, '');
        if (cleaned !== b.phone) {
          b.phone = cleaned;
          await b.save();
        }
      }
    }

    // Trim phone numbers in Payment model
    const payments = await Payment.find({});
    for (const p of payments) {
      if (p.customerPhone) {
        const cleaned = p.customerPhone.trim().replace(/\s+/g, '');
        if (cleaned !== p.customerPhone) {
          p.customerPhone = cleaned;
          await p.save();
        }
      }
    }

    // Trim phone numbers in Inquiry model
    const inquiries = await Inquiry.find({});
    for (const inq of inquiries) {
      if (inq.phone) {
        const cleaned = inq.phone.trim().replace(/\s+/g, '');
        if (cleaned !== inq.phone) {
          inq.phone = cleaned;
          await inq.save();
        }
      }
    }
  },
};
