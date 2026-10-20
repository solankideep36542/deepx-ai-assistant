import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Compass,
  Code,
  PenTool,
  Lightbulb,
  ShoppingBag,
  Wrench,
  ShieldAlert,
  ChevronRight,
  Database,
} from 'lucide-react';
import { ChatSession, WebsiteData, UserProfile } from '../types';

interface Props {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onSelectPrompt: (prompt: string) => void;
  websiteData: WebsiteData | null;
  onOpenToolsDrawer: () => void;
  onOpenConstitution: () => void;
  onOpenApiHub: () => void;
  onOpenAuth: (mode?: 'user' | 'admin') => void;
  onOpenAdminDashboard: () => void;
  currentUser: UserProfile | null;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onSelectPrompt,
  websiteData,
  onOpenToolsDrawer,
  onOpenConstitution,
  onOpenApiHub,
  onOpenAuth,
  onOpenAdminDashboard,
  currentUser,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const quickStarters = [
    {
      category: 'Website Tools',
      icon: <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />,
      prompts: [
        'Check the status and delivery estimate for order ORD-9481',
        'Search our product catalog for hardware items under $300',
        'Book an AI Architecture Consultation for next Tuesday at 10 AM',
      ],
    },
    {
      category: 'Code & Systems',
      icon: <Code className="w-3.5 h-3.5 text-emerald-500" />,
      prompts: [
        'Explain how React 19 server actions work with a clear code example',
        'Draft a robust TypeScript utility with exponential backoff and retry',
      ],
    },
    {
      category: 'Writing & Summaries',
      icon: <PenTool className="w-3.5 h-3.5 text-purple-500" />,
      prompts: [
        'Draft an announcement email for our upcoming developer platform release',
        'Help me structure a concise executive summary for a project report',
      ],
    },
    {
      category: 'Planning & Ideas',
      icon: <Lightbulb className="w-3.5 h-3.5 text-amber-500" />,
      prompts: [
        'Create a 4-week progressive bodyweight fitness routine for beginners',
        'Brainstorm 5 creative marketing strategies for an AI product launch',
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* New Chat Button */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/80">
          <button
            onClick={() => {
              onNewSession();
              onCloseMobile();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>

        {/* Scrollable middle section: Sessions & Quick Prompts */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Recent Conversations */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Conversations ({sessions.length})
              </span>
            </div>

            <div className="space-y-1">
              {sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const isEditing = editingId === session.id;

                return (
                  <div
                    key={session.id}
                    className={`group relative rounded-xl px-2.5 py-2 flex items-center justify-between text-xs transition ${
                      isActive
                        ? 'bg-white dark:bg-zinc-800/90 text-blue-600 dark:text-blue-400 font-semibold shadow-xs border border-zinc-200 dark:border-zinc-700'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(session.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="w-full px-1.5 py-0.5 text-xs bg-transparent border border-blue-500 rounded focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(session.id)}
                          className="p-1 text-emerald-500 hover:text-emerald-600"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-zinc-400 hover:text-zinc-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onSelectSession(session.id);
                            onCloseMobile();
                          }}
                          className="flex items-center gap-2 truncate text-left flex-1 mr-2"
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{session.title}</span>
                        </button>

                        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(session.id, session.title);
                            }}
                            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {sessions.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                              }}
                              className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Categories */}
          <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <div className="px-2 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Explore Capabilities
              </span>
              <Compass className="w-3 h-3 text-zinc-400" />
            </div>

            <div className="space-y-3">
              {quickStarters.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    {group.icon}
                    <span>{group.category}</span>
                  </div>
                  <div className="space-y-0.5">
                    {group.prompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => {
                          onSelectPrompt(p);
                          onCloseMobile();
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-[11px] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition truncate flex items-center justify-between group"
                      >
                        <span className="truncate">{p}</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-zinc-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Tools Status & Standards */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-900/40 space-y-2">
          {/* API Hub Button */}
          <button
            onClick={() => {
              onOpenApiHub();
              onCloseMobile();
            }}
            className="w-full px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 hover:border-blue-500 transition text-left flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-200">API Hub Console</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400">
                  10 REST APIs & AI Tools
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200/80 dark:bg-blue-800 text-blue-800 dark:text-blue-200 font-mono">
              TEST
            </span>
          </button>

          {/* Connected Data Button */}
          <button
            onClick={() => {
              onOpenToolsDrawer();
              onCloseMobile();
            }}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 hover:border-blue-500 transition text-left flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">Connected Tools</p>
                <p className="text-[10px] text-zinc-400">
                  {websiteData?.catalog.length || 0} Products • {websiteData?.orders.length || 0} Orders
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              Active
            </span>
          </button>

          {/* Admin Page Shortcut */}
          {currentUser?.role === 'admin' ? (
            <button
              onClick={() => {
                onOpenAdminDashboard();
                onCloseMobile();
              }}
              className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-rose-950/80 to-red-950/80 border border-rose-800/80 hover:border-rose-600 transition text-left flex items-center justify-between text-xs text-rose-300 font-bold shadow-sm"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <div>
                  <p className="leading-tight">Admin Visitor Radar</p>
                  <p className="text-[10px] text-rose-400/80 font-normal">Live Telemetry & Users</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>
          ) : (
            <button
              onClick={() => {
                onOpenAuth('admin');
                onCloseMobile();
              }}
              className="w-full px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Portal Login</span>
            </button>
          )}

          {/* Constitution Modal Trigger */}
          <button
            onClick={() => {
              onOpenConstitution();
              onCloseMobile();
            }}
            className="w-full px-2.5 py-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
          >
            <span>DeepX Constitution & Safety</span>
          </button>
        </div>
      </aside>
    </>
  );
};
