import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeHero } from './components/WelcomeHero';
import { ToolsDrawer } from './components/ToolsDrawer';
import { ConstitutionModal } from './components/ConstitutionModal';
import { ApiHubModal } from './components/ApiHubModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatSession, Message, WebsiteData, UserProfile } from './types';

const STORAGE_KEY_SESSIONS = 'deepx_ai_sessions_v1';
const STORAGE_KEY_ACTIVE = 'deepx_ai_active_session_v1';
const STORAGE_KEY_THEME = 'deepx_ai_theme_v1';
const STORAGE_KEY_USER = 'deepx_ai_user_v1';
const ADMIN_DEFAULT_PASS = 'Deepak@582010';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // User Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved user:', e);
    }
    return null;
  });

  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved sessions:', e);
    }
    const defaultSession: ChatSession = {
      id: 'session-default',
      title: 'New Conversation',
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
      messages: [],
    };
    return [defaultSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE) || sessions[0]?.id || 'session-default';
  });

  // UI Drawer & Modal states
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);
  const [isConstitutionOpen, setIsConstitutionOpen] = useState(false);
  const [isApiHubOpen, setIsApiHubOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'user' | 'admin'>('user');
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Live website data
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [darkMode]);

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }
  }, [sessions]);

  // Persist active session
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE, activeSessionId);
  }, [activeSessionId]);

  // Persist current user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [currentUser]);

  // Live Visitor Telemetry Heartbeat
  useEffect(() => {
    let visitorId = localStorage.getItem('deepx_visitor_id');
    if (!visitorId) {
      visitorId = `vis-${Date.now().toString().slice(-6)}`;
      localStorage.setItem('deepx_visitor_id', visitorId);
    }

    const trackVisitor = async (actionDesc?: string) => {
      try {
        await fetch('/api/visitors/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId,
            name: currentUser?.name || 'Visitor',
            email: currentUser?.email || 'guest@visitor.deepx.ai',
            role: currentUser?.role || 'guest',
            action: actionDesc || 'Exploring DeepX Assistant Workspace',
            browser: navigator.userAgent.includes('Chrome')
              ? 'Chrome'
              : navigator.userAgent.includes('Safari')
              ? 'Safari'
              : navigator.userAgent.includes('Firefox')
              ? 'Firefox'
              : 'Modern Browser',
            os: navigator.userAgent.includes('Mac')
              ? 'macOS'
              : navigator.userAgent.includes('Windows')
              ? 'Windows 11'
              : 'Linux',
          }),
        });
      } catch (e) {
        // Best effort
      }
    };

    trackVisitor('Connected to DeepX AI Assistant');
    const heartbeat = setInterval(() => trackVisitor(), 10000);
    return () => clearInterval(heartbeat);
  }, [currentUser]);

  // Fetch website data from server
  const fetchWebsiteData = async () => {
    try {
      const res = await fetch('/api/website-data');
      if (res.ok) {
        const data = await res.json();
        setWebsiteData(data);
      }
    } catch (err) {
      console.warn('Could not fetch website data:', err);
    }
  };

  useEffect(() => {
    fetchWebsiteData();
  }, []);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Create new session
  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) return;
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0].id);
    }
  };

  // Rename session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  // Clear current chat
  const handleClearChat = () => {
    if (window.confirm('Clear all messages in this conversation?')) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId ? { ...s, messages: [] } : s
        )
      );
    }
  };

  // Export current chat
  const handleExportChat = () => {
    if (!activeSession || activeSession.messages.length === 0) return;

    let markdown = `# ${activeSession.title}\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`;
    for (const msg of activeSession.messages) {
      const role = msg.role === 'user' ? 'User' : 'DeepX AI';
      markdown += `### ${role} (${msg.timestamp})\n\n${msg.content}\n\n`;
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        markdown += `*Tools Used:* ${msg.toolCalls.map((t) => t.name).join(', ')}\n\n`;
      }
      markdown += `---\n\n`;
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DeepX_${activeSession.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Login handlers
  const handleOpenAuth = (mode: 'user' | 'admin' = 'user') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setIsAdminDashboardOpen(true);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setIsAdminDashboardOpen(false);
  };

  // Send message
  const handleSendMessage = async (
    userContent: string,
    attachedData?: string,
    attachedFileName?: string
  ) => {
    if (!userContent.trim() && !attachedData?.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedData,
      attachedFileName,
    };

    const assistantMessageId = `asst-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolCalls: [],
    };

    // Auto-name conversation if title is still default
    const shouldUpdateTitle =
      activeSession.messages.length === 0 && activeSession.title === 'New Conversation';
    const newTitle = shouldUpdateTitle
      ? userContent.slice(0, 32) + (userContent.length > 32 ? '...' : '')
      : activeSession.title;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: newTitle,
            updatedAt: new Date().toLocaleDateString(),
            messages: [...s.messages, userMessage, assistantPlaceholder],
          };
        }
        return s;
      })
    );

    setIsStreaming(true);
    setTimeout(scrollToBottom, 50);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const allMessages = [...activeSession.messages, userMessage];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          attachedData: attachedData,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No readable response body.');

      let buffer = '';
      let accumulatedText = '';
      const currentToolCalls: Array<{
        name: string;
        args: any;
        result?: any;
        status: 'executing' | 'completed' | 'failed';
      }> = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          let event = 'message';
          let dataStr = '';

          const parts = line.split('\n');
          for (const p of parts) {
            if (p.startsWith('event: ')) {
              event = p.substring(7).trim();
            } else if (p.startsWith('data: ')) {
              dataStr = p.substring(6).trim();
            }
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            if (event === 'token') {
              accumulatedText += data.text || '';
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id === activeSessionId) {
                    return {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMessageId
                          ? { ...m, content: accumulatedText }
                          : m
                      ),
                    };
                  }
                  return s;
                })
              );
              scrollToBottom();
            } else if (event === 'tool_call') {
              const tc = {
                name: data.name,
                args: data.args,
                status: 'executing' as const,
              };
              currentToolCalls.push(tc);

              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id === activeSessionId) {
                    return {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMessageId
                          ? { ...m, toolCalls: [...currentToolCalls] }
                          : m
                      ),
                    };
                  }
                  return s;
                })
              );
              scrollToBottom();
            } else if (event === 'tool_result') {
              const existing = currentToolCalls.find((t) => t.name === data.name);
              if (existing) {
                existing.status = 'completed';
                existing.result = data.result;
              }

              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id === activeSessionId) {
                    return {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMessageId
                          ? { ...m, toolCalls: [...currentToolCalls] }
                          : m
                      ),
                    };
                  }
                  return s;
                })
              );

              fetchWebsiteData();
              scrollToBottom();
            } else if (event === 'error') {
              accumulatedText += `\n\n*Notice: ${data.message}*`;
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id === activeSessionId) {
                    return {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMessageId
                          ? { ...m, content: accumulatedText }
                          : m
                      ),
                    };
                  }
                  return s;
                })
              );
            }
          } catch (err) {
            console.error('Error parsing SSE event:', err);
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Chat generation error:', err);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content:
                          m.content ||
                          'I apologize, but I encountered an error connecting with the assistant. Please try again.',
                      }
                    : m
                ),
              };
            }
            return s;
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
      fetchWebsiteData();
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  // Feedback handler
  const handleFeedback = (messageId: string, type: 'like' | 'dislike') => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === messageId
                ? { ...m, feedback: m.feedback === type ? undefined : type }
                : m
            ),
          };
        }
        return s;
      })
    );
  };

  // Save answer to notes
  const handleSaveToNotes = (content: string) => {
    if (!content) return;
    const firstLine = content.split('\n')[0].replace(/[#*]/g, '').trim();
    const title = firstLine.slice(0, 40) || 'Assistant Note';

    if (websiteData) {
      const newNote = {
        id: `note-${Date.now()}`,
        title,
        content,
        tags: ['saved-chat'],
        updatedAt: new Date().toISOString(),
      };
      setWebsiteData({
        ...websiteData,
        workspaceNotes: [newNote, ...websiteData.workspaceNotes],
      });
    }
  };

  // Checklist handlers for drawer
  const handleToggleChecklist = async (id: string) => {
    try {
      const res = await fetch('/api/checklist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchWebsiteData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddChecklist = async (title: string, priority: 'low' | 'medium' | 'high') => {
    try {
      const res = await fetch('/api/checklist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, priority }),
      });
      if (res.ok) {
        fetchWebsiteData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getDynamicSuggestions = (): string[] => {
    if (activeSession.messages.length === 0) return [];
    const lastMessage = activeSession.messages[activeSession.messages.length - 1];
    if (lastMessage.role === 'assistant') {
      return [
        'Can you provide a concrete example?',
        'Summarize this into a concise checklist',
        'Save this to my workspace notes',
        'Check related items in our catalog',
      ];
    }
    return [];
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onSelectPrompt={(p) => handleSendMessage(p)}
        websiteData={websiteData}
        onOpenToolsDrawer={() => setIsToolsDrawerOpen(true)}
        onOpenConstitution={() => setIsConstitutionOpen(true)}
        onOpenApiHub={() => setIsApiHubOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        currentUser={currentUser}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Chat Workspace (Google Gemini Canvas) */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-[#131314] relative">
        {/* Header */}
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenToolsDrawer={() => setIsToolsDrawerOpen(true)}
          onOpenConstitution={() => setIsConstitutionOpen(true)}
          onOpenApiHub={() => setIsApiHubOpen(true)}
          onOpenAuth={handleOpenAuth}
          onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
          onSignOut={handleSignOut}
          currentUser={currentUser}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(!darkMode)}
          onClearChat={handleClearChat}
          onExportChat={handleExportChat}
          hasMessages={activeSession.messages.length > 0}
          websiteData={websiteData}
        />

        {/* Messages Feed or Welcome Hero */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {activeSession.messages.length === 0 ? (
            <WelcomeHero
              onSelectPrompt={(p) => handleSendMessage(p)}
              onOpenConstitution={() => setIsConstitutionOpen(true)}
              onOpenApiHub={() => setIsApiHubOpen(true)}
              userName={currentUser?.name}
            />
          ) : (
            <div className="py-6 space-y-4">
              {activeSession.messages.map((message, idx) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming && idx === activeSession.messages.length - 1}
                  onFeedback={handleFeedback}
                  onSaveToNotes={handleSaveToNotes}
                  onRegenerate={
                    idx === activeSession.messages.length - 1 && !isStreaming
                      ? () => {
                          const prevUserMsg = activeSession.messages
                            .slice(0, -1)
                            .reverse()
                            .find((m) => m.role === 'user');
                          if (prevUserMsg) {
                            handleSendMessage(prevUserMsg.content, prevUserMsg.attachedData);
                          }
                        }
                      : undefined
                  }
                />
              ))}
              <div ref={chatBottomRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Google Gemini Capsule Input Composer */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          suggestions={getDynamicSuggestions()}
          onOpenConstitution={() => setIsConstitutionOpen(true)}
        />
      </div>

      {/* Connected Tools Live Drawer */}
      <ToolsDrawer
        isOpen={isToolsDrawerOpen}
        onClose={() => setIsToolsDrawerOpen(false)}
        data={websiteData}
        onAskAboutProduct={(name) =>
          handleSendMessage(`Can you explain the key features, specs, and price of ${name}?`)
        }
        onCheckOrder={(orderId) =>
          handleSendMessage(`Please check the current order tracking status and delivery updates for ${orderId}.`)
        }
        onToggleChecklist={handleToggleChecklist}
        onAddChecklist={handleAddChecklist}
      />

      {/* API Hub & Interactive Console Modal */}
      <ApiHubModal
        isOpen={isApiHubOpen}
        onClose={() => setIsApiHubOpen(false)}
        onTestInChat={(p) => handleSendMessage(p)}
      />

      {/* User Login & Admin Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authModalMode}
      />

      {/* Dedicated Admin Visitor & Telemetry Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        currentUser={currentUser}
        adminPassword={ADMIN_DEFAULT_PASS}
      />

      {/* Constitution & Safety Standards Modal */}
      <ConstitutionModal
        isOpen={isConstitutionOpen}
        onClose={() => setIsConstitutionOpen(false)}
      />
    </div>
  );
}
