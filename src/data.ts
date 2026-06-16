import { AuditTemplate, DecisionMatrix, AuditPlan, AuditRequest, LibraryDocument } from './types';

// Static Helpers
export const AUDIT_TYPES = ['5S Audit', 'ISO 9001', 'EHS Audit', 'Process Audit', 'Quality Assurance'];
export const PLANTS = ['Chennai Plant - Sector 1', 'Pune Plant - Automotives', 'Bangalore R&D Center', 'Shanghai Tech Hub', 'Munich Logistics'];
export const PROCESSES = ['Manufacturing', 'Non-Manufacturing', 'Lanes', 'Offices & Stores', 'Warehousing', 'Assembly Area', 'Packaging Unit'];
export const COORDINATORS = [
  'NBC Admin (nbcadmin)',
  'Jane Smith (janesmith)',
  'Alex Johnson (alexj)',
  'Maria Garcia (mariag)',
  'Sarah Connor (sarahc)'
];
export const FINANCIAL_YEARS = ['FY 2024-25', 'FY 2025-26', 'FY 2026-27'];

// Initial Mock Library
export const INITIAL_LIBRARY: LibraryDocument[] = [
  {
    id: 'LIB-001',
    title: '5S Audit Standard Operating Procedure (SOP)',
    category: 'Standard Guidelines',
    version: 'v2.4',
    lastUpdated: '2026-03-12',
    fileSize: '2.4 MB',
    description: 'Detailed instructions and standards for conducting 5S audits in manufacturing and office spaces, including Seiri, Seiton, Seiso, Seiketsu, and Shitsuke checkpoints.'
  },
  {
    id: 'LIB-002',
    title: 'ISO 9001:2015 Quality Management Guideline',
    category: 'Regulatory Standards',
    version: 'v4.1',
    lastUpdated: '2025-11-05',
    fileSize: '4.8 MB',
    description: 'General regulatory framework outlining customer focus, lead management reference, process approach, and continuous improvements.'
  },
  {
    id: 'LIB-003',
    title: 'Safety Audits & Incident Prevention Checklist',
    category: 'Safety & EHS',
    version: 'v1.8',
    lastUpdated: '2026-05-20',
    fileSize: '1.7 MB',
    description: 'Reference sheet specifically detailing workplace risk analysis, fire security checks, electrical safety, and personal protective equipment (PPE) guidelines.'
  },
  {
    id: 'LIB-004',
    title: 'Internal Audit Training and Certification Manual',
    category: 'Training Materials',
    version: 'v3.0',
    lastUpdated: '2026-01-18',
    fileSize: '8.2 MB',
    description: 'Self-guided training slides and quiz material to onboard and qualify internal auditors for manufacturing lines.'
  }
];

// Initial Mock Audit Templates
export const INITIAL_TEMPLATES: AuditTemplate[] = [
  {
    id: 'AT-001',
    name: 'Non-Manufacturing',
    auditType: '5S Audit',
    appliesTo: 'Non-Manufacturing',
    coordinators: ['NBC Admin (nbcadmin)', 'Jane Smith (janesmith)'],
    status: true,
    createdAt: '2026-04-10',
    createdBy: 'NBC Admin'
  },
  {
    id: 'AT-002',
    name: 'Manufacturing',
    auditType: '5S Audit',
    appliesTo: 'Manufacturing',
    coordinators: ['NBC Admin (nbcadmin)'],
    status: true,
    createdAt: '2026-04-11',
    createdBy: 'NBC Admin'
  },
  {
    id: 'AT-003',
    name: 'Lanes',
    auditType: '5S Audit',
    appliesTo: 'Lanes',
    coordinators: ['NBC Admin (nbcadmin)', 'Alex Johnson (alexj)'],
    status: true,
    createdAt: '2026-05-02',
    createdBy: 'NBC Admin'
  },
  {
    id: 'AT-004',
    name: 'Offices & Stores',
    auditType: '5S Audit',
    appliesTo: 'Offices & Stores',
    coordinators: ['NBC Admin (nbcadmin)'],
    status: true,
    createdAt: '2026-05-15',
    createdBy: 'NBC Admin'
  }
];

// Initial Mock Decision Matrices
export const INITIAL_MATRICES: DecisionMatrix[] = [
  {
    id: 'DM-001',
    name: '5S Quality Allocation Matrix',
    financialYear: 'FY 2025-26',
    auditType: '5S Audit',
    plant: 'Chennai Plant - Sector 1',
    process: 'Manufacturing',
    appliesTo: 'Manufacturing Lines',
    coordinators: ['NBC Admin (nbcadmin)', 'Jane Smith (janesmith)'],
    criteria: [
      { name: 'Sort (Seiri) - Level of organization', weight: 20 },
      { name: 'Set in Order (Seiton) - Storage efficiency', weight: 20 },
      { name: 'Shine (Seiso) - Cleanliness levels', weight: 20 },
      { name: 'Standardize (Seiketsu) - Routine integration', weight: 20 },
      { name: 'Sustain (Shitsuke) - Employee discipline', weight: 20 }
    ],
    status: true,
    createdAt: '2026-05-10',
    createdBy: 'NBC Admin'
  },
  {
    id: 'DM-002',
    name: 'ISO Process Risk Evaluation Matrix',
    financialYear: 'FY 2025-26',
    auditType: 'ISO 9001',
    plant: 'Pune Plant - Automotives',
    process: 'Assembly Area',
    appliesTo: 'Offices & Stores',
    coordinators: ['Maria Garcia (mariag)'],
    criteria: [
      { name: 'Documentation Quality', weight: 30 },
      { name: 'Defect Rate Tolerance', weight: 40 },
      { name: 'Customer Call Feedback', weight: 30 }
    ],
    status: true,
    createdAt: '2026-06-01',
    createdBy: 'Maria Garcia'
  }
];

// Initial Mock Audit Plans
export const INITIAL_PLANS: AuditPlan[] = [
  {
    id: 'AP-001',
    planName: 'Q2 Internal 5S Cleanliness Review',
    templateId: 'AT-002',
    plant: 'Chennai Plant - Sector 1',
    leadAuditor: 'Jane Smith (janesmith)',
    auditorTeam: ['NBC Admin (nbcadmin)', 'Alex Johnson (alexj)'],
    financialYear: 'FY 2025-26',
    targetStartDate: '2026-07-05',
    targetEndDate: '2026-07-10',
    scope: 'Perform a deep dive assessment on visual items, dust prevention safety, and machine cleaning protocol in main assembly sector 1.',
    status: 'Planned',
    createdAt: '2026-06-05',
    createdBy: 'Jane Smith (janesmith)'
  },
  {
    id: 'AP-002',
    planName: 'Annual Regulatory QA Checklist Calibration',
    templateId: 'AT-001',
    plant: 'Pune Plant - Automotives',
    leadAuditor: 'NBC Admin (nbcadmin)',
    auditorTeam: ['Maria Garcia (mariag)', 'Sarah Connor (sarahc)'],
    financialYear: 'FY 2025-26',
    targetStartDate: '2026-06-20',
    targetEndDate: '2026-06-28',
    scope: 'Verify overall training protocols and documentation standards regarding automated robotic tooling area.',
    status: 'In Progress',
    createdAt: '2026-05-18',
    createdBy: 'NBC Admin'
  },
  {
    id: 'AP-003',
    planName: 'Lanes Sorting Verification Audit',
    templateId: 'AT-003',
    plant: 'Bangalore R&D Center',
    leadAuditor: 'Alex Johnson (alexj)',
    auditorTeam: ['Jane Smith (janesmith)'],
    financialYear: 'FY 2024-25',
    targetStartDate: '2026-04-12',
    targetEndDate: '2026-04-14',
    scope: 'Standard visual sorting compliance checking.',
    status: 'Completed',
    createdAt: '2026-03-31',
    createdBy: 'Alex Johnson (alexj)'
  }
];

// Initial Mock Audit Requests
export const INITIAL_REQUESTS: AuditRequest[] = [
  {
    id: 'AR-001',
    title: 'Ad-Hoc Assembly Line 3 Defect Audit',
    auditType: 'Process Audit',
    department: 'Manufacturing Ops',
    proposedDate: '2026-07-15',
    priority: 'High',
    reason: 'Excessive tool wear observed during the night shifts. Quality metrics dropped 2.5% below standard threshold limits.',
    requestorName: 'Sarah Connor (sarahc)',
    status: 'Pending Approval',
    createdAt: '2026-06-12'
  },
  {
    id: 'AR-002',
    title: 'Warehouse Standard Storage Verification',
    auditType: '5S Audit',
    department: 'Logistics and Dispatch',
    proposedDate: '2026-06-22',
    priority: 'Medium',
    reason: 'Preparation for regional quarterly storage efficiency benchmarking review.',
    requestorName: 'Maria Garcia (mariag)',
    status: 'Approved',
    createdAt: '2026-06-08'
  },
  {
    id: 'AR-003',
    title: 'New Recruits Safety Protocol Run',
    auditType: 'EHS Audit',
    department: 'Human Resources',
    proposedDate: '2026-05-10',
    priority: 'Low',
    reason: 'Standard validation of onboarding safety modules and hazard recognition drills.',
    requestorName: 'Jane Smith (janesmith)',
    status: 'Approved',
    createdAt: '2026-05-01'
  }
];

// LocalStorage Keys
const KEYS = {
  TEMPLATES: 'qms_audit_templates',
  MATRICES: 'qms_decision_matrices',
  PLANS: 'qms_audit_plans',
  REQUESTS: 'qms_audit_requests',
  LIBRARY: 'qms_library_docs'
};

// Initialization helper
export function getSavedData() {
  if (typeof window === 'undefined') {
    return {
      templates: INITIAL_TEMPLATES,
      matrices: INITIAL_MATRICES,
      plans: INITIAL_PLANS,
      requests: INITIAL_REQUESTS,
      library: INITIAL_LIBRARY
    };
  }

  // Load or seed
  const templatesRaw = localStorage.getItem(KEYS.TEMPLATES);
  const matricesRaw = localStorage.getItem(KEYS.MATRICES);
  const plansRaw = localStorage.getItem(KEYS.PLANS);
  const requestsRaw = localStorage.getItem(KEYS.REQUESTS);
  const libraryRaw = localStorage.getItem(KEYS.LIBRARY);

  const templates: AuditTemplate[] = templatesRaw ? JSON.parse(templatesRaw) : INITIAL_TEMPLATES;
  const matrices: DecisionMatrix[] = matricesRaw ? JSON.parse(matricesRaw) : INITIAL_MATRICES;
  const plans: AuditPlan[] = plansRaw ? JSON.parse(plansRaw) : INITIAL_PLANS;
  const requests: AuditRequest[] = requestsRaw ? JSON.parse(requestsRaw) : INITIAL_REQUESTS;
  const library: LibraryDocument[] = libraryRaw ? JSON.parse(libraryRaw) : INITIAL_LIBRARY;

  if (!templatesRaw) localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
  if (!matricesRaw) localStorage.setItem(KEYS.MATRICES, JSON.stringify(INITIAL_MATRICES));
  if (!plansRaw) localStorage.setItem(KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
  if (!requestsRaw) localStorage.setItem(KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  if (!libraryRaw) localStorage.setItem(KEYS.LIBRARY, JSON.stringify(INITIAL_LIBRARY));

  return { templates, matrices, plans, requests, library };
}

export function saveTemplates(templates: AuditTemplate[]) {
  localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
}

export function saveMatrices(matrices: DecisionMatrix[]) {
  localStorage.setItem(KEYS.MATRICES, JSON.stringify(matrices));
}

export function savePlans(plans: AuditPlan[]) {
  localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
}

export function saveRequests(requests: AuditRequest[]) {
  localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));
}

export function saveLibrary(library: LibraryDocument[]) {
  localStorage.setItem(KEYS.LIBRARY, JSON.stringify(library));
}
