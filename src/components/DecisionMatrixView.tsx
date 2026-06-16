import React, { useState } from 'react';
import { DecisionMatrix } from '../types';
import { AUDIT_TYPES, COORDINATORS, PLANTS, PROCESSES, FINANCIAL_YEARS } from '../data';
import { Edit2, Eye, Search, Plus, ArrowLeft, Download, Trash2, Check, Scale } from 'lucide-react';

interface DecisionMatrixViewProps {
  matrices: DecisionMatrix[];
  onAddMatrix: (mat: DecisionMatrix) => void;
  onUpdateMatrix: (mat: DecisionMatrix) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'warning') => void;
}

export default function DecisionMatrixView({
  matrices,
  onAddMatrix,
  onUpdateMatrix,
  showToast
}: DecisionMatrixViewProps) {
  const [currentMode, setCurrentMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedTab, setSelectedTab] = useState<'my' | 'all'>('my');
  const [searchColumn, setSearchColumn] = useState<string>('name'); // 'name' | 'plant' | 'financialYear'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatrix, setSelectedMatrix] = useState<DecisionMatrix | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    financialYear: string;
    auditType: string;
    plant: string;
    process: string;
    appliesTo: string;
    coordinators: string[];
    criteria: Array<{ id: number; name: string; weight: number }>;
    status: boolean;
  }>({
    name: '',
    financialYear: 'FY 2025-26',
    auditType: '5S Audit',
    plant: 'Chennai Plant - Sector 1',
    process: 'Manufacturing',
    appliesTo: 'Manufacturing Lines',
    coordinators: [],
    criteria: [
      { id: 1, name: 'Process Cleanliness Checklist', weight: 40 },
      { id: 2, name: 'Documentation Adequacy Check', weight: 30 },
      { id: 3, name: 'Staff SOP Understanding Level', weight: 30 }
    ],
    status: true
  });

  // Multiselect dropdown helpers
  const [showCoordDropdown, setShowCoordDropdown] = useState(false);
  const [newCriteriaName, setNewCriteriaName] = useState('');
  const [newCriteriaWeight, setNewCriteriaWeight] = useState<number>(10);

  const filteredMatrices = matrices.filter((m) => {
    const matchesTab = selectedTab === 'all' || m.createdBy === 'NBC Admin';
    
    let textToMatch = '';
    if (searchColumn === 'name') textToMatch = m.name;
    else if (searchColumn === 'plant') textToMatch = m.plant;
    else if (searchColumn === 'financialYear') textToMatch = m.financialYear;

    const matchesSearch = textToMatch.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleExport = () => {
    const headers = ['ID', 'Matrix Name', 'Financial Year', 'Audit Type', 'Plant', 'Process', 'Applies To', 'Status'];
    const rows = filteredMatrices.map((m) => [
      m.id,
      m.name,
      m.financialYear,
      m.auditType,
      m.plant,
      m.process,
      m.appliesTo,
      m.status ? 'Active' : 'Inactive'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `QMS_Decision_Matrices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported matrix index to CSV!', 'success');
  };

  const openCreateMode = () => {
    setFormData({
      name: '',
      financialYear: 'FY 2025-26',
      auditType: '5S Audit',
      plant: 'Chennai Plant - Sector 1',
      process: 'Manufacturing',
      appliesTo: 'Manufacturing Lines',
      coordinators: ['NBC Admin (nbcadmin)'],
      criteria: [
        { id: 1, name: 'Sort (Seiri) - Level of organization', weight: 20 },
        { id: 2, name: 'Set in Order (Seiton) - Location efficiency', weight: 20 },
        { id: 3, name: 'Shine (Seiso) - Absolute Cleanliness', weight: 20 },
        { id: 4, name: 'Standardize (Seiketsu) - Routine integration', weight: 20 },
        { id: 5, name: 'Sustain (Shitsuke) - Training drills', weight: 20 }
      ],
      status: true
    });
    setCurrentMode('create');
  };

  const openEditMode = (m: DecisionMatrix) => {
    setFormData({
      id: m.id,
      name: m.name,
      financialYear: m.financialYear,
      auditType: m.auditType,
      plant: m.plant,
      process: m.process,
      appliesTo: m.appliesTo,
      coordinators: [...m.coordinators],
      criteria: m.criteria.map((c, idx) => ({ id: idx + 1, name: c.name, weight: c.weight })),
      status: m.status
    });
    setCurrentMode('edit');
  };

  const openViewMode = (m: DecisionMatrix) => {
    setSelectedMatrix(m);
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

  const addCriteriaItem = () => {
    if (!newCriteriaName.trim()) {
      showToast('Enter valid criteria name first.', 'warning');
      return;
    }
    const currentSum = formData.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (currentSum + newCriteriaWeight > 100) {
      showToast(`Warning: Weight sum would exceed 100%. Currently at ${currentSum}%.`, 'warning');
    }

    setFormData({
      ...formData,
      criteria: [
        ...formData.criteria,
        { id: Date.now(), name: newCriteriaName, weight: Number(newCriteriaWeight) }
      ]
    });
    setNewCriteriaName('');
    showToast(`Added criteria metric correctly!`, 'success');
  };

  const removeCriteriaItem = (id: number) => {
    setFormData({
      ...formData,
      criteria: formData.criteria.filter((c) => c.id !== id)
    });
  };

  const totalCriteriaWeight = formData.criteria.reduce((sum, c) => sum + c.weight, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Decision matrix name is required.', 'warning');
      return;
    }
    if (formData.coordinators.length === 0) {
      showToast('Select at least one coordinator.', 'warning');
      return;
    }
    if (totalCriteriaWeight !== 100) {
      showToast(`Criteria total weight must sum exactly to 100% (currently ${totalCriteriaWeight}%).`, 'warning');
      return;
    }

    const cleanCriteria = formData.criteria.map((c) => ({ name: c.name, weight: c.weight }));

    if (currentMode === 'create') {
      const newMat: DecisionMatrix = {
        id: `DM-0${matrices.length + 1}`,
        name: formData.name,
        financialYear: formData.financialYear,
        auditType: formData.auditType,
        plant: formData.plant,
        process: formData.process,
        appliesTo: formData.appliesTo,
        coordinators: formData.coordinators,
        criteria: cleanCriteria,
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'NBC Admin'
      };
      onAddMatrix(newMat);
      showToast(`Decision Matrix "${formData.name}" created successfully.`, 'success');
    } else if (currentMode === 'edit') {
      const updatedMat: DecisionMatrix = {
        id: formData.id!,
        name: formData.name,
        financialYear: formData.financialYear,
        auditType: formData.auditType,
        plant: formData.plant,
        process: formData.process,
        appliesTo: formData.appliesTo,
        coordinators: formData.coordinators,
        criteria: cleanCriteria,
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'NBC Admin'
      };
      onUpdateMatrix(updatedMat);
      showToast(`Decision Matrix "${formData.name}" updated successfully.`, 'success');
    }

    setCurrentMode('list');
  };

  return (
    <div className="space-y-6" id="decision-matrix-view">
      {currentMode === 'list' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="flex justify-between items-center">
            <button
              onClick={openCreateMode}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
              id="btn-create-decision-matrix"
            >
              <Plus className="w-4 h-4" /> Create Decision Matrix
            </button>
          </div>

          <div className="flex border-b border-white/20">
            <button
              onClick={() => setSelectedTab('my')}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                selectedTab === 'my'
                  ? 'border-blue-605 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              My Decision Matrices
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                selectedTab === 'all'
                  ? 'border-blue-605 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              All Decision Matrices
            </button>
          </div>

          {/* Search bar + export in line */}
          <div className="glass-card p-3.5 rounded-xl flex items-center gap-3">
            <div className="min-w-[150px] shrink-0">
              <select
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 bg-white/40 border border-white/60 rounded-lg text-slate-705 focus:outline-none"
              >
                <option value="name">Matrix Name</option>
                <option value="plant">Facility/Plant</option>
                <option value="financialYear">Financial Year</option>
              </select>
            </div>
            
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                placeholder="Select Column to Search..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 glass-input rounded-lg text-slate-850 placeholder-slate-455 focus:outline-none"
              />
            </div>

            <button
              onClick={handleExport}
              title="Export to CSV"
              className="p-2 border border-white/40 bg-white/30 hover:bg-white/60 rounded-lg text-blue-600 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          {/* Table container list */}
          <div className="glass-card rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/50 text-slate-500 text-xs font-bold border-b border-white/30">
                    <th className="py-4 px-6 w-24">Actions</th>
                    <th className="py-4 px-6">Matrix Name</th>
                    <th className="py-4 px-6">Plant Location</th>
                    <th className="py-4 px-6">Audit Type</th>
                    <th className="py-4 px-6">Financial Year</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredMatrices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500 font-medium">
                        No decision evaluation matrices found using current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMatrices.map((item) => (
                      <tr key={item.id} className="hover:bg-white/30 transition-colors text-sm">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditMode(item)}
                              title="Edit Matrix"
                              className="p-1.5 border border-amber-300 text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 rounded-md transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openViewMode(item)}
                              title="View Criteria Details"
                              className="p-1.5 border border-green-300 text-green-605 bg-green-500/10 hover:bg-green-500/20 rounded-md transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-805">
                          {item.name}
                        </td>
                        <td className="py-4 px-6 text-slate-700">
                          {item.plant}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {item.auditType}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-mono text-xs font-semibold">
                          {item.financialYear}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            item.status 
                              ? 'bg-blue-100 text-blue-800 border-blue-200/30' 
                              : 'bg-white/45 text-slate-500 border-white/50'
                          }`}>
                            {item.status ? 'Active' : 'Stopped'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 border-t border-white/20 text-xs text-slate-500 flex items-center justify-between">
              <span className="font-semibold">Displaying {filteredMatrices.length} decision calibration models</span>
              <span className="font-mono">Registered QMS ID: ISO-DM-M</span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE & EDIT FORM FOR DECISION MATRIX */}
      {(currentMode === 'create' || currentMode === 'edit') && (
        <div className="glass-card-heavy rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-150">
          
          <div className="px-6 py-4 border-b border-white/30 bg-white/20 flex items-center justify-between">
            <button
              onClick={() => setCurrentMode('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Matrix list
            </button>
            <h2 className="text-sm font-bold text-slate-800">
              {currentMode === 'create' ? 'Create Decision Matrix' : 'Edit Decision Matrix'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            
            <div className="border border-blue-500/20 rounded-lg bg-blue-500/5 p-5 space-y-5">
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter decision matrix name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm text-slate-800 placeholder-slate-455 focus:outline-none"
                  />
                </div>

                {/* Financial Year Selection input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Financial Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.financialYear}
                    onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/40 text-slate-800 focus:outline-none"
                  >
                    {FINANCIAL_YEARS.map((fy) => (
                      <option key={fy} value={fy}>{fy}</option>
                    ))}
                  </select>
                </div>

                {/* Audit Type selection input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Audit Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.auditType}
                    onChange={(e) => setFormData({ ...formData, auditType: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/40 text-slate-800 focus:outline-none"
                  >
                    {AUDIT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Facility/Plant selection input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Plant <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.plant}
                    onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/40 text-slate-800 focus:outline-none"
                  >
                    {PLANTS.map((pl) => (
                      <option key={pl} value={pl}>{pl}</option>
                    ))}
                  </select>
                </div>

                {/* Process and Applies to fields as requested */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Process <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.process}
                    onChange={(e) => setFormData({ ...formData, process: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/40 text-slate-800 focus:outline-none"
                  >
                    {PROCESSES.map((pr) => (
                      <option key={pr} value={pr}>{pr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Applies To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Select Applies To"
                    value={formData.appliesTo}
                    onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm text-slate-800 placeholder-slate-455 focus:outline-none"
                  />
                </div>

                {/* Coordinators multi checkbox selector */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
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
                    <div className="absolute left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-white/60 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto divide-y divide-white/20 animate-in fade-in zoom-in-95 duration-100">
                      {COORDINATORS.map((coord) => {
                        const active = formData.coordinators.includes(coord);
                        return (
                          <div
                            key={coord}
                            onClick={() => toggleCoordinator(coord)}
                            className="p-2.5 hover:bg-white/40 flex items-center justify-between text-sm cursor-pointer font-semibold text-slate-805"
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
                      <div className="p-1 px-2.5 bg-white/50 flex justify-end font-semibold">
                        <button
                          type="button"
                          onClick={() => setShowCoordDropdown(false)}
                          className="text-[10px] text-blue-600 font-bold cursor-pointer hover:underline"
                        >
                          Completed selection
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Toggle option */}
                <div className="flex items-center gap-6 py-2">
                  <span className="text-xs font-bold text-slate-705">Audit Active Mode</span>
                  <label className="inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-white/55 peer-focus:outline-white/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-semibold text-slate-500">
                      {formData.status ? 'Active' : 'Suspended'}
                    </span>
                  </label>
                </div>

              </div>
            </div>

            {/* INTERACTIVE CRITERIA WEIGHT MANAGER */}
            <div className="border border-white/20 rounded-lg p-5 bg-white/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Decision Evaluation Criteria
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define and assign percentage weights to each core assessment category. Total sum must equal exactly <span className="font-bold text-blue-700 font-mono">100%</span>.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/50 border border-white/80 rounded-lg shadow-sm">
                  <Scale className="w-4 h-4 text-lime-600" />
                  <span className={`text-[13px] font-bold ${
                    totalCriteriaWeight === 100 ? 'text-green-700' : 'text-amber-600'
                  }`}>
                    Total: {totalCriteriaWeight}%
                  </span>
                </div>
              </div>

              {/* Criteria list items */}
              <div className="space-y-2 bg-white/40 rounded-lg p-3 border border-white/30 max-h-60 overflow-y-auto">
                {formData.criteria.length === 0 ? (
                  <p className="text-xs text-center text-slate-400 py-6">No criteria metrics added yet. Define below.</p>
                ) : (
                  formData.criteria.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-2 bg-white/60 rounded-md border border-white/40">
                      <div className="flex-1 text-sm font-bold text-slate-800 truncate">
                        {c.name}
                      </div>
                      <div className="w-20 text-xs font-bold text-slate-700 text-right bg-white/80 py-1 px-2.5 rounded border border-white/80 font-mono">
                        {c.weight}%
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCriteriaItem(c.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Criteria creation form row details */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-2">
                <div className="sm:col-span-8">
                  <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1">New Metric Name</label>
                  <input
                    type="text"
                    value={newCriteriaName}
                    placeholder="e.g. Visual Layout & Signage Standard"
                    onChange={(e) => setNewCriteriaName(e.target.value)}
                    className="w-full px-3 py-1.5 glass-input rounded-lg text-sm bg-white/40 text-slate-850 placeholder-slate-400"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1">Weight Value (%)</label>
                  <select
                    value={newCriteriaWeight}
                    onChange={(e) => setNewCriteriaWeight(Number(e.target.value))}
                    className="w-full px-3 py-1.5 glass-input rounded-lg text-sm bg-white/40 text-slate-850"
                  >
                    {[5, 10, 15, 20, 25, 30, 35, 40, 50].map((w) => (
                      <option key={w} value={w}>{w}%</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <button
                    type="button"
                    onClick={addCriteriaItem}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs h-[34px] flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    Add
                  </button>
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
                {currentMode === 'create' ? 'Save Matrix Specs' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* VIEW MATRIX DETAILS SPECIFICATIONS */}
      {currentMode === 'view' && selectedMatrix && (
        <div className="glass-card-heavy rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-150">
          
          <div className="px-6 py-4 border-b border-white/30 bg-white/20 flex items-center justify-between">
            <button
              onClick={() => setCurrentMode('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to listing
            </button>
            <span className="text-xs text-slate-550 font-mono">Matrix ID: {selectedMatrix.id}</span>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-805 bg-white/40 border border-white/60 px-2.5 py-1 rounded">
                  FY {selectedMatrix.financialYear} &bull; {selectedMatrix.auditType}
                </span>
                <h2 className="text-2xl font-bold text-slate-805 mt-2.5">
                  {selectedMatrix.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Applicable to: <span className="font-bold text-slate-805">{selectedMatrix.plant}</span> ({selectedMatrix.process})
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                selectedMatrix.status ? 'bg-blue-100 text-blue-800 border-blue-200/20' : 'bg-white/45 text-slate-500 border-white/50'
              }`}>
                {selectedMatrix.status ? 'Active' : 'Suspended'}
              </span>
            </div>

            {/* Table layout of assigned weights criteria */}
            <div className="border border-white/30 rounded-xl overflow-hidden mt-4">
              <div className="px-4 py-3 bg-white/20 text-xs font-bold text-slate-505 border-b border-white/20 flex justify-between items-center">
                <span>Criteria Assessment Metric Name</span>
                <span>Assigned Weight</span>
              </div>
              <div className="divide-y divide-white/20">
                {selectedMatrix.criteria.map((c, i) => (
                  <div key={i} className="px-4 py-3.5 flex justify-between items-center text-sm hover:bg-white/10">
                    <span className="font-bold text-slate-750">{c.name}</span>
                    <span className="font-mono font-bold text-slate-850 bg-white/55 px-2.5 py-0.5 rounded text-xs border border-white/65">{c.weight}%</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-white/40 flex justify-between items-center text-sm font-bold text-slate-800 border-t border-white/20">
                <span>Metric Weight Total Sum</span>
                <span className="text-green-700">100%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-white/30 border border-white/30 rounded-lg">
                <span className="text-xs text-slate-505 font-bold uppercase tracking-wider block">Process Category</span>
                <span className="text-sm font-bold text-slate-705 block mt-0.5">{selectedMatrix.process}</span>
              </div>
              <div className="p-3 bg-white/30 border border-white/30 rounded-lg">
                <span className="text-xs text-slate-550 font-bold uppercase tracking-wider block">Assigned To Segment</span>
                <span className="text-sm font-bold text-slate-705 block mt-0.5">{selectedMatrix.appliesTo}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/30 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditMode(selectedMatrix)}
                className="px-4 py-2 border border-amber-300 bg-amber-500/10 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                Modify Calibration Specs
              </button>
              <button
                onClick={() => setCurrentMode('list')}
                className="px-4 py-2 bg-slate-805 text-white hover:bg-slate-900 rounded-lg text-sm font-bold transition-colors cursor-pointer"
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
