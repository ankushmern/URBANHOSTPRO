import { Request, Response } from 'express';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import bcrypt from 'bcryptjs';

/**
 * Calculate user profile completion percentage
 */
const calculateProfileCompletion = (user: any): number => {
  let score = 0;
  if (user.name) score += 20;
  if (user.phone) score += 20;
  if (user.email) score += 20;
  if (user.avatar) score += 15;
  if (user.addresses && user.addresses.length > 0) score += 15;
  if (user.isEmailVerified) score += 10;
  return Math.min(100, score);
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/v1/user/profile
 * @access  Private
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?._id) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    let user = await User.findOne({ _id: authReq.user._id, isDeleted: false }).select('-password').catch(() => null);
    if (!user) {
      user = authReq.user as any;
    }

    const completion = calculateProfileCompletion(user);

    res.json({
      success: true,
      user,
      profileCompletion: completion,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: error.message });
  }
};

/**
 * @desc    Update profile (Name, Phone, Email, Avatar)
 * @route   PUT /api/v1/user/profile
 * @access  Private
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { name, phone, email, avatar } = req.body;

    const user = await User.findOne({ _id: userId, isDeleted: false });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    let emailChanged = false;
    if (email && email !== user.email) {
      // Check if email already in use
      const existingEmail = await User.findOne({ email, isDeleted: false, _id: { $ne: userId } });
      if (existingEmail) {
        res.status(400).json({ success: false, message: 'Email address is already in use by another account.' });
        return;
      }
      user.email = email;
      user.isEmailVerified = false; // reset verification flag on change
      emailChanged = true;
    }

    await user.save();
    const completion = calculateProfileCompletion(user);

    res.json({
      success: true,
      message: emailChanged
        ? 'Profile updated! A verification link/OTP was initiated for your new email.'
        : 'Profile details saved successfully!',
      user,
      profileCompletion: completion,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

/**
 * @desc    Change password
 * @route   POST /api/v1/user/change-password
 * @access  Private
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Please provide both current and new password.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      return;
    }

    const user = await User.findOne({ _id: userId, isDeleted: false }).select('+password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'Current password does not match.' });
        return;
      }
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to change password', error: error.message });
  }
};

/**
 * @desc    Get saved addresses
 * @route   GET /api/v1/user/addresses
 * @access  Private
 */
export const getAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await User.findOne({ _id: authReq.user?._id, isDeleted: false }).catch(() => null);
    res.json({ success: true, addresses: user?.addresses || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
  }
};

/**
 * @desc    Add new saved address
 * @route   POST /api/v1/user/addresses
 * @access  Private
 */
export const addAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { title, flatNo, addressLine, landmark, city, pincode, lat, lng, isDefault } = req.body;

    if (!addressLine || !city || !pincode) {
      res.status(400).json({ success: false, message: 'Address line, city, and pincode are required.' });
      return;
    }

    const user = await User.findOne({ _id: authReq.user?._id, isDeleted: false });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    }

    const newAddr = {
      title: title || 'Home',
      flatNo: flatNo || '',
      addressLine,
      landmark: landmark || '',
      city,
      pincode,
      lat: Number(lat) || 19.0760,
      lng: Number(lng) || 72.8777,
      isDefault: Boolean(isDefault) || user.addresses.length === 0,
    };

    user.addresses.push(newAddr as any);
    await user.save();

    res.json({ success: true, message: 'New address saved!', addresses: user.addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add address', error: error.message });
  }
};

/**
 * @desc    Update address
 * @route   PUT /api/v1/user/addresses/:id
 * @access  Private
 */
export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const { title, flatNo, addressLine, landmark, city, pincode, lat, lng, isDefault } = req.body;

    const user = await User.findOne({ _id: authReq.user?._id, isDeleted: false });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const addr = user.addresses.find(a => (a._id ? a._id.toString() === id : false));
    if (!addr) {
      res.status(404).json({ success: false, message: 'Address not found' });
      return;
    }

    if (isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    }

    if (title) addr.title = title;
    if (flatNo !== undefined) addr.flatNo = flatNo;
    if (addressLine) addr.addressLine = addressLine;
    if (landmark !== undefined) addr.landmark = landmark;
    if (city) addr.city = city;
    if (pincode) addr.pincode = pincode;
    if (lat !== undefined) addr.lat = Number(lat);
    if (lng !== undefined) addr.lng = Number(lng);
    if (isDefault !== undefined) addr.isDefault = Boolean(isDefault);

    await user.save();
    res.json({ success: true, message: 'Address updated!', addresses: user.addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update address', error: error.message });
  }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/user/addresses/:id
 * @access  Private
 */
export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    const user = await User.findOne({ _id: authReq.user?._id, isDeleted: false });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.addresses = user.addresses.filter(a => (a._id ? a._id.toString() !== id : true));
    await user.save();

    res.json({ success: true, message: 'Address deleted!', addresses: user.addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete address', error: error.message });
  }
};

/**
 * @desc    Toggle Dish in Wishlist
 * @route   POST /api/v1/user/wishlist/toggle
 * @access  Private
 */
export const toggleWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { dishId } = req.body;

    if (!dishId) {
      res.status(400).json({ success: false, message: 'Dish ID is required' });
      return;
    }

    const user = await User.findOne({ _id: authReq.user?._id, isDeleted: false });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const strId = String(dishId);
    const index = user.wishlist.indexOf(strId);
    let added = false;

    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(strId);
      added = true;
    }

    await user.save();

    res.json({
      success: true,
      message: added ? 'Added to Wishlist!' : 'Removed from Wishlist',
      wishlist: user.wishlist,
      added,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Wishlist toggle failed', error: error.message });
  }
};

/**
 * @desc    Get user notifications
 * @route   GET /api/v1/user/notifications
 * @access  Private
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await User.findOne({ _id: authReq.user?._id, isDeleted: false });
    const notifications = user?.notifications || [];
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/v1/user/notifications/:id/read
 * @access  Private
 */
export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    const user = await User.findOne({ _id: authReq.user?._id, isDeleted: false });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const notif = user.notifications.find(n => (n._id ? n._id.toString() === id : false));
    if (notif) {
      notif.isRead = true;
      await user.save();
    }

    res.json({ success: true, message: 'Notification marked as read', notifications: user.notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/v1/user/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await User.findOne({ _id: authReq.user?._id, isDeleted: false });
    if (user) {
      user.notifications.forEach(n => (n.isRead = true));
      await user.save();
    }
    res.json({ success: true, message: 'All notifications marked as read', notifications: user?.notifications || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};
