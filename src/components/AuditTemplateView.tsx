import React, { useState } from 'react';
import { AuditTemplate } from '../types';
import { AUDIT_TYPES, COORDINATORS, PROCESSES } from '../data';
import { Edit2, Eye, Search, Plus, ArrowLeft, Download, Check, X } from 'lucide-react';

interface AuditTemplateViewProps {
  templates: AuditTemplate[];
  onAddTemplate: (temp: AuditTemplate) => void;
  onUpdateTemplate: (temp: AuditTemplate) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'warning') => void;
}

export default function AuditTemplateView({
  templates,
  onAddTemplate,
  onUpdateTemplate,
  showToast
}: AuditTemplateViewProps) {
  // Views navigation
  // 'list' | 'create' | 'edit' | 'view'
  const [currentMode, setCurrentMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedTab, setSelectedTab] = useState<'my' | 'all'>('my');
  const [searchColumn, setSearchColumn] = useState<string>('name'); // 'name' | 'auditType' | 'status'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<AuditTemplate | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    auditType: string;
    appliesTo: string;
    coordinators: string[];
    status: boolean;
  }>({
    name: '',
    auditType: '5S Audit',
    appliesTo: 'Manufacturing',
    coordinators: [],
    status: true
  });

  // Multiselect dropdown helpers
  const [showCoordDropdown, setShowCoordDropdown] = useState(false);

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    // Audit templates tab filter: "My" can be filtered by createdBy == NBC Admin
    const matchesTab = selectedTab === 'all' || t.createdBy === 'NBC Admin';
    
    let textToMatch = '';
    if (searchColumn === 'name') textToMatch = t.name;
    else if (searchColumn === 'auditType') textToMatch = t.auditType;
    else if (searchColumn === 'status') textToMatch = t.status ? 'active' : 'inactive';

    const matchesSearch = textToMatch.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleExport = () => {
    // Generate CSV contents
    const headers = ['ID', 'Template Name', 'Audit Type', 'Applies To', 'Coordinators', 'Status', 'Created At'];
    const rows = filteredTemplates.map((t) => [
      t.id,
      t.name,
      t.auditType,
      t.appliesTo,
      t.coordinators.join('; '),
      t.status ? 'Active' : 'Inactive',
      t.createdAt
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `QMS_Audit_Templates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Exported template directory to CSV!', 'success');
  };

  const openCreateMode = () => {
    setFormData({
      name: '',
      auditType: '5S Audit',
      appliesTo: 'Manufacturing',
      coordinators: ['NBC Admin (nbcadmin)'],
      status: true
    });
    setCurrentMode('create');
  };

  const openEditMode = (t: AuditTemplate) => {
    setFormData({
      id: t.id,
      name: t.name,
      auditType: t.auditType,
      appliesTo: t.appliesTo,
      coordinators: [...t.coordinators],
      status: t.status
    });
    setCurrentMode('edit');
  };

  const openViewMode = (t: AuditTemplate) => {
    setSelectedTemplate(t);
    setCurrentMode('view');
  };

  const toggleCoordinator = (coord: string) => {
    const isSelected = formData.coordinators.includes(coord);
    if (isSelected) {
      setFormData({
        ...formData,
        coordinators: formData.coordinators.filter((c) => c !== coord)
      });
    } else {
      setFormData({
        ...formData,
        coordinators: [...formData.coordinators, coord]
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Template name is required.', 'warning');
      return;
    }
    if (formData.coordinators.length === 0) {
      showToast('Select at least one coordinator.', 'warning');
      return;
    }

    if (currentMode === 'create') {
      const newTemplate: AuditTemplate = {
        id: `AT-0${templates.length + 1}`,
        name: formData.name,
        auditType: formData.auditType,
        appliesTo: formData.appliesTo,
        coordinators: formData.coordinators,
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'NBC Admin'
      };
      onAddTemplate(newTemplate);
      showToast(`Audit Template "${formData.name}" created successfully.`, 'success');
    } else if (currentMode === 'edit') {
      const updatedTemplate: AuditTemplate = {
        id: formData.id!,
        name: formData.name,
        auditType: formData.auditType,
        appliesTo: formData.appliesTo,
        coordinators: formData.coordinators,
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0], // update date
        createdBy: 'NBC Admin'
      };
      onUpdateTemplate(updatedTemplate);
      showToast(`Audit Template "${formData.name}" updated successfully.`, 'success');
    }

    setCurrentMode('list');
  };

  return (
    <div className="space-y-6" id="audit-template-view-container">
      {currentMode === 'list' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Action Button */}
          <div className="flex justify-between items-center bg-white/20 p-4 rounded-xl border border-white/35 shadow-xs">
            <div>
              <h2 className="text-lg font-extrabold text-slate-805">QMS Audit Template Library</h2>
              <p className="text-xs text-slate-550 font-bold">Standardized custom audit checklist blueprints for scheduled runs</p>
            </div>
            {/* Blue custom Create Audit Template button */}
            <button
              onClick={openCreateMode}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
              id="btn-create-audit-template"
            >
              <Plus className="w-4 h-4 text-white" /> Create Audit Template
            </button>
          </div>

          {/* Tab Selection Navigation */}
          <div className="flex border-b border-white/20 whitespace-nowrap">
            <button
              onClick={() => setSelectedTab('my')}
              className={`px-5 py-2.5 text-sm font-bold border-b-3 transition-all cursor-pointer ${
                selectedTab === 'my'
                  ? 'border-blue-600 text-blue-700 font-extrabold bg-white/30 rounded-t-lg'
                  : 'border-transparent text-slate-550 hover:text-slate-805 hover:bg-white/10 rounded-t-lg'
              }`}
            >
              My Audit Templates
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-5 py-2.5 text-sm font-bold border-b-3 transition-all cursor-pointer ${
                selectedTab === 'all'
                  ? 'border-blue-600 text-blue-700 font-extrabold bg-white/30 rounded-t-lg'
                  : 'border-transparent text-slate-550 hover:text-slate-805 hover:bg-white/10 rounded-t-lg'
              }`}
            >
              All Audit Templates
            </button>
          </div>

          {/* Search bar + export in line */}
          <div className="glass-card p-3 rounded-xl border border-white/25 flex items-center gap-3">
            <div className="min-w-[160px] shrink-0">
              <select
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 bg-white/40 border border-white/30 rounded-lg text-slate-755 focus:outline-none"
              >
                <option value="name">Search Name</option>
                <option value="auditType">Search Audit Type</option>
                <option value="status">Search Status</option>
              </select>
            </div>
            
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-500" />
              </span>
              <input
                type="text"
                value={searchQuery}
                placeholder="Search matching template criteria..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 bg-[#ffffff45] border border-white/25 rounded-lg focus:outline-none focus:bg-white/70 text-slate-805"
              />
            </div>

            <button
              onClick={handleExport}
              title="Export to CSV"
              className="p-2 border border-white/60 bg-white/40 hover:bg-white/60 rounded-lg text-blue-700 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Table list */}
          <div className="glass-card rounded-xl overflow-hidden shadow-xs border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/30 text-slate-655 text-xs font-extrabold border-b border-white/25">
                    <th className="py-4 px-6 w-24">Actions</th>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Audit Type</th>
                    <th className="py-4 px-6">Coordinators</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/15">
                  {filteredTemplates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500 font-bold text-sm">
                        No templates found in active view.
                      </td>
                    </tr>
                  ) : (
                    filteredTemplates.map((item) => (
                      <tr key={item.id} className="hover:bg-white/25 transition-colors text-sm">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5">
                            {/* Orange outline square edit icon */}
                            <button
                              onClick={() => openEditMode(item)}
                              title="Edit Template"
                              className="p-1.5 border border-amber-300 text-amber-700 bg-amber-500/10 hover:bg-amber-500/25 rounded-md transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {/* Green outline square view icon */}
                            <button
                              onClick={() => openViewMode(item)}
                              title="View Details"
                              className="p-1.5 border border-green-300 text-green-700 bg-green-500/10 hover:bg-green-500/25 rounded-md transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-805">
                          {item.name}
                        </td>
                        <td className="py-4 px-6 text-slate-705 font-semibold">
                          {item.auditType}
                        </td>
                        <td className="py-4 px-6 text-slate-550 text-xs font-bold">
                          {item.coordinators.join(', ')}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            item.status 
                              ? 'bg-green-100 text-green-800 border-green-200/50 shadow-xs' 
                              : 'bg-white/45 text-slate-550 border-white/55'
                          }`}>
                            {item.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer Summary bar */}
            <div className="px-6 py-3 border-t border-white/20 text-xs text-slate-550 font-bold flex items-center justify-between">
              <span>Showing {filteredTemplates.length} matching templates</span>
              <span className="font-mono">Catalog Code: QMS-T-DIR</span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE & EDIT FORM MODES */}
      {(currentMode === 'create' || currentMode === 'edit') && (
        <div className="glass-card-heavy rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-150">
          
          {/* Header Action bar */}
          <div className="px-6 py-4 border-b border-white/30 bg-white/20 flex items-center justify-between">
            <button
              onClick={() => setCurrentMode('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to listing
            </button>
            <h2 className="text-sm font-bold text-slate-800">
              {currentMode === 'create' ? 'Create Audit Template' : 'Edit Audit Template'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            
            <div className="border border-blue-500/20 rounded-lg bg-blue-500/5 p-5 space-y-5">
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Temp Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter template name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm text-slate-805 placeholder-slate-450 focus:outline-none"
                  />
                </div>

                {/* Audit Type select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Audit Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.auditType}
                    onChange={(e) => setFormData({ ...formData, auditType: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/40 text-slate-850 focus:outline-none"
                  >
                    {AUDIT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Applies To process */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Applies To <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.appliesTo}
                    onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/40 text-slate-850 focus:outline-none"
                  >
                    {PROCESSES.map((proc) => (
                      <option key={proc} value={proc}>{proc}</option>
                    ))}
                  </select>
                </div>

                {/* Coordinators multi checkbox selector */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-705 mb-1">
                    Coordinators <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCoordDropdown(!showCoordDropdown)}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm text-left bg-white/40 text-slate-800 flex justify-between items-center focus:outline-none"
                  >
                    <span className="truncate">
                      {formData.coordinators.length === 0 
                        ? 'Select coordinators' 
                        : formData.coordinators.join(', ')}
                    </span>
                    <span className="text-[10px] text-slate-500">▼</span>
                  </button>

                  {showCoordDropdown && (
                    <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-white/60 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto divide-y divide-white/20">
                      {COORDINATORS.map((coord) => {
                        const active = formData.coordinators.includes(coord);
                        return (
                          <div
                            key={coord}
                            onClick={() => toggleCoordinator(coord)}
                            className="p-2.5 hover:bg-white/40 flex items-center justify-between text-sm cursor-pointer font-semibold text-slate-800"
                          >
                            <span>{coord}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              active ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-350'
                            }`}>
                              {active && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                            </div>
                          </div>
                        );
                      })}
                      <div className="p-1 px-2.5 bg-white/50 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowCoordDropdown(false)}
                          className="text-[10px] text-blue-600 font-bold"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status custom design toggle switch */}
                <div className="flex items-center gap-6 py-2">
                  <span className="text-xs font-bold text-slate-705">Status</span>
                  <label className="inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-white/55 peer-focus:outline-white/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-semibold text-slate-500">
                      {formData.status ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>

              </div>
            </div>

            <div className="pt-4 border-t border-white/30 flex justify-end gap-3">
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
                {currentMode === 'create' ? 'Save Design' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* VIEW PANEL DETAILS MODE */}
      {currentMode === 'view' && selectedTemplate && (
        <div className="glass-card-heavy rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-150">
          
          <div className="px-6 py-4 border-b border-white/30 bg-white/20 flex items-center justify-between">
            <button
              onClick={() => setCurrentMode('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to listing
            </button>
            <span className="text-xs text-slate-500 font-mono">ID: {selectedTemplate.id}</span>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-blue-700 bg-blue-500/15 px-2 py-1 rounded border border-blue-500/20">
                  {selectedTemplate.auditType}
                </span>
                <h2 className="text-2xl font-bold text-slate-805 mt-2">
                  {selectedTemplate.name}
                </h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                selectedTemplate.status ? 'bg-green-100 text-green-800 border-green-200/30' : 'bg-white/45 text-slate-500 border-white/50'
              }`}>
                {selectedTemplate.status ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/30">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-slate-450 uppercase font-bold tracking-wider">Applies To Process</h4>
                  <p className="text-sm text-slate-750 mt-1 font-bold">{selectedTemplate.appliesTo}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-455 uppercase font-bold tracking-wider">Created By</h4>
                  <p className="text-sm text-slate-750 mt-1 font-bold">{selectedTemplate.createdBy}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-slate-450 uppercase font-bold tracking-wider">Assigned Coordinators</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedTemplate.coordinators.map((c) => (
                      <span key={c} className="px-2.5 py-0.5 bg-white/60 border border-white/85 rounded-full text-xs text-slate-750 font-bold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs text-slate-450 uppercase font-bold tracking-wider font-mono">Registration Date</h4>
                  <p className="text-sm text-slate-755 mt-1 font-bold font-mono">{selectedTemplate.createdAt}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/30 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditMode(selectedTemplate)}
                className="px-4 py-2 border border-amber-300 bg-amber-500/10 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                Modify Template
              </button>
              <button
                onClick={() => setCurrentMode('list')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-bold transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
