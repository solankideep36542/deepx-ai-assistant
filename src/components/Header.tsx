import React from 'react';
import {
  Menu,
  Sparkles,
  Sun,
  Moon,
  Wrench,
  ShieldCheck,
  Download,
  Trash2,
  Shield,
  User,
  LogOut,
  LogIn,
} from 'lucide-react';
import { WebsiteData, UserProfile } from '../types';

import { GeminiSparkle } from './GeminiSparkle';

interface Props {
  onToggleMobileMenu: () => void;
  onOpenToolsDrawer: () => void;
  onOpenConstitution: () => void;
  onOpenApiHub: () => void;
  onOpenAuth: (mode?: 'user' | 'admin') => void;
  onOpenAdminDashboard: () => void;
  onSignOut: () => void;
  currentUser: UserProfile | null;
  darkMode: boolean;
  onToggleTheme: () => void;
  onClearChat: () => void;
  onExportChat: () => void;
  hasMessages: boolean;
  websiteData: WebsiteData | null;
}

export const Header: React.FC<Props> = ({
  onToggleMobileMenu,
  onOpenToolsDrawer,
  onOpenConstitution,
  onOpenApiHub,
  onOpenAuth,
  onOpenAdminDashboard,
  onSignOut,
  currentUser,
  darkMode,
  onToggleTheme,
  onClearChat,
  onExportChat,
  hasMessages,
}) => {
  return (
    <header className="h-16 px-4 md:px-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-[#1e1f20] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-xs">
            <GeminiSparkle className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                Gemini
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                2.5 Flash
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Conversational AI with connected tools
            </p>
          </div>
        </div>
      </div>

      {/* Right: Admin Button, Auth Button, API Hub, Tools drawer, Theme */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Admin Dashboard Quick Access Button if Admin */}
        {currentUser?.role === 'admin' ? (
          <button
            onClick={onOpenAdminDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition animate-pulse"
            title="Open Live Admin Visitor Dashboard"
          >
            <Shield className="w-3.5 h-3.5 fill-white" />
            <span>Admin Console</span>
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          </button>
        ) : (
          <button
            onClick={() => onOpenAuth('admin')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold transition"
            title="Admin Login Portal"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Login</span>
          </button>
        )}

        {/* User Account / Profile status */}
        {currentUser ? (
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 pl-2.5 pr-1.5 py-1 rounded-xl text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[100px] hidden sm:inline">
                {currentUser.name}
              </span>
            </div>
            <button
              onClick={onSignOut}
              className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpenAuth('user')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* API Hub Button */}
        <button
          onClick={onOpenApiHub}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/80 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-semibold text-blue-700 dark:text-blue-300 transition shadow-xs"
          title="Open API Hub & Developer Console"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="hidden sm:inline">API Hub</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-200/70 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
            10
          </span>
        </button>

        {/* Connected Tools Drawer Trigger */}
        <button
          onClick={onOpenToolsDrawer}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition"
          title="Open connected website tools"
        >
          <Wrench className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span className="hidden lg:inline">Tools</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
        </button>

        {/* Constitution Guide Trigger */}
        <button
          onClick={onOpenConstitution}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-xs font-medium transition"
          title="Read DeepX Constitution & Safety"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>Constitution</span>
        </button>

        {/* Export Chat */}
        {hasMessages && (
          <button
            onClick={onExportChat}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition text-xs"
            title="Export conversation"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Clear Chat */}
        {hasMessages && (
          <button
            onClick={onClearChat}
            className="p-2 rounded-xl text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition text-xs"
            title="Clear chat messages"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Theme Switcher */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
