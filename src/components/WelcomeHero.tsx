import React from 'react';
import {
  BookOpen,
  PenTool,
  Code2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Terminal,
  CloudSun,
  Coins,
  QrCode,
  Zap,
  ShoppingBag,
} from 'lucide-react';
import { GeminiSparkle } from './GeminiSparkle';

interface Props {
  onSelectPrompt: (prompt: string) => void;
  onOpenConstitution: () => void;
  onOpenApiHub: () => void;
  userName?: string;
}

export const WelcomeHero: React.FC<Props> = ({
  onSelectPrompt,
  onOpenConstitution,
  onOpenApiHub,
  userName,
}) => {
  // Extract first name if available
  const displayName = userName ? userName.split(' ')[0] : 'there';

  const cards = [
    {
      title: 'Explain Concepts & Science',
      prompt: 'Explain the difference between quantum computing and classical computing in plain English.',
      icon: <Compass className="w-5 h-5 text-[#4a8cf6]" />,
    },
    {
      title: 'Writing & Communication',
      prompt: 'Draft a polite and persuasive product launch announcement email for software engineers.',
      icon: <PenTool className="w-5 h-5 text-[#7075f5]" />,
    },
    {
      title: 'Coding & Architecture',
      prompt: 'Write a TypeScript helper with retry logic and exponential backoff, explaining each step.',
      icon: <Code2 className="w-5 h-5 text-[#12c2e9]" />,
    },
    {
      title: 'Connected APIs & Live Tools',
      prompt: 'What is the current live weather in Tokyo and convert 500 USD to EUR?',
      icon: <Zap className="w-5 h-5 text-[#c471ed]" />,
    },
  ];

  const apiShortcuts = [
    {
      label: 'Weather API',
      prompt: 'What is the current weather and 3-day forecast in Tokyo?',
      icon: <CloudSun className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      label: 'Forex Converter',
      prompt: 'Convert 500 USD to EUR at current exchange rates',
      icon: <Coins className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      label: 'Code VM Sandbox',
      prompt: 'Run this JavaScript code in the sandbox: const numbers = [9, 3, 7, 1]; numbers.sort(); numbers;',
      icon: <Terminal className="w-3.5 h-3.5 text-blue-400" />,
    },
    {
      label: 'Order Delivery Tracker',
      prompt: 'Check the real-time shipping status and estimated arrival for order ORD-9481.',
      icon: <ShoppingBag className="w-3.5 h-3.5 text-rose-400" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-16 space-y-10 animate-fade-in flex flex-col justify-center min-h-[70vh]">
      {/* Google Gemini Signature Gradient Greeting */}
      <div className="space-y-2 pt-4">
        <div className="inline-flex items-center gap-2 mb-2">
          <GeminiSparkle className="w-7 h-7" animated />
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
            Gemini 2.5 Flash
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight bg-gradient-to-r from-[#4a8cf6] via-[#7075f5] to-[#c471ed] bg-clip-text text-transparent">
          Hello, {displayName}
        </h1>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-zinc-400 dark:text-zinc-500 tracking-tight">
          How can I help you today?
        </h2>
      </div>

      {/* 4 Google Gemini Prompt Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((c, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPrompt(c.prompt)}
            className="group relative h-44 p-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-[#1e1f20] dark:hover:bg-[#282a2c] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <p className="text-sm font-normal text-zinc-800 dark:text-zinc-200 leading-relaxed group-hover:text-zinc-900 dark:group-hover:text-white transition">
              {c.prompt}
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-zinc-500 font-medium">
                {c.title}
              </span>
              <div className="w-8 h-8 rounded-full bg-white dark:bg-[#131314] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                {c.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connected Live Tools & API Hub Links */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Connected Tools & APIs
          </span>
          <button
            onClick={onOpenApiHub}
            className="text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1"
          >
            <span>Open API Hub & Console</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {apiShortcuts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(s.prompt)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-[#1e1f20] hover:bg-zinc-200 dark:hover:bg-[#282a2c] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 transition"
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
