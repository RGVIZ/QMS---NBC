import React, { useState } from 'react';
import { AuditPlan, DecisionMatrix } from '../types';
import { CheckSquare, AlertTriangle, AlertCircle, Play, Save, Star, ChevronRight, Activity, TrendingUp } from 'lucide-react';

interface AuditStatusViewProps {
  plans: AuditPlan[];
  matrices: DecisionMatrix[];
  onUpdatePlan: (p: AuditPlan) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'warning') => void;
}

export default function AuditStatusView({
  plans,
  matrices,
  onUpdatePlan,
  showToast
}: AuditStatusViewProps) {
  const [activePlanForAudit, setActivePlanForAudit] = useState<AuditPlan | null>(null);
  
  // Interactive audit grades: map of checkpoint index -> score (1 to 5)
  const [scores, setScores] = useState<{ [key: number]: number }>({});
  const [observations, setObservations] = useState('');
  const [nonCompliances, setNonCompliances] = useState('');

  // Find active / ongoing plans
  const ongoingPlans = plans.filter((p) => p.status === 'In Progress' || p.status === 'Planned');
  const completedPlans = plans.filter((p) => p.status === 'Completed');

  // Find corresponding decision matrix criteria
  const getMatrixForPlan = (plan: AuditPlan) => {
    // try matching by auditType
    return matrices.find((m) => m.auditType === '5S Audit') || matrices[0];
  };

  const startAuditing = (plan: AuditPlan) => {
    setActivePlanForAudit(plan);
    const matrix = getMatrixForPlan(plan);
    const initialScores: { [key: number]: number } = {};
    if (matrix) {
      matrix.criteria.forEach((_, idx) => {
        initialScores[idx] = 5; // default to max score
      });
    }
    setScores(initialScores);
    setObservations('');
    setNonCompliances('');
    showToast(`Initializing assessment protocol for "${plan.planName}"`, 'info');
  };

  const handleScoreChange = (criteriaIdx: number, val: number) => {
    setScores({
      ...scores,
      [criteriaIdx]: val
    });
  };

  // Compute stats
  const activeMatrix = activePlanForAudit ? getMatrixForPlan(activePlanForAudit) : null;
  const maxScoreSum = activeMatrix ? activeMatrix.criteria.length * 5 : 0;
  const currentTotal = activeMatrix
    ? activeMatrix.criteria.reduce((total, c, idx) => {
        const score = scores[idx] || 5;
        // relative weight: (score / 5) * weight
        return total + (score / 5) * c.weight;
      }, 0)
    : 0;

  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlanForAudit) return;

    // Update the layout status to completed
    const updatedPlan: AuditPlan = {
      ...activePlanForAudit,
      status: 'Completed',
      scope: `${activePlanForAudit.scope}\n\n[SUBMITTED ASSESSMENT RESULTS]:\nFinal Compliance Weighted Score: ${currentTotal.toFixed(1)}%\nObservations: ${observations}\nCorrective Action Plans: ${nonCompliances}`
    };

    onUpdatePlan(updatedPlan);
    showToast(`Audit Calibration completed! Final Score: ${currentTotal.toFixed(1)}%. Stored in system.`, 'success');
    setActivePlanForAudit(null);
  };

  return (
    <div className="space-y-6" id="audit-status-view">
      
      {/* Upper overview statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-[#008cff] rounded-lg">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Total Ongoing Reviews</span>
            <span className="text-2xl font-bold text-gray-900">{ongoingPlans.length}</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Signed-Off Audits</span>
            <span className="text-2xl font-bold text-gray-900">{completedPlans.length}</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <TrendingUp className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Average Score</span>
            <span className="text-2xl font-bold text-gray-900">92.4%</span>
          </div>
        </div>
      </div>

      {!activePlanForAudit ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          
          {/* Active Audits list left */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block animate-ping"></span> Active Audit Runs
            </h2>

            {ongoingPlans.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400">
                All scheduled audits have been completed or deferred!
              </div>
            ) : (
              ongoingPlans.map((plan) => {
                const matrix = getMatrixForPlan(plan);
                return (
                  <div key={plan.id} className="p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all shadow-2xs space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-mono rounded">
                          {plan.id}
                        </span>
                        <h3 className="font-bold text-gray-950 mt-1.5">
                          {plan.planName}
                        </h3>
                        <p className="text-xs text-gray-400 font-medium">
                          {plan.plant}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        plan.status === 'In Progress' ? 'bg-blue-50 text-[#008cff]' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {plan.status}
                      </span>
                    </div>

                    <div className="border-t border-gray-50 pt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>Lead: <span className="font-semibold text-gray-755">{plan.leadAuditor.split(' ')[0]}</span></span>
                      <span>Criteria: <span className="font-semibold text-[#008cff]">{matrix?.name || '5S Checklist'}</span></span>
                    </div>

                    <button
                      onClick={() => startAuditing(plan)}
                      className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                    >
                      <Play className="w-3.5 h-3.5" /> Launch Checklist Grade
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Signed-off history audits */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              Signed-Off & Sealed Calibrations
            </h2>

            {completedPlans.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-405 italic">
                No past finalized submissions stored locally. Click launch on any active plan on the left side to complete it.
              </div>
            ) : (
              completedPlans.map((plan) => (
                <div key={plan.id} className="p-4 bg-gray-50 rounded-xl border border-gray-105 flex items-start gap-3 justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{plan.planName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{plan.plant}</p>
                    <span className="text-[10px] font-mono text-gray-400 mt-2 block">
                      Target Duration: {plan.targetStartDate} to {plan.targetEndDate}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 font-bold font-mono text-[10px] rounded block">
                      COMPLETED
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-1.5">Lead: {plan.leadAuditor.split(' ')[0]}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      ) : (
        /* INTERACTIVE EVALUATION SCREEN FOR THE ACTIVE RUN */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in zoom-in-95 duration-150">
          
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <button
              onClick={() => setActivePlanForAudit(null)}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
            >
              Cancel evaluation & exit
            </button>
            <div className="text-right">
              <span className="text-xs font-semibold text-[#008cff] bg-blue-50 px-2 py-0.5 rounded leading-none">
                EVALUATION MODE
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Criteria assessment form */}
            <form onSubmit={handleSubmitAudit} className="lg:col-span-8 space-y-6">
              
              <div>
                <h2 className="text-lg font-bold text-gray-900">{activePlanForAudit.planName}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Facility: {activePlanForAudit.plant} &bull; Lead Auditor: {activePlanForAudit.leadAuditor}</p>
              </div>

              {/* Checkpoint items list */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#008cff] uppercase tracking-wider">Checklist Scoring Metrics</h3>
                
                {activeMatrix?.criteria.map((crt, idx) => {
                  const currentSel = scores[idx] || 5;
                  return (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3.5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-[#84cc16] uppercase">Checkpoint {idx + 1}</span>
                          <h4 className="font-semibold text-gray-950 mt-0.5">{crt.name}</h4>
                        </div>
                        <span className="text-xs font-bold text-gray-400 font-mono shrink-0">Weight: {crt.weight}%</span>
                      </div>

                      {/* Interactive grading star selector */}
                      <div className="flex items-center gap-6 justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleScoreChange(idx, s)}
                              className={`p-1.5 rounded-lg border transition-all flex items-center justify-center gap-1 ${
                                currentSel >= s 
                                  ? 'bg-[#84cc16]/10 border-[#84cc16] text-[#84cc16]' 
                                  : 'bg-white border-gray-200 text-gray-300 hover:border-gray-300'
                              }`}
                            >
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-xs font-bold font-mono">{s}</span>
                            </button>
                          ))}
                        </div>
                        
                        <span className="text-xs font-bold font-mono text-gray-600 bg-white border border-gray-150 px-2.5 py-1 rounded">
                          Grade: {currentSel}/5
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Observation text fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Findings / Observations</label>
                  <textarea
                    rows={3}
                    placeholder="Enter visual observations, floor deviations, or noteworthy benchmarks..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Corrective Action Plan (CAP)</label>
                  <textarea
                    rows={3}
                    placeholder="Specify immediate actions, timelines, and assigned members to resolve non-compliances..."
                    value={nonCompliances}
                    onChange={(e) => setNonCompliances(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  ></textarea>
                </div>
              </div>

              {/* Form buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActivePlanForAudit(null)}
                  className="px-5 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Cancel Run
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#84cc16] hover:bg-lime-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Sign-Off & Lock Audit Results
                </button>
              </div>

            </form>

            {/* Right Side Weighted compliance Score indicator panel */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-105 text-center space-y-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">COMPLIANCE WEIGHTED SCORE</span>
                
                <div className="w-32 h-32 bg-white rounded-full border-4 border-[#008cff]/20 flex flex-col items-center justify-center mx-auto shadow-xs">
                  <span className="text-3xl font-extrabold text-[#008cff] font-mono leading-none">
                    {currentTotal.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-gray-400 mt-1">%</span>
                </div>

                <div className="pt-2 text-xs text-gray-500 font-medium">
                  {currentTotal >= 90 ? 'Excellent Standard Compliance' :
                   currentTotal >= 75 ? 'Acceptable Compliance Level' :
                   'Attention Needed: corrective action recommended!'}
                </div>
              </div>

              {/* Informative tips box */}
              <div className="p-4 bg-orange-50/40 rounded-xl border border-orange-100 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4" /> Checklist Instructions
                </div>
                <ul className="text-xs text-gray-650 space-y-2 list-disc list-inside leading-relaxed pl-1">
                  <li>Grade each checkpoint honestly on a scale of 1-5 stars.</li>
                  <li>Provide observations and photos/notes for items graded less than 3 stars.</li>
                  <li>Signing-off instantly transfers the audit status from "In Progress" to "Completed" catalog records.</li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
