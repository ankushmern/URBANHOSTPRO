import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUser,
  toggleBanUser,
  deleteUser,
  bulkDeleteUsers,
  assignChefToBooking,
  getAuditLogs,
  getDatabaseHealth,
  runDatabaseBenchmark,
  triggerDeduplication,
  createBackup,
  listBackups,
  getSecurityAuditReport,
} from '../controllers/adminController';
import { protect, adminOnly } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { updateUserRoleSchema, bulkDeleteUsersSchema } from '../validators/adminValidator';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id', validateRequest(updateUserRoleSchema), updateUser);
router.patch('/users/:id/ban', toggleBanUser);
router.delete('/users/:id', deleteUser);
router.post('/users/bulk-delete', validateRequest(bulkDeleteUsersSchema), bulkDeleteUsers);
router.patch('/bookings/:id/assign-chef', assignChefToBooking);
router.get('/audit-logs', getAuditLogs);

// Database Engineering Routes
router.get('/security/audit', getSecurityAuditReport);
router.get('/db/health', getDatabaseHealth);
router.get('/db/benchmark', runDatabaseBenchmark);
router.post('/db/deduplicate', triggerDeduplication);
router.post('/db/backup', createBackup);
router.get('/db/backups', listBackups);

export default router;
