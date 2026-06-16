export interface AuditTemplate {
  id: string;
  name: string;
  auditType: string;
  appliesTo: string;
  coordinators: string[];
  status: boolean; // true = Active, false = Inactive
  createdAt: string;
  createdBy: string;
}

export interface DecisionMatrix {
  id: string;
  name: string;
  financialYear: string;
  auditType: string;
  plant: string;
  process: string;
  appliesTo: string;
  coordinators: string[];
  criteria: Array<{ name: string; weight: number }>;
  status: boolean;
  createdAt: string;
  createdBy: string;
}

export interface AuditPlan {
  id: string;
  planName: string;
  templateId: string;
  plant: string;
  leadAuditor: string;
  auditorTeam: string[];
  financialYear: string;
  targetStartDate: string;
  targetEndDate: string;
  scope: string;
  status: 'Draft' | 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: string;
  createdBy: string;
}

export interface AuditRequest {
  id: string;
  title: string;
  auditType: string;
  department: string;
  proposedDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string;
  requestorName: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface LibraryDocument {
  id: string;
  title: string;
  category: string;
  version: string;
  lastUpdated: string;
  fileSize: string;
  downloadUrl?: string;
  description: string;
}
