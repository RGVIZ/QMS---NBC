import React, { useState } from 'react';
import { AuditRequest } from '../types';
import { AUDIT_TYPES } from '../data';
import { Edit2, Eye, Search, Plus, ArrowLeft, Download, Check, X, ShieldAlert, Sparkles, Send } from 'lucide-react';

interface AuditRequestViewProps {
  requests: AuditRequest[];
  onAddRequest: (r: AuditRequest) => void;
  onUpdateRequest: (r: AuditRequest) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'warning') => void;
}

export default function AuditRequestView({
  requests,
  onAddRequest,
  onUpdateRequest,
  showToast
}: AuditRequestViewProps) {
  const [currentMode, setCurrentMode] = useState<'list' | 'create' | 'view'>('list');
  const [selectedTab, setSelectedTab] = useState<'my' | 'all'>('all');
  const [searchColumn, setSearchColumn] = useState<string>('title'); // 'title' | 'department' | 'requestorName'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AuditRequest | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    auditType: '5S Audit',
    department: '',
    proposedDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    reason: '',
    requestorName: 'NBC Admin (nbcadmin)'
  });

  const filteredRequests = requests.filter((r) => {
    // Tab filter
    const matchesTab = selectedTab === 'all' || r.requestorName.includes('NBC Admin');

    let textToMatch = '';
    if (searchColumn === 'title') textToMatch = r.title;
    else if (searchColumn === 'department') textToMatch = r.department;
    else if (searchColumn === 'requestorName') textToMatch = r.requestorName;

    const matchesSearch = textToMatch.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleExport = () => {
    const headers = ['Request ID', 'Title', 'Audit Type', 'Department', 'Proposed Date', 'Priority', 'Requestor', 'Status'];
    const rows = filteredRequests.map((r) => [
      r.id,
      r.title,
      r.auditType,
      r.department,
      r.proposedDate,
      r.priority,
      r.requestorName,
      r.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `QMS_Audit_Requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported list of audit request proposals to CSV!', 'success');
  };

  const handleApprove = (req: AuditRequest) => {
    const updated = { ...req, status: 'Approved' as const };
    onUpdateRequest(updated);
    showToast(`Audit request "${req.title}" approved! Calendar event scheduled automatically.`, 'success');
  };

  const handleReject = (req: AuditRequest) => {
    const updated = { ...req, status: 'Rejected' as const };
    onUpdateRequest(updated);
    showToast(`Audit request "${req.title}" marked as Rejected.`, 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Request title is required.', 'warning');
      return;
    }
    if (!formData.department.trim()) {
      showToast('Department is required.', 'warning');
      return;
    }
    if (!formData.reason.trim()) {
      showToast('Please state a valid rationale/objective.', 'warning');
      return;
    }

    const newRequest: AuditRequest = {
      id: `AR-0${requests.length + 1}`,
      title: formData.title,
      auditType: formData.auditType,
      department: formData.department,
      proposedDate: formData.proposedDate || new Date().toISOString().split('T')[0],
      priority: formData.priority,
      reason: formData.reason,
      requestorName: formData.requestorName,
      status: 'Pending Approval',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddRequest(newRequest);
    showToast(`Audit Proposal request "${formData.title}" submitted successfully for Approval Review!`, 'success');
    setCurrentMode('list');
  };

  return (
    <div className="space-y-6" id="audit-requests-view">
      {currentMode === 'list' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="flex justify-between items-center bg-white/20 p-4 rounded-xl border border-white/35 shadow-xs">
            <div>
              <h2 className="text-lg font-extrabold text-slate-805">Audit Adhoc Request Management</h2>
              <p className="text-xs text-slate-550 font-bold">Propose new internal and client evaluations for panel approval</p>
            </div>
            {/* Blue customized submit button */}
            <button
              onClick={() => {
                setFormData({
                  title: '',
                  auditType: '5S Audit',
                  department: 'Operations & Engineering',
                  proposedDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
                  priority: 'Medium',
                  reason: '',
                  requestorName: 'NBC Admin (nbcadmin)'
                });
                setCurrentMode('create');
              }}
              className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
              id="btn-add-audit-request"
            >
              <Plus className="w-4 h-4 text-white" /> Submit Audit Request
            </button>
          </div>

          <div className="flex border-b border-white/20 whitespace-nowrap">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-5 py-2.5 text-sm font-bold border-b-3 transition-all cursor-pointer ${
                selectedTab === 'all'
                  ? 'border-blue-600 text-blue-700 font-extrabold bg-white/30 rounded-t-lg'
                  : 'border-transparent text-slate-550 hover:text-slate-805 hover:bg-white/10 rounded-t-lg'
              }`}
            >
              All Audit Requests
            </button>
            <button
              onClick={() => setSelectedTab('my')}
              className={`px-5 py-2.5 text-sm font-bold border-b-3 transition-all cursor-pointer ${
                selectedTab === 'my'
                  ? 'border-blue-600 text-blue-700 font-extrabold bg-white/30 rounded-t-lg'
                  : 'border-transparent text-slate-550 hover:text-slate-805 hover:bg-white/10 rounded-t-lg'
              }`}
            >
              My Submitted Requests
            </button>
          </div>

          <div className="glass-card p-3 rounded-xl border border-white/25 flex items-center gap-3">
            <div className="min-w-[160px] shrink-0">
              <select
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 bg-white/40 border border-white/30 rounded-lg text-slate-805 focus:outline-none"
              >
                <option value="title">Request Name</option>
                <option value="department">Department</option>
                <option value="requestorName">Requestor Name</option>
              </select>
            </div>
            
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-500" />
              </span>
              <input
                type="text"
                value={searchQuery}
                placeholder="Search matching request criteria..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 bg-[#ffffff45] border border-white/25 rounded-lg focus:outline-none focus:bg-white/70 text-slate-805"
              />
            </div>

            <button
              onClick={handleExport}
              title="Export to CSV"
              className="p-2 border border-white/60 bg-white/40 hover:bg-white/60 rounded-lg text-blue-700 flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Table container view listing grids */}
          <div className="glass-card rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/20 text-slate-505 text-xs font-bold border-b border-white/20">
                    <th className="py-4 px-6 w-32">Actions</th>
                    <th className="py-4 px-6">Request ID/Title</th>
                    <th className="py-4 px-6">Requester</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6">Priority</th>
                    <th className="py-4 px-6 font-mono">Proposed Date</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20 text-sm">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-450 font-semibold">
                        No submittal requests matches current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((item) => (
                      <tr key={item.id} className="hover:bg-white/20 transition-colors text-sm">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5">
                            {/* View detailed details */}
                            <button
                              onClick={() => {
                                setSelectedRequest(item);
                                setCurrentMode('view');
                              }}
                              title="View Proposal Details"
                              className="p-1.5 border border-green-200/50 text-green-600 hover:bg-green-500/10 rounded-md transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Direct Admin approving tool actions if state is pending */}
                            {item.status === 'Pending Approval' && (
                              <>
                                <button
                                  onClick={() => handleApprove(item)}
                                  title="Approve Recommendation"
                                  className="p-1.5 border border-blue-200/50 text-blue-600 hover:bg-blue-500/10 rounded-md transition-colors cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5 animate-pulse" />
                                </button>
                                <button
                                  onClick={() => handleReject(item)}
                                  title="Reject Proposal"
                                  className="p-1.5 border border-red-200/50 text-red-600 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[10px] text-slate-505 font-mono block font-bold">#{item.id}</span>
                          <span className="font-bold text-slate-805 truncate max-w-xs block">{item.title}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-705 font-extrabold text-xs">
                          {item.requestorName}
                        </td>
                        <td className="py-4 px-6 text-slate-705 text-xs font-semibold">
                          {item.department}
                        </td>
                        <td className="py-4 px-6 text-xs">
                          <span className={`px-2 py-0.5 rounded-md font-bold border ${
                            item.priority === 'Critical' ? 'bg-red-100 text-red-850 border-red-200' :
                            item.priority === 'High' ? 'bg-orange-100 text-orange-850 border-orange-200' :
                            item.priority === 'Medium' ? 'bg-blue-100 text-blue-805 border-blue-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-550 font-bold">
                          {item.proposedDate}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-sans border ${
                            item.status === 'Approved' ? 'bg-green-100 text-green-850 border-green-200' :
                            item.status === 'Rejected' ? 'bg-red-100 text-red-850 border-red-300' :
                            'bg-orange-100 text-orange-855 border-orange-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 border-t border-white/20 text-xs text-slate-500 font-bold flex items-center justify-between">
              <span>Showing {filteredRequests.length} candidate requests</span>
              <span className="font-mono">Reference Code: QMS-REQ-C</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION FORM TO ADD NEW ADHOC AUDIT PROPOSAL */}
      {currentMode === 'create' && (
        <div className="glass-card-heavy rounded-xl shadow-lg border border-white/30 overflow-hidden animate-in fade-in duration-150">
          
          <div className="px-6 py-4 border-b border-white/20 bg-white/20 flex items-center justify-between border-dashed">
            <button
              onClick={() => setCurrentMode('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Cancel Proposal Submission
            </button>
            <h2 className="text-sm font-bold text-slate-805 font-mono bg-white/40 px-3 py-1 rounded border border-white/50">
              Submit New Audit Proposal
            </h2>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            
            <div className="border border-white/20 rounded-lg bg-white/25 p-5 space-y-5">
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4 text-blue-600" /> Request Specifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-705 mb-1 animate-pulse">
                    Request Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assembly Core Section Checklist Review"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm text-slate-800 placeholder-slate-455 focus:outline-none"
                  />
                </div>

                {/* Audit categories */}
                <div>
                  <label className="block text-xs font-bold text-slate-705 mb-1">Select Audit Type *</label>
                  <select
                    value={formData.auditType}
                    onChange={(e) => setFormData({ ...formData, auditType: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/45 text-slate-805 focus:outline-none"
                  >
                    {AUDIT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-705 mb-1">Requesting Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Quality Operations, Procurement"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm text-slate-800 placeholder-slate-455 focus:outline-none"
                  />
                </div>

                {/* Proposed Target Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-705 mb-1">Proposed Checklist Target Date</label>
                  <input
                    type="date"
                    value={formData.proposedDate}
                    onChange={(e) => setFormData({ ...formData, proposedDate: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/45 text-slate-805 focus:outline-none"
                  />
                </div>

                {/* Request priority */}
                <div>
                  <label className="block text-xs font-bold text-slate-705 mb-1 font-mono">Submission Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/45 text-slate-805 focus:outline-none font-bold"
                  >
                    <option value="Low">Low (Routine Calibration)</option>
                    <option value="Medium">Medium (Scheduled Standard)</option>
                    <option value="High">High (Ad-Hoc Issue Prevention)</option>
                    <option value="Critical">Critical (Immediate Production Halt Risk)</option>
                  </select>
                </div>

                {/* Requestor Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-705 mb-1">Requester Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.requestorName}
                    onChange={(e) => setFormData({ ...formData, requestorName: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm text-slate-800 focus:outline-none"
                  />
                </div>

                {/* Rationale reason scope */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-705 mb-1">Rationale / Scope / Key Defect Observed *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Kindly describe why this ad-hoc evaluation is needed, any defect or incident observed, or specific visual guidelines..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm text-slate-800 focus:outline-none placeholder-slate-455"
                  ></textarea>
                </div>

              </div>
            </div>

            <div className="pt-4 border-t border-white/20 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCurrentMode('list')}
                className="px-5 py-2 border border-white/60 text-slate-655 rounded-lg text-sm font-semibold hover:bg-white/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Forward to Board Review
              </button>
            </div>

          </form>
        </div>
      )}

      {/* READ ONLY REQUEST DETAIL DISPLAY PANEL */}
      {currentMode === 'view' && selectedRequest && (
        <div className="glass-card-heavy rounded-xl border border-white/30 shadow-lg overflow-hidden animate-in fade-in duration-150">
          
          <div className="px-6 py-4 border-b border-white/20 bg-white/20 flex items-center justify-between">
            <button
              onClick={() => setCurrentMode('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to proposal logs
            </button>
            <span className="text-xs text-slate-550 font-mono">CODE: {selectedRequest.id}</span>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className={`px-2.5 py-1 rounded text-xs font-extrabold inline-block border ${
                  selectedRequest.priority === 'Critical' ? 'bg-red-100 text-red-850 border-red-200' :
                  selectedRequest.priority === 'High' ? 'bg-orange-100 text-orange-850 border-orange-200' :
                  'bg-blue-100 text-blue-805 border-blue-200'
                }`}>
                  Priority {selectedRequest.priority}
                </span>

                <h2 className="text-xl font-extrabold text-slate-805 mt-3">
                  {selectedRequest.title}
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  Submission Category: <span className="font-bold text-slate-705">{selectedRequest.auditType}</span>
                </div>
              </div>

              <span className={`px-3.5 py-1 rounded-full text-xs font-bold border leading-none ${
                selectedRequest.status === 'Approved' ? 'bg-green-100 text-green-850 border-green-200' :
                selectedRequest.status === 'Rejected' ? 'bg-red-100 text-red-850 border-red-200' :
                'bg-orange-100 text-orange-855 border-orange-200'
              }`}>
                {selectedRequest.status}
              </span>
            </div>

            <div className="p-4 bg-white/25 border border-white/25 rounded-xl space-y-2">
              <h4 className="text-xs font-extrabold text-slate-505 uppercase tracking-widest">Stated Reason / Findings</h4>
              <p className="text-sm text-slate-800 font-semibold font-sans leading-relaxed">{selectedRequest.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/20 border border-white/20 rounded-lg">
                <span className="text-xs text-slate-455 block font-bold">Requestor Branch</span>
                <span className="text-sm font-bold text-slate-755 block mt-0.5">{selectedRequest.requestorName}</span>
              </div>
              <div className="p-3 bg-white/20 border border-white/20 rounded-lg font-mono">
                <span className="text-xs text-slate-455 block font-bold">Proposed Date</span>
                <span className="text-sm font-bold text-slate-755 block mt-0.5">{selectedRequest.proposedDate}</span>
              </div>
            </div>

            {/* If pending, let admins make dynamic adjustments right inside detail page */}
            {selectedRequest.status === 'Pending Approval' && (
              <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-xs text-slate-705 font-bold leading-relaxed">
                    This request proposal is in queue. Verify compliance requirements and execute response calibrations.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      handleReject(selectedRequest);
                      setCurrentMode('list');
                    }}
                    className="px-3 py-1.5 bg-white/80 border border-red-300 text-red-700 hover:bg-white rounded text-xs font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                  >
                    Reject proposal
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedRequest);
                      setCurrentMode('list');
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded text-xs flex items-center gap-0.5 transition-all shadow-sm cursor-pointer"
                  >
                    Approve Request
                  </button>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-white/20 flex items-center justify-end">
              <button
                onClick={() => setCurrentMode('list')}
                className="px-5 py-2 bg-slate-805 text-white hover:bg-slate-900 text-sm font-bold rounded-lg transition-colors cursor-pointer"
              >
                Close details form
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

