import React, { useState } from 'react';
import {
  X,
  Code,
  Terminal,
  Play,
  Copy,
  Check,
  ExternalLink,
  CloudSun,
  Coins,
  Search,
  BookOpen,
  Cpu,
  QrCode,
  Package,
  Truck,
  Sparkles,
  Zap,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTestInChat: (prompt: string) => void;
}

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  icon: React.ReactNode;
  toolName: string;
  sampleChatPrompt: string;
  defaultParams: Record<string, string>;
  defaultBody?: string;
}

export const ApiHubModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onTestInChat,
}) => {
  const endpoints: ApiEndpoint[] = [
    {
      id: 'weather',
      name: 'Live Weather API',
      method: 'GET',
      path: '/api/weather',
      description: 'Fetches real-time temperature, humidity, wind speed, weather conditions, and 3-day forecast for any global city.',
      icon: <CloudSun className="w-4 h-4 text-amber-500" />,
      toolName: 'get_live_weather',
      sampleChatPrompt: 'What is the current weather and 3-day forecast in Tokyo?',
      defaultParams: { city: 'Tokyo' },
    },
    {
      id: 'currency',
      name: 'Forex Currency Converter API',
      method: 'GET',
      path: '/api/currency',
      description: 'Converts financial amounts between international currencies using live market exchange rates.',
      icon: <Coins className="w-4 h-4 text-emerald-500" />,
      toolName: 'convert_currency',
      sampleChatPrompt: 'Convert 450 USD to EUR at current rates',
      defaultParams: { from: 'USD', to: 'EUR', amount: '450' },
    },
    {
      id: 'search',
      name: 'Knowledge & Wikipedia API',
      method: 'GET',
      path: '/api/search',
      description: 'Searches encyclopedic databases for verified abstracts, facts, descriptions, and reference links.',
      icon: <Search className="w-4 h-4 text-blue-500" />,
      toolName: 'search_web_knowledge',
      sampleChatPrompt: 'What are the main principles of quantum computing according to research?',
      defaultParams: { q: 'Quantum Computing' },
    },
    {
      id: 'dictionary',
      name: 'Lexical & Dictionary API',
      method: 'GET',
      path: '/api/dictionary/:word',
      description: 'Retrieves phonetics, parts of speech, exact definitions, usage examples, and synonyms for words.',
      icon: <BookOpen className="w-4 h-4 text-purple-500" />,
      toolName: 'lookup_dictionary',
      sampleChatPrompt: 'Define serendipity and give 2 usage examples',
      defaultParams: { word: 'serendipity' },
    },
    {
      id: 'sandbox',
      name: 'Code Sandbox VM API',
      method: 'POST',
      path: '/api/execute-code',
      description: 'Safely executes JavaScript and math code in an isolated server sandbox and captures execution output.',
      icon: <Cpu className="w-4 h-4 text-rose-500" />,
      toolName: 'run_code_sandbox',
      sampleChatPrompt: 'Run this JavaScript code to filter numbers greater than 10 from [4, 12, 8, 25, 3]',
      defaultParams: {},
      defaultBody: JSON.stringify(
        {
          code: '// Safe sandboxed JavaScript execution\nconst numbers = [4, 12, 8, 25, 3];\nconst filtered = numbers.filter(n => n > 10);\nconsole.log("Filtered count:", filtered.length);\nfiltered;',
        },
        null,
        2
      ),
    },
    {
      id: 'qr',
      name: 'QR Code Generator API',
      method: 'GET',
      path: '/api/qr',
      description: 'Generates high-resolution scannable QR codes for web links, text, contacts, or tokens.',
      icon: <QrCode className="w-4 h-4 text-indigo-500" />,
      toolName: 'generate_qr_code',
      sampleChatPrompt: 'Generate a QR code for https://deepx.ai',
      defaultParams: { data: 'https://deepx.ai', label: 'DeepX AI' },
    },
    {
      id: 'catalog',
      name: 'Store Product Catalog API',
      method: 'GET',
      path: '/api/catalog',
      description: 'Lists all products, software tiers, stock inventory, ratings, and price specs.',
      icon: <Package className="w-4 h-4 text-teal-500" />,
      toolName: 'search_product_catalog',
      sampleChatPrompt: 'Show me available hardware products under $300',
      defaultParams: {},
    },
    {
      id: 'orders',
      name: 'Order Tracking API',
      method: 'GET',
      path: '/api/orders/:orderId',
      description: 'Fetches fulfillment timelines, tracking numbers, and delivery milestones for order IDs.',
      icon: <Truck className="w-4 h-4 text-orange-500" />,
      toolName: 'check_order_status',
      sampleChatPrompt: 'Check tracking status for order ORD-9481',
      defaultParams: { orderId: 'ORD-9481' },
    },
  ];

  const [activeEndpointId, setActiveEndpointId] = useState<string>(endpoints[0].id);
  const activeEndpoint = endpoints.find((e) => e.id === activeEndpointId) || endpoints[0];

  const [params, setParams] = useState<Record<string, string>>(activeEndpoint.defaultParams);
  const [requestBody, setRequestBody] = useState<string>(activeEndpoint.defaultBody || '');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'response' | 'curl' | 'js'>('response');

  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setActiveEndpointId(ep.id);
    setParams(ep.defaultParams);
    setRequestBody(ep.defaultBody || '');
    setResponse(null);
    setStatus(null);
    setLatency(null);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponse(null);
    setStatus(null);
    const start = performance.now();

    try {
      let url = activeEndpoint.path;

      // Handle path params like /:word or /:orderId
      if (url.includes(':word')) {
        url = url.replace(':word', encodeURIComponent(params.word || 'serendipity'));
      } else if (url.includes(':orderId')) {
        url = url.replace(':orderId', encodeURIComponent(params.orderId || 'ORD-9481'));
      } else if (activeEndpoint.method === 'GET' && Object.keys(params).length > 0) {
        const q = new URLSearchParams(params).toString();
        url = `${url}?${q}`;
      }

      const options: RequestInit = {
        method: activeEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (activeEndpoint.method === 'POST') {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      const end = performance.now();

      setStatus(res.status);
      setLatency(Math.round(end - start));
      setResponse(data);
      setActiveSnippetTab('response');
    } catch (err: any) {
      setStatus(500);
      setResponse({ error: err.message || 'Network request failed' });
    } finally {
      setLoading(false);
    }
  };

  // Generate cURL command
  const getCurlSnippet = () => {
    let url = `${window.location.origin}${activeEndpoint.path}`;
    if (url.includes(':word')) {
      url = url.replace(':word', params.word || 'serendipity');
    } else if (url.includes(':orderId')) {
      url = url.replace(':orderId', params.orderId || 'ORD-9481');
    } else if (activeEndpoint.method === 'GET' && Object.keys(params).length > 0) {
      url += `?${new URLSearchParams(params).toString()}`;
    }

    if (activeEndpoint.method === 'POST') {
      return `curl -X POST "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.replace(/'/g, "\\'")}'`;
    }
    return `curl -X GET "${url}"`;
  };

  // Generate JS fetch snippet
  const getJsSnippet = () => {
    let url = activeEndpoint.path;
    if (url.includes(':word')) {
      url = url.replace(':word', params.word || 'serendipity');
    } else if (url.includes(':orderId')) {
      url = url.replace(':orderId', params.orderId || 'ORD-9481');
    } else if (activeEndpoint.method === 'GET' && Object.keys(params).length > 0) {
      url += `?${new URLSearchParams(params).toString()}`;
    }

    if (activeEndpoint.method === 'POST') {
      return `const response = await fetch("${url}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${requestBody.trim() || '{}'})\n});\nconst data = await response.json();\nconsole.log(data);`;
    }
    return `const response = await fetch("${url}");\nconst data = await response.json();\nconsole.log(data);`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col text-zinc-900 dark:text-zinc-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">API Hub & Developer Console</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {endpoints.length} Active Endpoints
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Explore, test live REST APIs, or watch DeepX invoke them as autonomous tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content: Sidebar + Tester Console */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Endpoint List */}
          <div className="w-full md:w-72 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 overflow-y-auto p-3 space-y-1">
            <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Available APIs
            </p>
            {endpoints.map((ep) => {
              const isSelected = ep.id === activeEndpoint.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                    {ep.icon}
                  </span>
                  <div className="truncate flex-1 min-w-0">
                    <p className="truncate leading-tight">{ep.name}</p>
                    <span className={`text-[10px] font-mono opacity-80 ${isSelected ? 'text-blue-100' : 'text-zinc-400'}`}>
                      {ep.method} {ep.path.split('/')[2]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Interactive Console */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Active Endpoint Info Card */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                      activeEndpoint.method === 'GET'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {activeEndpoint.method}
                  </span>
                  <code className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {activeEndpoint.path}
                  </code>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200/60 dark:border-blue-900/60">
                  <Zap className="w-3 h-3" />
                  <span>Tool: {activeEndpoint.toolName}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {activeEndpoint.description}
              </p>

              {/* Quick ask DeepX button */}
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-[11px] text-zinc-400">Ask DeepX in conversation:</span>
                <button
                  onClick={() => {
                    onTestInChat(activeEndpoint.sampleChatPrompt);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-semibold text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  "{activeEndpoint.sampleChatPrompt}"
                </button>
              </div>
            </div>

            {/* Request Parameters / Body Editor */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {activeEndpoint.method === 'GET' ? 'Query Parameters' : 'Request Body (JSON)'}
              </span>

              {activeEndpoint.method === 'GET' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.keys(params).map((key) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-500 uppercase">{key}</label>
                      <input
                        type="text"
                        value={params[key]}
                        onChange={(e) => setParams({ ...params, [key]: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}

              {/* Execute Button */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleExecute}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  {loading ? (
                    <span>Executing...</span>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Send Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Tabs: Response vs Code Snippets */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium">
                  <button
                    onClick={() => setActiveSnippetTab('response')}
                    className={`px-3 py-1 rounded-lg transition ${
                      activeSnippetTab === 'response'
                        ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    Response
                  </button>
                  <button
                    onClick={() => setActiveSnippetTab('curl')}
                    className={`px-3 py-1 rounded-lg transition ${
                      activeSnippetTab === 'curl'
                        ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setActiveSnippetTab('js')}
                    className={`px-3 py-1 rounded-lg transition ${
                      activeSnippetTab === 'js'
                        ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    JavaScript
                  </button>
                </div>

                {status !== null && (
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold ${
                        status >= 200 && status < 300
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      Status: {status}
                    </span>
                    {latency !== null && (
                      <span className="text-zinc-400 font-mono text-[11px]">{latency}ms</span>
                    )}
                  </div>
                )}
              </div>

              {/* Tab Display Body */}
              <div className="relative">
                {activeSnippetTab === 'response' && (
                  <div className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs max-h-56 overflow-y-auto border border-zinc-800">
                    {response ? (
                      <pre className="whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
                    ) : (
                      <span className="text-zinc-500 italic">
                        Click "Send Request" above to test the API endpoint live.
                      </span>
                    )}
                  </div>
                )}

                {activeSnippetTab === 'curl' && (
                  <div className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs max-h-56 overflow-y-auto border border-zinc-800">
                    <pre className="whitespace-pre-wrap">{getCurlSnippet()}</pre>
                    <button
                      onClick={() => handleCopy(getCurlSnippet())}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
                      title="Copy cURL"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {activeSnippetTab === 'js' && (
                  <div className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs max-h-56 overflow-y-auto border border-zinc-800">
                    <pre className="whitespace-pre-wrap">{getJsSnippet()}</pre>
                    <button
                      onClick={() => handleCopy(getJsSnippet())}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
                      title="Copy JavaScript fetch code"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
