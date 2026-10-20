import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Users,
  Radio,
  RefreshCw,
  Search,
  UserCheck,
  Shield,
  Clock,
  Activity,
  Globe,
  Monitor,
  MessageSquare,
  Zap,
  Download,
  UserX,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Filter,
  Mail,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { VisitorSession, ActivityEvent, UserProfile, RegisteredUserAccount } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  adminPassword: string;
}

export const AdminDashboard: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  adminPassword,
}) => {
  const [visitors, setVisitors] = useState<VisitorSession[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserAccount[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    onlineNow: 0,
    registeredUsers: 0,
    totalMessages: 0,
    totalApiCalls: 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState<'all' | 'name' | 'email'>('all');
  const [filter, setFilter] = useState<'all' | 'online' | 'members' | 'guests'>('all');
  const [activeTab, setActiveTab] = useState<'sessions' | 'accounts'>('sessions');
  const [simulating, setSimulating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch admin telemetry
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const activeToken = adminPassword || 'Deepak@582010';
      const res = await fetch(`/api/admin/visitors?token=${encodeURIComponent(activeToken)}`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setVisitors(data.visitors || []);
        if (data.registeredUsers) setRegisteredUsers(data.registeredUsers);
        setActivities(data.activities || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 6000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Simulate new incoming visitor
  const handleSimulateVisitor = async () => {
    try {
      setSimulating(true);
      const activeToken = adminPassword || 'Deepak@582010';
      const res = await fetch('/api/admin/visitors/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeToken }),
      });
      if (res.ok) {
        const data = await res.json();
        showNotification(`Simulated visitor added: ${data.visitor.name} (${data.visitor.location})`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  // Kick session
  const handleKickVisitor = async (visitorId: string, name: string) => {
    try {
      const activeToken = adminPassword || 'Deepak@582010';
      const res = await fetch('/api/admin/visitors/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeToken, visitorId, action: 'kick' }),
      });
      if (res.ok) {
        showNotification(`Terminated active session for ${name}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Export logs
  const handleExportLogs = () => {
    const dataStr = JSON.stringify(
      { visitors, registeredUsers, activities, stats, exportedAt: new Date().toISOString() },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepx_visitor_analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Highlight matched search text helper
  const renderHighlighted = (text: string, query: string) => {
    const trimmed = query.trim();
    if (!trimmed || !text) return text;

    const regex = new RegExp(`(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === trimmed.toLowerCase() ? (
            <mark
              key={index}
              className="bg-amber-400/30 text-amber-200 font-semibold px-0.5 rounded"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Filtered live visitor sessions based on search & filter
  const filteredVisitors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return visitors.filter((v) => {
      // Search matching logic based on searchField
      if (query) {
        const nameMatch = v.name.toLowerCase().includes(query);
        const emailMatch = v.email.toLowerCase().includes(query);
        const locationMatch = v.location.toLowerCase().includes(query);
        const ipMatch = v.ipAddress.includes(query);

        if (searchField === 'name' && !nameMatch) return false;
        if (searchField === 'email' && !emailMatch) return false;
        if (searchField === 'all' && !(nameMatch || emailMatch || locationMatch || ipMatch)) {
          return false;
        }
      }

      // Status & membership filters
      if (filter === 'online') return v.status === 'online';
      if (filter === 'members') return v.role === 'user' || v.role === 'admin';
      if (filter === 'guests') return v.role === 'guest';
      return true;
    });
  }, [visitors, search, searchField, filter]);

  // Filtered registered users based on search
  const filteredRegisteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return registeredUsers;

    return registeredUsers.filter((u) => {
      const nameMatch = u.name.toLowerCase().includes(query);
      const emailMatch = u.email.toLowerCase().includes(query);
      const idMatch = u.id.toLowerCase().includes(query);

      if (searchField === 'name') return nameMatch;
      if (searchField === 'email') return emailMatch;
      return nameMatch || emailMatch || idMatch;
    });
  }, [registeredUsers, search, searchField]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-md flex flex-col animate-fade-in text-zinc-100">
      {/* Top Banner & Navigation */}
      <div className="sticky top-0 z-20 px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Chat</span>
          </button>

          <div className="h-6 w-px bg-zinc-800" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight">DeepX Administrator Console</h1>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Visitor Radar
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Logged in as <strong>{currentUser?.name || 'Deepak Solanki'}</strong> ({currentUser?.email || 'solankideep36542@gmail.com'})
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {notification && (
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-3 py-1.5 rounded-xl animate-fade-in flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {notification}
            </span>
          )}

          <button
            onClick={handleSimulateVisitor}
            disabled={simulating}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Generate a simulated active visitor session"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{simulating ? 'Simulating...' : 'Simulate Visitor Traffic'}</span>
          </button>

          <button
            onClick={handleExportLogs}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition flex items-center gap-1.5 border border-zinc-700"
            title="Download JSON visitor analytics report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-900/60 text-zinc-400 hover:text-rose-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span>Active Online Now</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">{stats.onlineNow}</span>
              <span className="text-xs text-zinc-400">visitors browsing</span>
            </div>
            <p className="text-[11px] text-zinc-500 pt-1">Heartbeat sync active every 6 seconds</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span>Total Visitors Logged</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{stats.totalVisitors}</span>
              <span className="text-xs text-zinc-400">unique sessions</span>
            </div>
            <p className="text-[11px] text-zinc-500 pt-1">{stats.registeredUsers} registered user profiles</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span>Chat Messages Exchanged</span>
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-purple-400">{stats.totalMessages}</span>
              <span className="text-xs text-zinc-400">assistant turns</span>
            </div>
            <p className="text-[11px] text-zinc-500 pt-1">Across all visitor conversations</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span>API & Tool Invocations</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-400">{stats.totalApiCalls}</span>
              <span className="text-xs text-zinc-400">tool executions</span>
            </div>
            <p className="text-[11px] text-zinc-500 pt-1">Weather, orders, catalog, code VM</p>
          </div>
        </div>

        {/* ================= DEDICATED SEARCH BAR CARD ================= */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold tracking-tight text-white">
                  Find & Filter Users
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Search through active visitors and registered accounts in real-time by name or email
              </p>
            </div>

            {/* View Tab Switcher */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start md:self-auto">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'sessions'
                    ? 'bg-zinc-800 text-white shadow font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Sessions ({visitors.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'accounts'
                    ? 'bg-zinc-800 text-white shadow font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Registered Users ({registeredUsers.length})</span>
              </button>
            </div>
          </div>

          {/* Search Input Box with Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Main Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name (e.g. Deepak Solanki) or email (e.g. solankideep36542@gmail.com)..."
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-zinc-700/80 bg-zinc-950 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-inner font-sans"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Target Selector: All vs Name vs Email */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs shrink-0">
              <span className="text-[11px] text-zinc-500 px-2 font-medium">Filter field:</span>
              <button
                onClick={() => setSearchField('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  searchField === 'all'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSearchField('name')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                  searchField === 'name'
                    ? 'bg-blue-900/60 text-blue-300 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <UserIcon className="w-3 h-3" />
                <span>Name</span>
              </button>
              <button
                onClick={() => setSearchField('email')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                  searchField === 'email'
                    ? 'bg-purple-900/60 text-purple-300 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Mail className="w-3 h-3" />
                <span>Email</span>
              </button>
            </div>

            {/* Quick Filter Buttons for Live Sessions */}
            {activeTab === 'sessions' && (
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs shrink-0">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filter === 'all' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All ({visitors.length})
                </button>
                <button
                  onClick={() => setFilter('online')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filter === 'online'
                      ? 'bg-emerald-900/60 text-emerald-300 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Online ({stats.onlineNow})
                </button>
                <button
                  onClick={() => setFilter('members')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filter === 'members'
                      ? 'bg-blue-900/60 text-blue-300 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Members
                </button>
                <button
                  onClick={() => setFilter('guests')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filter === 'guests'
                      ? 'bg-zinc-800 text-zinc-300 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Guests
                </button>
              </div>
            )}
          </div>

          {/* Search Suggestion Chips & Active Filter Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-zinc-500 font-medium">Quick search:</span>
              <button
                onClick={() => {
                  setSearch('Deepak Solanki');
                  setSearchField('name');
                }}
                className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 text-[11px] transition"
              >
                Deepak Solanki
              </button>
              <button
                onClick={() => {
                  setSearch('solankideep36542@gmail.com');
                  setSearchField('email');
                }}
                className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 text-[11px] transition font-mono"
              >
                solankideep36542@gmail.com
              </button>
              <button
                onClick={() => {
                  setSearch('admin');
                  setSearchField('all');
                }}
                className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 text-[11px] transition"
              >
                Admin
              </button>
            </div>

            {/* Search Match Status Counter */}
            {search.trim() ? (
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-xs font-medium">
                  Matches:{' '}
                  <strong className="text-white">
                    {activeTab === 'sessions'
                      ? `${filteredVisitors.length} of ${visitors.length}`
                      : `${filteredRegisteredUsers.length} of ${registeredUsers.length}`}
                  </strong>{' '}
                  users
                </span>
                <button
                  onClick={() => setSearch('')}
                  className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              <span className="text-zinc-500 text-xs">
                Showing all {activeTab === 'sessions' ? visitors.length : registeredUsers.length} users
              </span>
            )}
          </div>
        </div>

        {/* ================= TAB 1: LIVE VISITOR SESSIONS ================= */}
        {activeTab === 'sessions' && (
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Live Visitor Sessions & Activities
                </h2>
                <p className="text-xs text-zinc-400">
                  Real-time tracking of visitors actively browsing or using the platform
                </p>
              </div>

              {loading && (
                <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  Syncing live radar...
                </span>
              )}
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/70 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Visitor / User</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Location & IP</th>
                    <th className="py-3 px-4">Device & OS</th>
                    <th className="py-3 px-4">Current Action</th>
                    <th className="py-3 px-4">Messages</th>
                    <th className="py-3 px-4">Last Seen</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {filteredVisitors.length > 0 ? (
                    filteredVisitors.map((v) => {
                      const isOnline = v.status === 'online';
                      const isIdle = v.status === 'idle';

                      return (
                        <tr key={v.visitorId} className="hover:bg-zinc-800/40 transition">
                          {/* Name & Role */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-zinc-700 to-zinc-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                {v.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-white truncate">
                                    {renderHighlighted(v.name, search)}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                      v.role === 'admin'
                                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                        : v.role === 'user'
                                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                        : 'bg-zinc-800 text-zinc-400'
                                    }`}
                                  >
                                    {v.role}
                                  </span>
                                </div>
                                <span className="text-[11px] text-zinc-400 font-mono block truncate">
                                  {renderHighlighted(v.email, search)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isOnline
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                                  : isIdle
                                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isOnline ? 'bg-emerald-400 animate-ping' : isIdle ? 'bg-amber-400' : 'bg-zinc-500'
                                }`}
                              />
                              {isOnline ? 'Active Online' : isIdle ? 'Idle' : 'Offline'}
                            </span>
                          </td>

                          {/* Location & IP */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <div>
                                <span className="text-zinc-200 font-medium block">
                                  {renderHighlighted(v.location, search)}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  {renderHighlighted(v.ipAddress, search)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Device & Browser */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <Monitor className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <div>
                                <span className="text-zinc-200 block">{v.browser}</span>
                                <span className="text-[10px] text-zinc-500">{v.os}</span>
                              </div>
                            </div>
                          </td>

                          {/* Current Action */}
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300 font-mono text-[11px] max-w-xs truncate">
                              {v.currentAction}
                            </span>
                          </td>

                          {/* Messages Count */}
                          <td className="py-3 px-4 font-mono">
                            <span className="font-semibold text-white">{v.messagesCount}</span>
                            <span className="text-zinc-500 text-[10px]"> / {v.totalVisits} visits</span>
                          </td>

                          {/* Last Seen */}
                          <td className="py-3 px-4 text-zinc-400 text-[11px] font-mono whitespace-nowrap">
                            {new Date(v.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            {v.role !== 'admin' ? (
                              <button
                                onClick={() => handleKickVisitor(v.visitorId, v.name)}
                                className="p-1 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition"
                                title="Disconnect session"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-zinc-600 font-bold uppercase">Root</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <Search className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-semibold text-zinc-200">
                            No visitors or users found matching &quot;{search}&quot;
                          </p>
                          <p className="text-xs text-zinc-500 max-w-md">
                            No user records match your search criteria. Check your spelling or clear the filter.
                          </p>
                          <button
                            onClick={() => {
                              setSearch('');
                              setFilter('all');
                            }}
                            className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition"
                          >
                            Clear Search Filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 2: REGISTERED ACCOUNTS DIRECTORY ================= */}
        {activeTab === 'accounts' && (
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  Registered User Accounts Directory
                </h2>
                <p className="text-xs text-zinc-400">
                  Full list of authenticated administrator and member profiles registered on the platform
                </p>
              </div>

              <span className="text-xs text-zinc-400 font-mono">
                Total Registered: <strong className="text-white">{registeredUsers.length}</strong>
              </span>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/70 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Account ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {filteredRegisteredUsers.length > 0 ? (
                    filteredRegisteredUsers.map((user) => {
                      const isAdmin = user.role === 'admin';
                      return (
                        <tr key={user.id} className="hover:bg-zinc-800/40 transition">
                          <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                            {renderHighlighted(user.id, search)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                                  isAdmin
                                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                    : 'bg-zinc-700 text-white'
                                }`}
                              >
                                {user.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-white">
                                {renderHighlighted(user.name, search)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-zinc-300">
                            {renderHighlighted(user.email, search)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isAdmin
                                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                  : 'bg-blue-950 text-blue-400 border border-blue-800'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-400 text-[11px] font-mono">
                            {user.createdAt}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <Search className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-semibold text-zinc-200">
                            No registered user found matching &quot;{search}&quot;
                          </p>
                          <p className="text-xs text-zinc-500 max-w-md">
                            No accounts match your name or email search. Try another query or clear the filter.
                          </p>
                          <button
                            onClick={() => setSearch('')}
                            className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition"
                          >
                            Clear Search Filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live Real-time Activity Event Stream */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold tracking-tight text-white">Live Activity Event Ticker</h3>
            </div>
            <span className="text-xs text-zinc-500">Auto-streaming live platform events</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      act.type === 'login'
                        ? 'bg-rose-500'
                        : act.type === 'tool_call'
                        ? 'bg-amber-500'
                        : act.type === 'chat'
                        ? 'bg-purple-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <span className="font-semibold text-white">
                    {renderHighlighted(act.userName, search)}:
                  </span>
                  <span className="text-zinc-300">{act.description}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                  {new Date(act.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
