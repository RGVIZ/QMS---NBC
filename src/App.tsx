import React, { useState, useEffect } from 'react';
import {
  AuditTemplate,
  DecisionMatrix,
  AuditPlan,
  AuditRequest,
  LibraryDocument
} from './types';
import {
  getSavedData,
  saveTemplates,
  saveMatrices,
  savePlans,
  saveRequests,
  saveLibrary
} from './data';
import Dashboard from './components/Dashboard';
import LibraryView from './components/LibraryView';
import AuditTemplateView from './components/AuditTemplateView';
import DecisionMatrixView from './components/DecisionMatrixView';
import AuditPlanView from './components/AuditPlanView';
import AuditStatusView from './components/AuditStatusView';
import AuditRequestView from './components/AuditRequestView';

import {
  Shield,
  BookOpen,
  LayoutTemplate,
  FileSpreadsheet,
  CalendarDays,
  LineChart,
  HelpCircle,
  Menu,
  X,
  Bell,
  User,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Home
} from 'lucide-react';

export default function App() {
  // Master app states
  const [templates, setTemplates] = useState<AuditTemplate[]>([]);
  const [matrices, setMatrices] = useState<DecisionMatrix[]>([]);
  const [plans, setPlans] = useState<AuditPlan[]>([]);
  const [requests, setRequests] = useState<AuditRequest[]>([]);
  const [library, setLibrary] = useState<LibraryDocument[]>([]);

  // Selected sidebar view: 'dashboard' | 'library' | 'template' | 'matrix' | 'plan' | 'status' | 'request'
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toast alert states
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'warning';
    visible: boolean;
  } | null>(null);

  // Load initial persist database
  useEffect(() => {
    const data = getSavedData();
    setTemplates(data.templates);
    setMatrices(data.matrices);
    setPlans(data.plans);
    setRequests(data.requests);
    setLibrary(data.library);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'warning') => {
    setToast({ message, type, visible: true });
    // Auto-dismiss
    setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, visible: false } : null));
    }, 4500);
  };

  // State sync functions
  const handleAddTemplate = (temp: AuditTemplate) => {
    const updated = [temp, ...templates];
    setTemplates(updated);
    saveTemplates(updated);
  };

  const handleUpdateTemplate = (temp: AuditTemplate) => {
    const updated = templates.map((t) => (t.id === temp.id ? temp : t));
    setTemplates(updated);
    saveTemplates(updated);
  };

  const handleAddMatrix = (mat: DecisionMatrix) => {
    const updated = [mat, ...matrices];
    setMatrices(updated);
    saveMatrices(updated);
  };

  const handleUpdateMatrix = (mat: DecisionMatrix) => {
    const updated = matrices.map((m) => (m.id === mat.id ? mat : m));
    setMatrices(updated);
    saveMatrices(updated);
  };

  const handleAddPlan = (p: AuditPlan) => {
    const updated = [p, ...plans];
    setPlans(updated);
    savePlans(updated);
  };

  const handleUpdatePlan = (p: AuditPlan) => {
    const updated = plans.map((pl) => (pl.id === p.id ? p : pl));
    setPlans(updated);
    savePlans(updated);
  };

  const handleAddRequest = (r: AuditRequest) => {
    const updated = [r, ...requests];
    setRequests(updated);
    saveRequests(updated);
  };

  const handleUpdateRequest = (r: AuditRequest) => {
    const updated = requests.map((req) => (req.id === r.id ? r : req));
    setRequests(updated);
    saveRequests(updated);

    // Dynamic auto-approval logic: if request gets approved, instantly auto-generate an Audit Plan!
    if (r.status === 'Approved') {
      const alreadyScheduled = plans.some((p) => p.planName.includes(r.title));
      if (!alreadyScheduled) {
        const generatedPlan: AuditPlan = {
          id: `AP-0${plans.length + 1}`,
          planName: `Scheduled: ${r.title}`,
          templateId: 'AT-001', // default non-manufacturing template
          plant: 'Chennai Plant - Sector 1',
          leadAuditor: 'NBC Admin (nbcadmin)',
          auditorTeam: [],
          financialYear: 'FY 2025-26',
          targetStartDate: r.proposedDate,
          targetEndDate: new Date(new Date(r.proposedDate).getTime() + 86400000 * 3)
            .toISOString()
            .split('T')[0], // +3 days
          scope: `Auto-generated Plan from approved audit request. Rationale stated by requestor: ${r.reason}`,
          status: 'Planned',
          createdAt: new Date().toISOString().split('T')[0],
          createdBy: 'System Auto-Generator'
        };
        const newPlans = [generatedPlan, ...plans];
        setPlans(newPlans);
        savePlans(newPlans);
        showToast(
          `Auto-generated new scheduled Audit Plan for: "${r.title}"!`,
          'success'
        );
      }
    }
  };

  const handleAddDoc = (doc: LibraryDocument) => {
    const updated = [doc, ...library];
    setLibrary(updated);
    saveLibrary(updated);
  };

  // Menu Options Definitions with Screenshots references
  const navigationOptions = [
    { id: 'library', name: 'Library', icon: BookOpen },
    { id: 'template', name: 'Audit Template', icon: LayoutTemplate },
    { id: 'matrix', name: 'Decision Matrix', icon: FileSpreadsheet },
    { id: 'plan', name: 'Audit Plans', icon: CalendarDays },
    { id: 'status', name: 'My Audit Plan Status', icon: LineChart },
    { id: 'request', name: 'Audit Request', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans" id="qms-root">
      
      {/* 1. Header component */}
      <header className="glass-header h-16 shrink-0 lg:h-14 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 hover:bg-white/20 rounded-lg lg:hidden block shrink-0 text-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="p-1.5 bg-[#3b82f6] text-white rounded font-extrabold text-sm tracking-tight leading-none shadow-xs shadow-blue-500/20">
              QMS
            </span>
            <span className="font-bold text-slate-800 text-sm hidden sm:inline-block">
              Quality Management Dashboard
            </span>
          </div>
        </div>

        {/* Header Right Profile & notifications bar */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/40 border border-white/60 rounded-lg text-[11px] font-mono text-slate-600 font-medium select-none">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            ACTIVE: NBC Admin (nbcadmin)
          </div>

          <div className="relative">
            <button className="p-1.5 hover:bg-white/30 rounded-xl text-slate-600 hover:text-slate-850 transition-colors cursor-pointer block relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500"></span>
            </button>
          </div>

          <div className="h-8 w-px bg-white/30 hidden sm:block"></div>

          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-full bg-blue-600 border border-white/40 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              NA
            </div>
            <div className="hidden md:block text-left leading-none">
              <span className="text-xs font-bold text-slate-800 block">NBC Admin</span>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Administrator</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main content area layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Layout with Frosted Glass theme */}
        <aside
          className={`glass-sidebar w-72 shrink-0 flex flex-col justify-between fixed lg:static inset-y-0 left-0 z-50 transform ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } transition-transform duration-250 lg:z-10`}
        >
          <div className="p-4 space-y-6 flex-1 overflow-y-auto">
            
            {/* Top header master node styled as Frosted Glass badge */}
            <div className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white/50 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                  <Shield className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-slate-800 font-bold text-sm tracking-wide">BE 5S Audit</h2>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">Control Base</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1 bg-white/20 hover:bg-white/40 text-slate-650 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar navigation list with elegant connector style under glass aesthetic */}
            <div className="relative pl-3 space-y-1.5">
              
              {/* Vertical lineage line */}
              <div className="absolute left-[20px] top-4 bottom-4 w-px bg-white/20" />

              {/* Home Dashboard option */}
              <div className="relative">
                {/* Horizontal element connector line */}
                <div className="absolute left-[-16px] top-4.5 w-3.5 h-px bg-white/20" />
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between group transition-all cursor-pointer ${
                    currentView === 'dashboard'
                      ? 'glass-option-active text-blue-700 shadow-xs font-bold'
                      : 'text-slate-650 hover:text-slate-900 hover:bg-white/35'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5" /> Dashboard Home
                  </span>
                </button>
              </div>

              {/* Navigation Options */}
              {navigationOptions.map((opt) => {
                const Icon = opt.icon;
                const active = currentView === opt.id;
                return (
                  <div key={opt.id} className="relative block">
                    {/* Horizontal connector branch */}
                    <div className="absolute left-[-16px] top-[17px] w-3.5 h-px bg-white/20" />
                    
                    <button
                      onClick={() => {
                        setCurrentView(opt.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between group transition-all cursor-pointer ${
                        active
                          ? 'glass-option-active text-blue-700 font-bold'
                          : 'text-slate-650 hover:text-slate-900 hover:bg-white/35'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${active ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-800'}`} />
                        {opt.name}
                      </span>
                      {opt.id === 'library' && (
                        <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-slate-800 shrink-0" />
                      )}
                    </button>
                  </div>
                );
              })}

            </div>

          </div>

          {/* Footer of left sidebar */}
          <div className="p-4 border-t border-white/20 bg-white/10 text-center select-none">
            <span className="text-[10px] text-slate-500 font-mono block">SYSTEM BUILD: v1.8.7</span>
            <span className="text-[9px] text-slate-600 block mt-0.5">QMS local glass storage</span>
          </div>
        </aside>

        {/* Content canvas container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Render views dynamically */}
            {currentView === 'dashboard' && (
              <Dashboard
                templates={templates}
                matrices={matrices}
                plans={plans}
                requests={requests}
                onChangeView={(menu) => setCurrentView(menu)}
              />
            )}

            {currentView === 'library' && (
              <LibraryView
                library={library}
                onAddDocument={handleAddDoc}
                showToast={showToast}
              />
            )}

            {currentView === 'template' && (
              <AuditTemplateView
                templates={templates}
                onAddTemplate={handleAddTemplate}
                onUpdateTemplate={handleUpdateTemplate}
                showToast={showToast}
              />
            )}

            {currentView === 'matrix' && (
              <DecisionMatrixView
                matrices={matrices}
                onAddMatrix={handleAddMatrix}
                onUpdateMatrix={handleUpdateMatrix}
                showToast={showToast}
              />
            )}

            {currentView === 'plan' && (
              <AuditPlanView
                plans={plans}
                templates={templates}
                onAddPlan={handleAddPlan}
                onUpdatePlan={handleUpdatePlan}
                showToast={showToast}
              />
            )}

            {currentView === 'status' && (
              <AuditStatusView
                plans={plans}
                matrices={matrices}
                onUpdatePlan={handleUpdatePlan}
                showToast={showToast}
              />
            )}

            {currentView === 'request' && (
              <AuditRequestView
                requests={requests}
                onAddRequest={handleAddRequest}
                onUpdateRequest={handleUpdateRequest}
                showToast={showToast}
              />
            )}

          </div>

          {/* Floated toast alerts */}
          {toast && toast.visible && (
            <div
              className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 border animate-in slide-in-from-bottom-5 duration-200 ${
                toast.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : toast.type === 'info'
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-orange-50 border-orange-200 text-orange-850'
              }`}
            >
              <div className="text-sm font-semibold pr-2 select-none">
                {toast.message}
              </div>
              <button
                onClick={() => setToast((prev) => (prev ? { ...prev, visible: false } : null))}
                className="text-xs font-bold leading-none select-none hover:opacity-80"
              >
                &times;
              </button>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
