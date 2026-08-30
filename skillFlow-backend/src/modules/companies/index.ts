export { companyRouter } from "./routes/company.routes.js";
export { employerProfileRouter } from "./routes/employer-profile.routes.js";
export { employerRouter } from "./routes/employer.routes.js";

export { CompanyService } from "./services/company.service.js";
export { EmployerProfileService } from "./services/employer-profile.service.js";
export { EmployerDashboardService } from "./services/employer-dashboard.service.js";

export type { ICompanyService } from "./services/company.service.js";
export type { IEmployerProfileService } from "./services/employer-profile.service.js";

export { CompanyRepository } from "./repositories/company.repository.js";
export { EmployerProfileRepository } from "./repositories/employer-profile.repository.js";

export type { ICompanyRepository } from "./repositories/company.repository.js";
export type { IEmployerProfileRepository } from "./repositories/employer-profile.repository.js";

export { CompanyController } from "./controllers/company.controller.js";
export { EmployerProfileController } from "./controllers/employer-profile.controller.js";
export { EmployerDashboardController } from "./controllers/employer-dashboard.controller.js";

export type {
  CreateCompanyDTO,
  UpdateCompanyDTO,
  UpdateCompanyVerificationDTO,
  CompanyResponseDTO,
} from "./dtos/company.dto.js";

export type {
  CreateEmployerProfileDTO,
  UpdateEmployerProfileDTO,
  EmployerProfileResponseDTO,
  EmployerProfileUserDTO,
  EmployerProfileCompanyDTO,
} from "./dtos/employer-profile.dto.js";

export type {
  EmployerDashboardStatsDTO,
  EmployerJobsQueryDTO,
  EmployerApplicationsQueryDTO,
  EmployerCandidatesQueryDTO,
} from "./dtos/employer-dashboard.dto.js";

export type {
  CompanyEntity,
  VerificationStatus,
} from "./entities/company.entity.js";

export type { EmployerProfileEntity } from "./entities/employer-profile.entity.js";

export {
  createEmployerProfileSchema,
  updateEmployerProfileSchema,
} from "./schemas/employer-profile.schema.js";

export {
  employerJobsQuerySchema,
  employerApplicationsQuerySchema,
  employerCandidatesQuerySchema,
} from "./schemas/employer-dashboard.schema.js";
