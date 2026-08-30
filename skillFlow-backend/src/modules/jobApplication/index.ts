import { JobApplicationController } from './controllers/job-application.controller.js';
import { JobApplicationRepository } from './repositories/job-application.repository.js';
import { JobApplicationService } from './services/job-application.service.js';
import { jobApplicationRoutes } from './routes/job-application.routes.js';

const jobApplicationRepository = new JobApplicationRepository();
export const jobApplicationService = new JobApplicationService(jobApplicationRepository);
export const jobApplicationController = new JobApplicationController();
export { jobApplicationRoutes };