import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Paperclip,
  X,
  FileText,
  ArrowUp,
  Plus,
  Mic,
  MicOff,
  Sparkles,
  Zap,
} from 'lucide-react';
import { GeminiSparkle } from './GeminiSparkle';

interface Props {
  onSendMessage: (content: string, attachedData?: string, attachedFileName?: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  suggestions?: string[];
  onOpenConstitution?: () => void;
}

export const ChatInput: React.FC<Props> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  suggestions = [],
  onOpenConstitution,
}) => {
  const [input, setInput] = useState('');
  const [attachedData, setAttachedData] = useState<string>('');
  const [attachedFileName, setAttachedFileName] = useState<string>('');
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [pastedAttachment, setPastedAttachment] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        220
      )}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !attachedData.trim()) return;
    if (isStreaming) return;

    onSendMessage(
      input.trim(),
      attachedData || undefined,
      attachedFileName || undefined
    );
    setInput('');
    setAttachedData('');
    setAttachedFileName('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedData(content);
      setAttachedFileName(file.name);
      setIsAttachOpen(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmPastedAttachment = () => {
    if (!pastedAttachment.trim()) return;
    setAttachedData(pastedAttachment.trim());
    setAttachedFileName('Pasted Context Snippet');
    setPastedAttachment('');
    setIsAttachOpen(false);
  };

  // Voice speech-to-text dictation
  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicNotice('Voice recognition is not supported in this browser. Type your prompt instead.');
      setTimeout(() => setMicNotice(null), 3000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        // ignore
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicNotice('Listening... Speak now');
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        setMicNotice(null);
      };
      recognition.onerror = () => {
        setIsListening(false);
        setMicNotice('Could not capture audio. Try speaking again.');
        setTimeout(() => setMicNotice(null), 2500);
      };
      recognition.onend = () => {
        setIsListening(false);
        setMicNotice(null);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
      setMicNotice('Voice input unavailable');
      setTimeout(() => setMicNotice(null), 2000);
    }
  };

  const hasContent = Boolean(input.trim() || attachedData.trim());

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pb-3 pt-1">
      {/* Mic Status / Error Banner */}
      {micNotice && (
        <div className="text-center pb-2">
          <span className="text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900 shadow-xs animate-fade-in inline-flex items-center gap-1.5">
            <Mic className="w-3 h-3 text-blue-500 animate-pulse" />
            {micNotice}
          </span>
        </div>
      )}

      {/* Attached Data Pill */}
      {attachedData && (
        <div className="flex items-center justify-between p-2.5 mb-2.5 rounded-2xl bg-zinc-100 dark:bg-[#1e1f20] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="font-medium truncate">
              {attachedFileName || 'Attached Document'}
            </span>
            <span className="text-[11px] text-zinc-400">
              ({attachedData.length} chars)
            </span>
          </div>
          <button
            onClick={() => {
              setAttachedData('');
              setAttachedFileName('');
            }}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 rounded-full transition"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ================= GOOGLE GEMINI CAPSULE INPUT ================= */}
      <div className="relative rounded-[28px] border border-zinc-200/90 dark:border-zinc-700/60 bg-zinc-100/90 dark:bg-[#1e1f20] shadow-md dark:shadow-black/40 transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-500 focus-within:shadow-xl focus-within:bg-white dark:focus-within:bg-[#1e1f20]">
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Gemini..."
          rows={1}
          className="w-full px-5 pt-3.5 pb-2 bg-transparent resize-none text-[15px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none min-h-[48px] max-h-[200px] leading-relaxed"
        />

        {/* Bottom Toolbar inside the capsule */}
        <div className="px-3 pb-2.5 pt-0.5 flex items-center justify-between">
          {/* Left: Add / Attachment Trigger */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsAttachOpen(!isAttachOpen)}
              title="Add image, document, or context snippet"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                isAttachOpen || attachedData
                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.md,.json,.csv,.js,.ts,.html,.css,.py"
            />
          </div>

          {/* Right: Microphone & Send/Stop Button */}
          <div className="flex items-center gap-1.5">
            {/* Microphone Button for voice dictation */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop listening' : 'Use microphone'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send or Stop Button (Gemini Circle Action) */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                title="Stop generation"
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center shadow transition"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!hasContent}
                title="Send prompt"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  hasContent
                    ? 'bg-gradient-to-tr from-[#4a8cf6] to-[#7075f5] text-white shadow-md hover:scale-105 active:scale-95'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Attachment Flyout / Drawer */}
        {isAttachOpen && (
          <div className="absolute left-3 bottom-14 z-30 w-80 p-3.5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-zinc-200 dark:border-zinc-700 shadow-xl space-y-3 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                Attach Context / Document
              </span>
              <button
                onClick={() => setIsAttachOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition flex items-center justify-center gap-2"
            >
              <Paperclip className="w-3.5 h-3.5 text-blue-500" />
              <span>Upload text/code file</span>
            </button>

            <div className="space-y-1.5">
              <span className="text-[11px] text-zinc-500">Or paste text snippet:</span>
              <textarea
                value={pastedAttachment}
                onChange={(e) => setPastedAttachment(e.target.value)}
                placeholder="Paste JSON, code snippet, or notes..."
                rows={3}
                className="w-full p-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#131314] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleConfirmPastedAttachment}
                disabled={!pastedAttachment.trim()}
                className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
              >
                Attach Snippet
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Google Gemini Signature Disclaimer */}
      <div className="text-center pt-2">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
          Gemini may display inaccurate info, including about people, so double-check its responses.{' '}
          {onOpenConstitution && (
            <button
              onClick={onOpenConstitution}
              className="underline hover:text-zinc-700 dark:hover:text-zinc-300 transition"
            >
              Your privacy & Gemini Apps
            </button>
          )}
        </p>
      </div>
    </div>
  );
};
