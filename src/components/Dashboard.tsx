import React from 'react';
import { AuditTemplate, DecisionMatrix, AuditPlan, AuditRequest } from '../types';
import { LayoutDashboard, CheckSquare, Plus, FileSpreadsheet, ShieldAlert, BookOpen, Clock, Layers, ArrowRight } from 'lucide-react';

interface DashboardProps {
  templates: AuditTemplate[];
  matrices: DecisionMatrix[];
  plans: AuditPlan[];
  requests: AuditRequest[];
  onChangeView: (menu: string) => void;
}

export default function Dashboard({
  templates,
  matrices,
  plans,
  requests,
  onChangeView
}: DashboardProps) {
  // Compute analytics numbers in real time
  const totalTemplates = templates.length;
  const activeTemplates = templates.filter(t => t.status).length;
  const totalMatrices = matrices.length;
  const totalPlans = plans.length;
  const activePlans = plans.filter(p => p.status === 'In Progress' || p.status === 'Planned').length;
  const pendingRequests = requests.filter(r => r.status === 'Pending Approval').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150" id="dashboard-container">
      
      {/* Welcome Banner with Frosted Slate look */}
      <div className="bg-gradient-to-br from-slate-200/50 via-[#cbd5e1]/40 to-slate-200/50 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="text-[10px] font-bold tracking-widest text-blue-700 bg-blue-55/10 px-2.5 py-1 rounded-full uppercase border border-blue-500/20">
            QMS Control Panel
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Quality Management Audit System
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to the centralized BE 5S Audit center. Review compliance metrics, calibrate decision variables, schedule recurring plans, and handle incoming audit requests below.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-white/20 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* Main KPI widget layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Templates metric */}
        <div
          onClick={() => onChangeView('template')}
          className="glass-card hover:glass-card-heavy p-5 rounded-xl hover:shadow-md transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98]"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Audit Templates</span>
            <span className="text-2xl font-extrabold text-slate-800 font-sans block">{totalTemplates}</span>
            <span className="text-[10px] text-green-700 font-semibold font-mono bg-green-100/50 px-1.5 py-0.5 rounded border border-green-200/30 inline-block">{activeTemplates} Active</span>
          </div>
          <div className="p-3 bg-blue-600/10 text-blue-600 rounded-lg group-hover:scale-110 transition-all border border-blue-500/10">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Matrices metric */}
        <div
          onClick={() => onChangeView('matrix')}
          className="glass-card hover:glass-card-heavy p-5 rounded-xl hover:shadow-md transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98]"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Decision Matrices</span>
            <span className="text-2xl font-extrabold text-slate-800 block">{totalMatrices}</span>
            <span className="text-[10px] text-slate-500 block font-medium">Calibrated parameters</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-lg group-hover:scale-110 transition-all border border-amber-500/10">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        {/* Plans metric */}
        <div
          onClick={() => onChangeView('status')}
          className="glass-card hover:glass-card-heavy p-5 rounded-xl hover:shadow-md transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98]"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Active Audit Plans</span>
            <span className="text-2xl font-extrabold text-slate-800 block">{activePlans}</span>
            <span className="text-[10px] text-blue-700 font-medium font-mono">Of {totalPlans} Scheduled</span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-lg group-hover:scale-110 transition-all border border-purple-500/10">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Requests metric */}
        <div
          onClick={() => onChangeView('request')}
          className="glass-card hover:glass-card-heavy p-5 rounded-xl hover:shadow-md transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98]"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Pending Requests</span>
            <span className="text-2xl font-extrabold text-slate-800 block">{pendingRequests}</span>
            <span className="text-[10px] text-orange-600 font-bold font-mono animate-pulse bg-orange-100/50 px-1.5 py-0.5 rounded border border-orange-200/30 inline-block">Needs Review</span>
          </div>
          <div className="p-3 bg-orange-500/10 text-orange-600 rounded-lg group-hover:scale-110 transition-all border border-orange-500/10">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Grid: Shortcut Actions & Recent Activity log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Quick Launch Buttons left */}
        <div className="lg:col-span-4 glass-card p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Quick Audit Launchers</h2>
          <p className="text-xs text-slate-500 leading-relaxed">Instantly instantiate specific sub-module editors or checklists:</p>
          
          <div className="space-y-2 pt-2">
            
            <button
              onClick={() => onChangeView('template')}
              className="w-full p-3 bg-white/30 hover:bg-white/60 border border-white/50 text-left rounded-xl transition-all font-semibold text-sm text-slate-700 flex items-center justify-between group cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Add Checkpoint Template
              </span>
              <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => onChangeView('matrix')}
              className="w-full p-3 bg-white/30 hover:bg-white/60 border border-white/50 text-left rounded-xl transition-all font-semibold text-sm text-slate-700 flex items-center justify-between group cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Configure Scoring Weights
              </span>
              <Plus className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => onChangeView('status')}
              className="w-full p-3 bg-white/30 hover:bg-white/60 border border-white/50 text-left rounded-xl transition-all font-semibold text-sm text-slate-700 flex items-center justify-between group cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Grade Active Audit Runs
              </span>
              <Plus className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => onChangeView('request')}
              className="w-full p-3 bg-white/30 hover:bg-white/60 border border-white/50 text-left rounded-xl transition-all font-semibold text-sm text-slate-700 flex items-center justify-between group cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Submit Ad-Hoc Request
              </span>
              <Plus className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </button>

          </div>
        </div>

        {/* Recent Audit Activities Right */}
        <div className="lg:col-span-8 glass-card p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Live Audit Calendars</h2>
            <button
              onClick={() => onChangeView('plan')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              View planning log <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-white/20 max-h-[300px] overflow-y-auto pr-1">
            {plans.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between text-sm hover:bg-white/30 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    p.status === 'Completed' ? 'bg-green-500/10 text-green-700' :
                    p.status === 'In Progress' ? 'bg-blue-500/10 text-blue-700' :
                    'bg-purple-500/10 text-purple-700'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 truncate max-w-sm">{p.planName}</h4>
                    <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">{p.plant} &bull; Lead: {p.leadAuditor.split(' ')[0]}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.status === 'Completed' ? 'bg-green-100 text-green-805' :
                    p.status === 'In Progress' ? 'bg-blue-105 text-blue-805' :
                    'bg-purple-105 text-purple-805'
                  }`}>
                    {p.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1">{p.targetStartDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
