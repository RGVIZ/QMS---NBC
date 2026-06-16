import React, { useState } from 'react';
import { LibraryDocument } from '../types';
import { BookOpen, FileText, Download, CheckCircle, Search, Filter, Plus, Calendar, Disc } from 'lucide-react';

interface LibraryViewProps {
  library: LibraryDocument[];
  onAddDocument: (doc: LibraryDocument) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'warning') => void;
}

export default function LibraryView({ library, onAddDocument, showToast }: LibraryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeDoc, setActiveDoc] = useState<LibraryDocument | null>(library[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Standard Guidelines');
  const [version, setVersion] = useState('v1.0');
  const [description, setDescription] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');

  const categories = ['All', 'Standard Guidelines', 'Regulatory Standards', 'Safety & EHS', 'Training Materials'];

  const filteredDocs = library.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }

    const newDoc: LibraryDocument = {
      id: `LIB-0${library.length + 1}`,
      title,
      category,
      version,
      lastUpdated: new Date().toISOString().split('T')[0],
      fileSize,
      description
    };

    onAddDocument(newDoc);
    showToast(`Document "${title}" added to physical library indices successfully!`, 'success');
    
    // Clear & close
    setTitle('');
    setCategory('Standard Guidelines');
    setVersion('v1.0');
    setDescription('');
    setFileSize('1.5 MB');
    setShowAddModal(false);
    
    // Auto-select the newly added document
    setActiveDoc(newDoc);
  };

  const handleSimulateDownload = (docTitle: string) => {
    showToast(`Downloading file: ${docTitle}...`, 'info');
    setTimeout(() => {
      showToast(`Finished downloading ${docTitle}! Ready in Downloads directory.`, 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6" id="library-view-container">
      {/* Upper header action item */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/20 p-5 rounded-xl border border-white/35 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-805 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-700" /> QMS Standard Library
          </h1>
          <p className="text-sm text-slate-650 mt-1 font-bold">
            Access, download, and manage approved audit standards, regulatory regulations, standard checklists, and certification files.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
          id="btn-add-library-doc"
        >
          <Plus className="w-4 h-4" /> Add Document Reference
        </button>
      </div>

      {/* Main Content Layout - Split Screen Doc Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Filter and List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="glass-card p-4 rounded-xl border border-white/25 shadow-xs space-y-4">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search standard guidelines, checklists, or document keys..."
                className="w-full pl-10 pr-4 py-2 bg-[#ffffff45] border border-white/25 rounded-lg focus:outline-none focus:bg-white/70 text-sm transition-all text-slate-805 placeholder-slate-455"
              />
            </div>

            {/* Category Pill Filters */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-slate-805 text-white border-slate-805 shadow-xs'
                      : 'bg-white/40 text-slate-700 hover:bg-white/70 border-white/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Doc List Card list */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredDocs.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center border-dashed border-white/60">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-800 font-extrabold text-base">No safety documents match your criteria.</p>
                <p className="text-xs text-slate-500 font-bold mt-1">Try resetting the text filter or add a brand new standard entry.</p>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setActiveDoc(doc)}
                  className={`p-4 rounded-xl transition-all border cursor-pointer flex items-start gap-4 ${
                    activeDoc?.id === doc.id
                      ? 'bg-white/65 border-blue-600 shadow-md scale-[1.01]'
                      : 'bg-white/30 border-white/40 hover:bg-white/50'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    activeDoc?.id === doc.id ? 'bg-blue-600/10 text-blue-700' : 'bg-white/40 text-slate-500 border border-white/40'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono bg-white/50 border border-white/60 px-2 py-0.5 rounded text-slate-700 font-bold">
                        {doc.id}
                      </span>
                      <span className="text-xs text-slate-550 font-bold font-mono">
                        {doc.fileSize}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-805 mt-1 truncate">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-650 mt-1 line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 font-bold">
                      <span className="bg-white/50 border border-white/70 text-slate-750 px-2 py-0.5 rounded-xs">
                        {doc.category}
                      </span>
                      <span className="text-blue-700">Version {doc.version}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Active Document Detail Panel (5 Cols) */}
        <div className="lg:col-span-5">
          {activeDoc ? (
            <div className="glass-card rounded-xl border border-white/30 shadow-md p-6 sticky top-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-white/20">
                <div className="p-3 bg-blue-500/10 text-blue-700 rounded-xl border border-white/40">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 bg-blue-600/10 text-blue-800 rounded text-[10px] font-extrabold font-mono border border-blue-500/20">
                    APPROVED AUDIT STANDARDS
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-805 mt-1 leading-tight">
                    {activeDoc.title}
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Description</h4>
                  <p className="text-sm text-slate-755 mt-1.5 leading-relaxed font-semibold">
                    {activeDoc.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-white/40 border border-white/50 rounded-lg">
                    <span className="text-[11px] text-slate-450 font-bold block">Category</span>
                    <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">
                      {activeDoc.category}
                    </span>
                  </div>
                  <div className="p-3 bg-white/40 border border-white/50 rounded-lg">
                    <span className="text-[11px] text-slate-450 font-bold block">Index Version</span>
                    <span className="text-xs font-bold text-slate-800 block mt-0.5">
                      {activeDoc.version}
                    </span>
                  </div>
                  <div className="p-3 bg-white/40 border border-white/50 rounded-lg">
                    <span className="text-[11px] text-slate-450 font-bold block">Last Calibrated</span>
                    <span className="text-[11px] font-bold text-slate-800 block mt-0.5 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {activeDoc.lastUpdated}
                    </span>
                  </div>
                  <div className="p-3 bg-white/40 border border-white/50 rounded-lg">
                    <span className="text-[11px] text-slate-450 font-bold block">File Footprint</span>
                    <span className="text-[11px] font-bold text-slate-800 block mt-0.5 font-mono">
                      {activeDoc.fileSize}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 flex flex-col gap-2">
                <button
                  onClick={() => handleSimulateDownload(activeDoc.title)}
                  className="w-full py-2.5 bg-slate-805 text-white hover:bg-slate-900 rounded-lg transition-colors font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download Standard PDF
                </button>
                <div className="text-center">
                  <span className="text-[11px] text-slate-500 font-bold flex items-center justify-center gap-1">
                    <Disc className="w-3 h-3 animate-spin text-green-500" /> Standard verified by QMS Registry
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center text-slate-500 shadow-sm border-dashed border-white/50">
              <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-bold">Select a guideline from the list to preview details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Document Reference Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-card-heavy rounded-xl border border-white/30 shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-white/20 bg-white/20 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-805 flex items-center gap-1.5 text-sm">
                <Plus className="w-5 h-5 text-blue-700" /> Add Document Reference
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-850 text-2xl font-bold leading-none cursor-pointer p-1"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cleanliness & Visual Storage Benchmarks"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-sm text-slate-800 placeholder-slate-455"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/40 text-slate-800 focus:outline-none"
                  >
                    <option value="Standard Guidelines">Standard Guidelines</option>
                    <option value="Regulatory Standards">Regulatory Standards</option>
                    <option value="Safety & EHS">Safety & EHS</option>
                    <option value="Training Materials">Training Materials</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1">
                    Version Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. v1.2"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm text-slate-800 placeholder-slate-455"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1">
                  Synthetic File Footprint *
                </label>
                <select
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-white/40 text-slate-800 focus:outline-none"
                >
                  <option value="1.2 MB">1.2 MB</option>
                  <option value="2.5 MB">2.5 MB</option>
                  <option value="4.0 MB">4.0 MB</option>
                  <option value="7.8 MB">7.8 MB</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1">
                  Description / Objective *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline the core checkpoints, compliance mandates, and audit metrics contained..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-sm text-slate-800 placeholder-slate-455"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-white/20 flex items-center justify-end gap-3 font-semibold">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-white/60 text-slate-655 rounded-lg text-sm font-semibold hover:bg-white/30 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
                >
                  Publish Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
