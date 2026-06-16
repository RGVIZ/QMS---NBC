import React, { useState } from 'react';
import { AuditPlan, AuditTemplate } from '../types';
import { COORDINATORS, PLANTS, FINANCIAL_YEARS } from '../data';
import { Edit2, Eye, Search, Plus, ArrowLeft, Download, Calendar, Users, Briefcase } from 'lucide-react';

interface AuditPlanViewProps {
  plans: AuditPlan[];
  templates: AuditTemplate[];
  onAddPlan: (p: AuditPlan) => void;
  onUpdatePlan: (p: AuditPlan) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'warning') => void;
}

export default function AuditPlanView({
  plans,
  templates,
  onAddPlan,
  onUpdatePlan,
  showToast
}: AuditPlanViewProps) {
  const [currentMode, setCurrentMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedTab, setSelectedTab] = useState<'my' | 'all'>('all');
  const [searchColumn, setSearchColumn] = useState<string>('planName'); // 'planName' | 'plant' | 'leadAuditor'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<AuditPlan | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    id?: string;
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
  }>({
    planName: '',
    templateId: templates[0]?.id || '',
    plant: 'Chennai Plant - Sector 1',
    leadAuditor: 'Jane Smith (janesmith)',
    auditorTeam: [],
    financialYear: 'FY 2025-26',
    targetStartDate: '',
    targetEndDate: '',
    scope: '',
    status: 'Planned'
  });

  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  const filteredPlans = plans.filter((p) => {
    // Tab filter
    const matchesTab = selectedTab === 'all' || p.leadAuditor.includes('NBC Admin') || p.createdBy?.includes('NBC Admin');

    let textToMatch = '';
    if (searchColumn === 'planName') textToMatch = p.planName;
    else if (searchColumn === 'plant') textToMatch = p.plant;
    else if (searchColumn === 'leadAuditor') textToMatch = p.leadAuditor;

    const matchesSearch = textToMatch.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleExport = () => {
    const headers = ['ID', 'Plan Name', 'Plant', 'Lead Auditor', 'FY', 'Start Date', 'End Date', 'Status'];
    const rows = filteredPlans.map((p) => [
      p.id,
      p.planName,
      p.plant,
      p.leadAuditor,
      p.financialYear,
      p.targetStartDate,
      p.targetEndDate,
      p.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `QMS_Audit_Plans_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported list of scheduled audit plans to CSV!', 'success');
  };

  const openCreateMode = () => {
    setFormData({
      planName: '',
      templateId: templates[0]?.id || '',
      plant: 'Chennai Plant - Sector 1',
      leadAuditor: 'NBC Admin (nbcadmin)',
      auditorTeam: ['Jane Smith (janesmith)'],
      financialYear: 'FY 2025-26',
      targetStartDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days in future
      targetEndDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days in future
      scope: '',
      status: 'Planned'
    });
    setCurrentMode('create');
  };

  const openEditMode = (p: AuditPlan) => {
    setFormData({
      id: p.id,
      planName: p.planName,
      templateId: p.templateId,
      plant: p.plant,
      leadAuditor: p.leadAuditor,
      auditorTeam: [...p.auditorTeam],
      financialYear: p.financialYear,
      targetStartDate: p.targetStartDate,
      targetEndDate: p.targetEndDate,
      scope: p.scope,
      status: p.status
    });
    setCurrentMode('edit');
  };

  const openViewMode = (p: AuditPlan) => {
    setSelectedPlan(p);
    setCurrentMode('view');
  };

  const toggleTeamMember = (member: string) => {
    if (formData.auditorTeam.includes(member)) {
      setFormData({
        ...formData,
        auditorTeam: formData.auditorTeam.filter((m) => m !== member)
      });
    } else {
      setFormData({
        ...formData,
        auditorTeam: [...formData.auditorTeam, member]
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.planName.trim()) {
      showToast('Plan name is required.', 'warning');
      return;
    }
    if (!formData.scope.trim()) {
      showToast('Please summarize scope descriptions.', 'warning');
      return;
    }

    if (currentMode === 'create') {
      const newPlan: AuditPlan = {
        id: `AP-0${plans.length + 1}`,
        planName: formData.planName,
        templateId: formData.templateId,
        plant: formData.plant,
        leadAuditor: formData.leadAuditor,
        auditorTeam: formData.auditorTeam,
        financialYear: formData.financialYear,
        targetStartDate: formData.targetStartDate,
        targetEndDate: formData.targetEndDate,
        scope: formData.scope,
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'NBC Admin'
      };
      onAddPlan(newPlan);
      showToast(`Audit Plan "${formData.planName}" scheduled successfully.`, 'success');
    } else if (currentMode === 'edit') {
      const updatedPlan: AuditPlan = {
        id: formData.id!,
        planName: formData.planName,
        templateId: formData.templateId,
        plant: formData.plant,
        leadAuditor: formData.leadAuditor,
        auditorTeam: formData.auditorTeam,
        financialYear: formData.financialYear,
        targetStartDate: formData.targetStartDate,
        targetEndDate: formData.targetEndDate,
        scope: formData.scope,
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'NBC Admin'
      };
      onUpdatePlan(updatedPlan);
      showToast(`Audit Plan "${formData.planName}" updated successfully.`, 'success');
    }

    setCurrentMode('list');
  };

  return (
    <div className="space-y-6" id="audit-plans-view">
      {currentMode === 'list' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="flex justify-between items-center">
            <button
              onClick={openCreateMode}
              className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-all flex items-center lg:gap-2 shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
              id="btn-create-audit-plan"
            >
              <Plus className="w-4 h-4" /> Schedule New Audit Plan
            </button>
          </div>

          <div className="flex border-b border-white/20 gap-1">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                selectedTab === 'all'
                  ? 'border-blue-600 text-blue-800 bg-white/30 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/10 rounded-t-lg'
              }`}
            >
              All Audit Plans
            </button>
            <button
              onClick={() => setSelectedTab('my')}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                selectedTab === 'my'
                  ? 'border-blue-600 text-blue-800 bg-white/30 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/10 rounded-t-lg'
              }`}
            >
              My Audit Plans (Lead)
            </button>
          </div>

          <div className="glass-card p-3 rounded-xl flex items-center gap-3">
            <div className="min-w-[150px] shrink-0">
              <select
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 bg-white/40 border border-white/50 rounded-lg text-slate-800 font-medium focus:outline-none"
              >
                <option value="planName">Search Name</option>
                <option value="plant">Facility Location</option>
                <option value="leadAuditor">Lead Auditor</option>
              </select>
            </div>
            
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-500" />
              </span>
              <input
                type="text"
                value={searchQuery}
                placeholder="Select Column to Search..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 bg-white/40 border border-white/55 rounded-lg focus:outline-none focus:bg-white/70 text-slate-900 placeholder-slate-455"
              />
            </div>

            <button
              onClick={handleExport}
              title="Export to CSV"
              className="p-2 border border-white/60 bg-white/40 rounded-lg hover:bg-white/60 text-blue-600 flex items-center justify-center transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="glass-card rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/20 text-slate-505 text-xs font-bold border-b border-white/20">
                    <th className="py-4 px-6 w-24">Actions</th>
                    <th className="py-4 px-6">Plan Name</th>
                    <th className="py-4 px-6">Plant Location</th>
                    <th className="py-4 px-6">Lead Auditor</th>
                    <th className="py-4 px-6 font-mono">Target Period</th>
                    <th className="py-4 px-6 text-center">Execution Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        No scheduled audit plans found.
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((item) => (
                      <tr key={item.id} className="hover:bg-white/20 transition-colors text-sm">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditMode(item)}
                              title="Edit Plan"
                              className="p-1.5 border border-amber-200/50 text-amber-600 hover:bg-amber-500/10 rounded-md transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openViewMode(item)}
                              title="View Scope"
                              className="p-1.5 border border-green-200/50 text-green-600 hover:bg-green-500/10 rounded-md transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-805">
                          {item.planName}
                        </td>
                        <td className="py-4 px-6 text-slate-705 font-semibold">
                          {item.plant}
                        </td>
                        <td className="py-4 px-6 text-slate-705 text-xs font-bold">
                          {item.leadAuditor}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-550 font-bold font-mono">
                          {item.targetStartDate} to {item.targetEndDate}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            item.status === 'Draft' ? 'bg-orange-100 text-orange-850 border-orange-200' :
                            item.status === 'Planned' ? 'bg-purple-100 text-purple-850 border-purple-200' :
                            item.status === 'In Progress' ? 'bg-blue-100 text-blue-850 border-blue-200' :
                            item.status === 'Completed' ? 'bg-green-100 text-green-850 border-green-200' :
                            'bg-red-100 text-red-850 border-red-200'
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
              <span>Showing {filteredPlans.length} active audit tasks</span>
              <span className="font-mono">Reference: QMS-PLAN-S</span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE & EDIT SCHEDULER FORM */}
      {(currentMode === 'create' || currentMode === 'edit') && (
        <div className="glass-card-heavy rounded-xl shadow-lg border border-white/30 overflow-hidden animate-in fade-in duration-150">
          
          <div className="px-6 py-4 border-b border-white/20 bg-white/20 flex items-center justify-between">
            <button
              onClick={() => setCurrentMode('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Close Plan Editor
            </button>
            <h2 className="text-sm font-bold text-slate-805 font-mono bg-white/40 px-3 py-1 rounded border border-white/50">
              {currentMode === 'create' ? 'Create Audit Plan' : 'Edit Audit Plan'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            
            <div className="border border-white/20 rounded-lg bg-white/25 p-5 space-y-5">
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600" /> Basic Planning Metrics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Plan Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-705 mb-1">
                    Plan/Audit Run Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q3 Automated Assembly Line 5S Inspection"
                    value={formData.planName}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm text-slate-800 placeholder-slate-455 focus:outline-none"
                  />
                </div>

                {/* Template ID drop check */}
                <div>
                  <label className="block text-xs font-bold text-slate-705 mb-1">
                    Underlying Audit Template <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.templateId}
                    onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/45 text-slate-800 focus:outline-none"
                  >
                    {templates.map((temp) => (
                      <option key={temp.id} value={temp.id}>{temp.name} ({temp.auditType})</option>
                    ))}
                  </select>
                </div>

                {/* Facility/Plant Selection dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-705 mb-1">
                    Facility Plant Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.plant}
                    onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/45 text-slate-800 focus:outline-none"
                  >
                    {PLANTS.map((pl) => (
                      <option key={pl} value={pl}>{pl}</option>
                    ))}
                  </select>
                </div>

                {/* Lead Auditor selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-705 mb-1">
                    Lead Auditor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.leadAuditor}
                    onChange={(e) => setFormData({ ...formData, leadAuditor: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/45 text-slate-800 focus:outline-none"
                  >
                    {COORDINATORS.map((coord) => (
                      <option key={coord} value={coord}>{coord}</option>
                    ))}
                  </select>
                </div>

                {/* Auditor Team multi selector dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-705 mb-1">
                    Auditor Team Members
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm text-left bg-white/45 text-slate-800 flex justify-between items-center focus:outline-none"
                  >
                    <span className="truncate text-slate-800">
                      {formData.auditorTeam.length === 0 
                        ? 'No joint team assigned' 
                        : formData.auditorTeam.join(', ')}
                    </span>
                    <span className="text-xs text-slate-500">▼</span>
                  </button>

                  {showTeamDropdown && (
                    <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-white/60 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto divide-y divide-white/20 animate-in fade-in zoom-in-95 duration-100">
                      {COORDINATORS.filter(c => c !== formData.leadAuditor).map((coord) => {
                        const active = formData.auditorTeam.includes(coord);
                        return (
                          <div
                            key={coord}
                            onClick={() => toggleTeamMember(coord)}
                            className="p-2.5 hover:bg-white/40 flex items-center justify-between text-sm cursor-pointer font-semibold text-slate-805"
                          >
                            <span>{coord}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              active ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-350'
                            }`}>
                              {active && <span className="text-[10px] font-extrabold text-white">✓</span>}
                            </div>
                          </div>
                        );
                      })}
                      <div className="p-1 px-2.5 bg-white/50 flex justify-end font-semibold">
                        <button
                          type="button"
                          onClick={() => setShowTeamDropdown(false)}
                          className="text-[11px] text-blue-605 font-bold cursor-pointer hover:underline"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fiscal planning calendar year selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-705 mb-1">
                    Target FY <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.financialYear}
                    onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/45 text-slate-805 focus:outline-none"
                  >
                    {FINANCIAL_YEARS.map((fy) => (
                      <option key={fy} value={fy}>{fy}</option>
                    ))}
                  </select>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-705 mb-1">
                    Execution State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/45 text-slate-805 focus:outline-none font-semibold"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Planned">Planned & Approved</option>
                    <option value="In Progress">In Progress (Active)</option>
                    <option value="Completed">Completed (Signed Off)</option>
                    <option value="Cancelled">Cancelled (Archived)</option>
                  </select>
                </div>

                {/* Date ranges */}
                <div>
                  <label className="block text-xs font-bold text-slate-705 mb-1">
                    Target Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={formData.targetStartDate}
                      onChange={(e) => setFormData({ ...formData, targetStartDate: e.target.value })}
                      className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/45 text-slate-805 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-705 mb-1">
                    Target End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.targetEndDate}
                    onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/45 text-slate-805 focus:outline-none"
                  />
                </div>

                {/* Scope area description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-705 mb-1">
                    Detailed Audit Scope / Focus Areas <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter the targeted audit zones, machines, standard procedures, documentation files or certification standards that must be verified in detail..."
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-500/20 cursor-pointer"
              >
                {currentMode === 'create' ? 'Lock Schedule' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* VIEW PLAN SCOPE DEEP DIVE */}
      {currentMode === 'view' && selectedPlan && (
        <div className="glass-card-heavy rounded-xl border border-white/30 shadow-lg overflow-hidden animate-in fade-in duration-150">
          
          <div className="px-6 py-4 border-b border-white/20 bg-white/20 flex items-center justify-between">
            <button
              onClick={() => setCurrentMode('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to list
            </button>
            <span className="text-xs text-slate-550 font-mono">Plan Hash Code: {selectedPlan.id}</span>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-805 bg-white/40 border border-white/60 px-2.5 py-1 rounded">
                  {selectedPlan.financialYear} &bull; Scheduled Run
                </span>
                <h2 className="text-2xl font-bold text-slate-805 mt-2.5">
                  {selectedPlan.planName}
                </h2>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                  Location Focus: <span className="font-bold text-slate-805">{selectedPlan.plant}</span>
                </p>
              </div>
              <span className={`px-3.5 py-1 rounded-full text-xs font-bold border ${
                selectedPlan.status === 'Draft' ? 'bg-orange-100 text-orange-850 border-orange-200' :
                selectedPlan.status === 'Planned' ? 'bg-purple-100 text-purple-850 border-purple-200' :
                selectedPlan.status === 'In Progress' ? 'bg-blue-100 text-blue-850 border-blue-200' :
                'bg-green-100 text-green-850 border-green-200'
              }`}>
                {selectedPlan.status}
              </span>
            </div>

            <div className="p-4 bg-white/25 rounded-lg border border-white/25">
              <h4 className="text-xs font-bold text-slate-505 uppercase tracking-wider mb-1.5">Stated Execution Scope</h4>
              <p className="text-sm text-slate-800 leading-relaxed font-semibold font-sans">{selectedPlan.scope}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-sm">
                  <span className="p-2 bg-white/30 rounded border border-white/40 text-slate-600"><Users className="w-4 h-4" /></span>
                  <div>
                    <span className="text-xs text-slate-455 block font-bold">Lead Auditor</span>
                    <span className="font-bold text-slate-755">{selectedPlan.leadAuditor}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-sm">
                  <span className="p-2 bg-white/30 rounded border border-white/40 text-slate-600"><Calendar className="w-4 h-4" /></span>
                  <div>
                    <span className="text-xs text-slate-455 block font-bold">Target Schedule Duration</span>
                    <span className="font-bold text-slate-755 font-mono text-xs">{selectedPlan.targetStartDate} to {selectedPlan.targetEndDate}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-505 block uppercase tracking-wider font-bold mb-1.5">Joint Assessment Team</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedPlan.auditorTeam.length === 0 ? (
                    <span className="text-xs text-slate-455 italic font-semibold">No additional auditors assigned. Solo task.</span>
                  ) : (
                    selectedPlan.auditorTeam.map((team) => (
                      <span key={team} className="px-2.5 py-0.5 bg-blue-600/10 text-blue-800 border border-blue-650/10 rounded-md text-xs font-extrabold">
                        {team}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/20 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditMode(selectedPlan)}
                className="px-4 py-2 border border-orange-300 bg-orange-500/10 text-orange-700 rounded-lg text-sm font-bold hover:bg-orange-505/20 transition-colors cursor-pointer"
              >
                Reschedule Plan
              </button>
              <button
                onClick={() => setCurrentMode('list')}
                className="px-4 py-2 bg-slate-805 text-white hover:bg-slate-900 rounded-lg text-sm font-bold transition-colors cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
