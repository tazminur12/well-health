import type {
  DistributorApplicationStatus,
  DistributorBusinessType,
  DistributorExperience,
  AdminDistributorApplication,
} from "@/lib/distributors/schemas";

export function mapDistributorApplication(row: {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  division: string;
  district: string;
  businessName: string | null;
  businessType: DistributorBusinessType;
  experience: DistributorExperience;
  coverageArea: string;
  message: string;
  status: DistributorApplicationStatus;
  adminNotes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AdminDistributorApplication {
  return {
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    email: row.email,
    division: row.division,
    district: row.district,
    businessName: row.businessName,
    businessType: row.businessType,
    experience: row.experience,
    coverageArea: row.coverageArea,
    message: row.message,
    status: row.status,
    adminNotes: row.adminNotes,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
