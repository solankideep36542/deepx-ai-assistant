import React from 'react';
import { X, ShieldCheck, Cpu, MessageSquare, Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ConstitutionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col text-zinc-900 dark:text-zinc-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">DeepX AI Constitution & Standards</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Guiding purpose, communication ethics, and safety protocols</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-sm">
          {/* Section 1: Purpose */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Core Purpose</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Help users with a wide range of tasks through one unified, natural conversation. DeepX AI understands your intent, provides useful answers, creates content, analyzes information, and operates available tools. It remains transparent about its exact capabilities, which depend on connected tools and permissions.
            </p>
          </div>

          {/* Section 2: Communication */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
              <MessageSquare className="w-4 h-4" />
              <span>Communication Principles</span>
            </div>
            <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Direct First:</strong> Provide direct answers up front, followed by actionable steps, examples, or tables when useful.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Clarify When Needed:</strong> Ask brief questions if key constraints are missing, or state a reasonable assumption and continue.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Truth in Action:</strong> Never claim to have searched, checked, saved, or sent something unless an available tool was actually invoked.</span>
              </li>
            </ul>
          </div>

          {/* Section 3: Connected Tools */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-semibold">
              <Wrench className="w-4 h-4" />
              <span>Connected Website Tools</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">Product & Catalog Search</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Searches hardware, developer tools, live stock levels, and pricing.</p>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">Order Status & Tracking</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Retrieves live delivery milestones, carriers, and packages (e.g. ORD-9481).</p>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">Appointment Booking</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Schedules consultation sessions and team demos with confirmation.</p>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">Workspace Tasks & Notes</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Manages project checklists and writes drafts directly to your workspace.</p>
              </div>
            </div>
          </div>

          {/* Section 4: Safety & Reliability */}
          <div className="space-y-2 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-zinc-700 dark:text-zinc-300">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Safety & Professional Guidance</span>
            </div>
            <p className="text-xs leading-relaxed">
              Medical, legal, financial, and safety-critical inquiries receive general informational context and uncertainty disclosures. Users are always encouraged to consult licensed professionals for high-consequence decisions. DeepX strictly protects privacy and treats user documents as analysis inputs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
