 
// JOB LIST DTO
// Used for GET /api/v1/jobs
 

export interface JobListItemDTO {
  id: string;
  slug: string;
  time: string;
  title: string;
  company: string;
  category: string;
  type: string;
  salary: string;
  location: string;
  image: string | null;
}
 
// JOB LIST RESPONSE
 

export interface JobListResponseDTO {
  success: boolean;
  data: JobListItemDTO[];
}

 
// JOB DETAIL DTO
// Used for GET /api/v1/jobs/:jobId
 

export interface JobDetailDTO {
  id: string;
  slug: string;
  title: string;

  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    location: string | null;
  };

  category: {
    id: string;
    name: string;
  };

  type: string;
  location: string;

  salary: string | null;

  description: string;

  requirements: string[];

  responsibilities: string[];

  skills: string[];

  createdAt: string;
  updatedAt: string;
}

export interface PromoteJobDTO {
  promotionType: 'FEATURED' | 'URGENT' | 'HIGHLIGHTED';
  promotionStartAt: string | Date;
  promotionEndAt: string | Date;
  promotionPaymentId?: string;
}