import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  FileCode,
  Package,
  Truck,
  Calendar,
  CheckSquare,
  FileText,
  RotateCcw,
  Loader2,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
} from 'lucide-react';
import { Message } from '../types';
import { renderMarkdown } from '../utils/markdown';
import { GeminiSparkle } from './GeminiSparkle';

interface Props {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onSaveToNotes?: (content: string) => void;
  onFeedback?: (messageId: string, type: 'like' | 'dislike') => void;
}

export const ChatMessage: React.FC<Props> = ({
  message,
  isStreaming,
  onRegenerate,
  onSaveToNotes,
  onFeedback,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [expandedToolIdx, setExpandedToolIdx] = useState<number | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const plainText = message.content.replace(/[*#`_\[\]()]/g, '');
      const utterance = new SpeechSynthesisUtterance(plainText.slice(0, 600));
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveNote = () => {
    if (onSaveToNotes) {
      onSaveToNotes(message.content);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    }
  };

  const handleExportSingle = () => {
    const blob = new Blob([message.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-response-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper for rendering tool invocation pill
  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'get_live_weather':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'convert_currency':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-500" />;
      case 'search_web_knowledge':
        return <Sparkles className="w-3.5 h-3.5 text-blue-500" />;
      case 'lookup_dictionary':
        return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      case 'run_code_sandbox':
        return <FileCode className="w-3.5 h-3.5 text-rose-500" />;
      case 'search_product_catalog':
        return <Package className="w-3.5 h-3.5 text-teal-500" />;
      case 'check_order_status':
        return <Truck className="w-3.5 h-3.5 text-orange-500" />;
      case 'book_appointment':
        return <Calendar className="w-3.5 h-3.5 text-purple-500" />;
      case 'manage_checklist':
        return <CheckSquare className="w-3.5 h-3.5 text-amber-500" />;
      case 'save_workspace_note':
        return <FileText className="w-3.5 h-3.5 text-cyan-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  const getToolTitle = (toolName: string) => {
    switch (toolName) {
      case 'get_live_weather':
        return 'Used Weather API';
      case 'convert_currency':
        return 'Used Forex Currency Converter';
      case 'search_web_knowledge':
        return 'Searched Web Knowledge';
      case 'lookup_dictionary':
        return 'Queried Lexical Dictionary';
      case 'run_code_sandbox':
        return 'Executed Code in Sandbox';
      case 'search_product_catalog':
        return 'Searched Product Catalog';
      case 'check_order_status':
        return 'Tracked Order Status';
      case 'book_appointment':
        return 'Scheduled Appointment';
      case 'manage_checklist':
        return 'Updated Task Checklist';
      case 'save_workspace_note':
        return 'Saved Note to Workspace';
      default:
        return `Used tool ${toolName}`;
    }
  };

  /* ================= USER MESSAGE (GOOGLE GEMINI STYLE) ================= */
  if (isUser) {
    return (
      <div className="py-3 px-4 md:px-8 max-w-4xl mx-auto flex justify-end">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] space-y-1.5">
          {/* Attached Document Pill if present */}
          {message.attachedData && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-100 dark:bg-[#1e1f20] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
              <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="font-medium truncate max-w-xs">
                {message.attachedFileName || 'Attached Context'}
              </span>
            </div>
          )}

          {/* User Bubble */}
          <div className="bg-zinc-100 dark:bg-[#282a2c] text-zinc-900 dark:text-zinc-100 px-5 py-3 rounded-[24px] rounded-br-[8px] text-[15px] leading-relaxed break-words shadow-xs">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          <span className="text-[10px] text-zinc-400 font-mono pr-2">
            {message.timestamp}
          </span>
        </div>
      </div>
    );
  }

  /* ================= GEMINI ASSISTANT MESSAGE ================= */
  return (
    <div className="py-4 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="flex gap-4 items-start">
        {/* Gemini Sparkle Avatar */}
        <div className="shrink-0 pt-1">
          <GeminiSparkle className="w-6 h-6" animated={isStreaming} />
        </div>

        {/* Gemini Response Body */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header Tag / Model Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100">
                Gemini
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                {message.timestamp}
              </span>
            </div>
          </div>

          {/* Connected Tool Execution Cards (Gemini Extensions style) */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="space-y-2 my-2">
              {message.toolCalls.map((tc, idx) => {
                const isExpanded = expandedToolIdx === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#1e1f20] p-3 text-xs space-y-2 transition"
                  >
                    <div
                      onClick={() => setExpandedToolIdx(isExpanded ? null : idx)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200">
                        {getToolIcon(tc.name)}
                        <span className="font-medium">{getToolTitle(tc.name)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {tc.status === 'executing' ? (
                          <span className="flex items-center gap-1.5 text-[11px] text-blue-500 font-medium">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Executing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            Complete
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Inputs & Output */}
                    {isExpanded && (
                      <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 animate-fade-in">
                        {tc.args && (
                          <div className="text-[11px] font-mono bg-white dark:bg-[#131314] p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 overflow-x-auto">
                            <span className="text-zinc-400 font-semibold">Inputs: </span>
                            {JSON.stringify(tc.args)}
                          </div>
                        )}
                        {tc.result && (
                          <div className="text-[11px] font-mono bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 p-2.5 rounded-xl text-emerald-900 dark:text-emerald-200 overflow-x-auto">
                            <span className="font-semibold block text-[10px] uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                              Result:
                            </span>
                            <pre className="whitespace-pre-wrap max-h-36 overflow-y-auto">
                              {JSON.stringify(tc.result, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Main Message Text / Markdown */}
          <div
            className="prose-deepx text-zinc-800 dark:text-zinc-200 leading-relaxed text-[15px]"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />

          {/* Streaming Pulse indicator */}
          {isStreaming && (
            <div className="flex items-center gap-1.5 py-1 text-zinc-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className="font-mono text-[11px]">Gemini is generating response...</span>
            </div>
          )}

          {/* Google Gemini Action Toolbar */}
          <div className="flex items-center gap-1 pt-2 text-zinc-400 dark:text-zinc-500">
            {/* Feedback Buttons */}
            {onFeedback && (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => onFeedback(message.id, 'like')}
                  className={`p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#1e1f20] transition ${
                    message.feedback === 'like'
                      ? 'text-blue-500'
                      : 'hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                  title="Good response"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onFeedback(message.id, 'dislike')}
                  className={`p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#1e1f20] transition ${
                    message.feedback === 'dislike'
                      ? 'text-rose-500'
                      : 'hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                  title="Bad response"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#1e1f20] hover:text-zinc-700 dark:hover:text-zinc-200 transition text-xs flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-[11px] text-emerald-500 font-medium">Copied</span>
                </>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Listen Aloud Button */}
            <button
              onClick={handleSpeak}
              title={isSpeaking ? 'Stop speaking' : 'Listen'}
              className={`p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#1e1f20] transition ${
                isSpeaking
                  ? 'text-blue-500'
                  : 'hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Save to Notes */}
            {onSaveToNotes && (
              <button
                onClick={handleSaveNote}
                title="Save answer to workspace notes"
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#1e1f20] hover:text-zinc-700 dark:hover:text-zinc-200 transition text-xs flex items-center gap-1"
              >
                {noteSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-[11px] text-emerald-500 font-medium">Saved</span>
                  </>
                ) : (
                  <BookmarkPlus className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Export Markdown */}
            <button
              onClick={handleExportSingle}
              title="Export response as Markdown"
              className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#1e1f20] hover:text-zinc-700 dark:hover:text-zinc-200 transition"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Regenerate Button */}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                title="Regenerate response"
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#1e1f20] hover:text-zinc-700 dark:hover:text-zinc-200 transition ml-auto"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
