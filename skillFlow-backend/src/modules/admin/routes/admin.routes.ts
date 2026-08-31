import { Router } from 'express';
import { requireAuth } from '../../../middlewares/auth.middleware.js';
import { requireRole } from '../../../middlewares/role.middleware.js';
import { adminController } from '../controllers/admin.controller.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);

router.get('/users', adminController.getUsers);
router.post('/users/admin', adminController.createAdmin);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/companies', adminController.getCompanies);
router.delete('/companies/bulk', adminController.bulkDeleteCompanies);
router.patch('/companies/:id/verify', adminController.verifyCompany);
router.delete('/companies/:id', adminController.deleteCompany);

router.get('/jobs', adminController.getJobs);
router.delete('/jobs/bulk', adminController.bulkDeleteJobs);
router.patch('/jobs/:id/status', adminController.updateJobStatus);
router.delete('/jobs/:id', adminController.deleteJob);

router.get('/applications', adminController.getApplications);
router.delete('/applications/bulk', adminController.bulkDeleteApplications);
router.patch('/applications/:id/status', adminController.updateApplicationStatus);

router.get('/audit-logs', adminController.getAuditLogs);

router.get('/skills', adminController.getSkills);
router.post('/skills', adminController.createSkill);
router.put('/skills/:id', adminController.updateSkill);
router.delete('/skills/:id', adminController.deleteSkill);

export const adminRoutes = router;

