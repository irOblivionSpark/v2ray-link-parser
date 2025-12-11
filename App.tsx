import React, { useState, useEffect } from 'react';
import { Outbound, V2RayConfig } from './services/v2ray';
import { 
  ClipboardDocumentIcon, 
  ArrowPathIcon,
  ArrowDownTrayIcon,
  LanguageIcon,
  StarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const REPO_PATH = "iroblivionspark/v2ray-link-parser"; // Change this if your repo name is different

const translations = {
  en: {
    title: "V2Ray Parser",
    version: "v1.0.0",
    pasteLabel: "Paste V2Ray Link",
    placeholder: "vmess://..., vless://..., trojan://...",
    supports: "Supports VMess, VLESS, Trojan, SS",
    convert: "Convert",
    outboundMode: "Outbound",
    configMode: "Config",
    configDetails: "Configuration Details",
    protocol: "Protocol",
    tag: "Tag/Remark",
    network: "Network",
    security: "Security",
    copy: "Copy JSON",
    download: "Download JSON",
    emptyError: "Please enter a V2Ray link (vmess://, vless://, etc.)",
    parseError: "Could not parse the provided link. Please check the format.",
    jsonPlaceholder: "// JSON output will appear here...",
    advSettings: "Advanced Configuration",
    dnsLabel: "DNS Servers (comma separated)",
    fragment: "Fragment",
    mux: "Mux (Multiplexing)",
    enabled: "Enabled",
    packets: "Packets",
    length: "Length",
    interval: "Interval",
    concurrency: "Concurrency",
    xudp: "XUDP Concurrency"
  },
  fa: {
    title: "مبدل وی‌توری",
    version: "نسخه ۱.۰.۰",
    pasteLabel: "لینک کانفیگ را وارد کنید",
    placeholder: "vmess://..., vless://..., trojan://...",
    supports: "پشتیبانی از VMess, VLESS, Trojan, SS",
    convert: "تبدیل",
    outboundMode: "اوت‌باند",
    configMode: "کانفیگ",
    configDetails: "جزئیات پیکربندی",
    protocol: "پروتکل",
    tag: "نام / تگ",
    network: "شبکه",
    security: "امنیت",
    copy: "کپی JSON",
    download: "دانلود فایل",
    emptyError: "لطفاً لینک کانفیگ را وارد کنید",
    parseError: "لینک وارد شده معتبر نمی‌باشد. لطفاً فرمت را بررسی کنید.",
    jsonPlaceholder: "// خروجی JSON اینجا نمایش داده می‌شود...",
    advSettings: "تنظیمات پیشرفته",
    dnsLabel: "سرورهای DNS (با ویرگول جدا کنید)",
    fragment: "فرگمنت (Fragment)",
    mux: "مالتی‌پلکس (Mux)",
    enabled: "فعال",
    packets: "پکت‌ها (Packets)",
    length: "طول (Length)",
    interval: "بازه (Interval)",
    concurrency: "همزمانی (Concurrency)",
    xudp: "همزمانی XUDP"
  }
};

function App() {
  const [inputText, setInputText] = useState('');
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [parsedObj, setParsedObj] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'fa'>('en');
  const [starCount, setStarCount] = useState<number | null>(null);
  const [configMode, setConfigMode] = useState(false);

  // Advanced Settings State
  const [dnsInput, setDnsInput] = useState("1.1.1.1,8.8.8.8");
  
  const [fragEnabled, setFragEnabled] = useState(false);
  const [fragPackets, setFragPackets] = useState("tlshello");
  const [fragLength, setFragLength] = useState("100-200");
  const [fragInterval, setFragInterval] = useState("10-20");

  const [muxEnabled, setMuxEnabled] = useState(false);
  const [muxConcurrency, setMuxConcurrency] = useState(8);
  const [muxXudp, setMuxXudp] = useState(16);

  const t = translations[lang];
  const isRTL = lang === 'fa';

  useEffect(() => {
    // Fetch GitHub stars
    fetch(`https://api.github.com/repos/${REPO_PATH}`)
      .then(res => res.json())
      .then(data => {
        if (typeof data.stargazers_count === 'number') {
          setStarCount(data.stargazers_count);
        }
      })
      .catch(err => console.error("Failed to fetch GitHub stars", err));
  }, []);

  // Re-parse when toggling mode or changing options if input is already parsed
  useEffect(() => {
    if (inputText) {
      handleParse();
    }
  }, [configMode, fragEnabled, fragPackets, fragLength, fragInterval, muxEnabled, muxConcurrency, muxXudp, dnsInput]);

  const handleParse = () => {
    setError(null);
    setJsonOutput('');
    
    if (!inputText.trim()) {
      // Don't show error immediately on empty input unless user clicked convert
      if (parsedObj) setParsedObj(null);
      return;
    }

    try {
      const lines = inputText.trim().split('\n');
      const firstLink = lines[0].trim();
      
      const outbound = Outbound.fromLink(firstLink);
      
      if (outbound) {
        setParsedObj(outbound.toJson());
        
        let finalOutput;
        if (configMode) {
          const options = {
            dns: dnsInput,
            fragment: fragEnabled ? {
              enabled: true,
              packets: fragPackets,
              length: fragLength,
              interval: fragInterval
            } : undefined,
            mux: muxEnabled ? {
              enabled: true,
              concurrency: muxConcurrency,
              xudpConcurrency: muxXudp
            } : undefined
          };
          finalOutput = V2RayConfig.parse(firstLink, options);
        } else {
          finalOutput = { outbound: outbound.toJson() };
        }

        setJsonOutput(JSON.stringify(finalOutput, null, 2));
      } else {
        setError(t.parseError);
        setParsedObj(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(`Parsing error: ${err.message}`);
      setParsedObj(null);
    }
  };

  const manualParseClick = () => {
      if (!inputText.trim()) {
          setError(t.emptyError);
          return;
      }
      handleParse();
  };

  const handleCopy = () => {
    if (jsonOutput) {
      navigator.clipboard.writeText(jsonOutput);
    }
  };

  const handleDownload = () => {
    if (!jsonOutput) return;
    try {
      const blob = new Blob([jsonOutput], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // If config mode, name it 'config.json', else 'outbound.json' or similar
      const prefix = configMode ? 'config' : 'outbound';
      a.download = `${prefix}-${parsedObj?.tag || 'v2ray'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const toggleLang = () => {
    setLang(current => current === 'en' ? 'fa' : 'en');
  };

  return (
    <div 
      className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-emerald-500/30"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
              V
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              {t.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button 
              onClick={toggleLang}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              <LanguageIcon className="w-4 h-4" />
              <span>{lang === 'en' ? 'FA' : 'EN'}</span>
            </button>

            <a 
              href={`https://github.com/${REPO_PATH}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-all group border border-transparent hover:border-slate-600"
            >
              <span className="text-xs font-mono text-slate-500 group-hover:text-emerald-400 transition-colors hidden sm:block">
                {t.version}
              </span>
              
              <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

              <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-slate-400 group-hover:text-white">
                 <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                {starCount !== null && (
                  <div className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-900/50 px-1.5 py-0.5 rounded text-xs font-semibold">
                    <StarIcon className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{starCount}</span>
                  </div>
                )}
              </div>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Input */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 shadow-xl">
              <label htmlFor="input" className="block text-sm font-medium text-slate-400 mb-2">
                {t.pasteLabel}
              </label>
              <textarea
                id="input"
                rows={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-300 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono text-sm resize-none"
                placeholder={t.placeholder}
                dir="ltr" // Links are always LTR
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-500 text-center sm:text-left rtl:sm:text-right hidden sm:block">{t.supports}</span>
                <div className="flex items-center space-x-3 rtl:space-x-reverse w-full sm:w-auto">
                    {/* Toggle Switch */}
                    <div className="flex items-center gap-2.5 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700/50">
                        <span 
                            className={`text-xs font-medium cursor-pointer transition-colors select-none ${!configMode ? 'text-white' : 'text-slate-500'}`}
                            onClick={() => setConfigMode(false)}
                        >
                            {t.outboundMode}
                        </span>
                        <button
                            type="button"
                            onClick={() => setConfigMode(!configMode)}
                            className={`
                                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                ${configMode ? 'bg-emerald-500' : 'bg-slate-600'}
                            `}
                            role="switch"
                            aria-checked={configMode}
                            dir="ltr"
                        >
                            <span
                                aria-hidden="true"
                                className={`
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                    ${configMode ? 'translate-x-5' : 'translate-x-0'}
                                `}
                            />
                        </button>
                        <span 
                            className={`text-xs font-medium cursor-pointer transition-colors select-none ${configMode ? 'text-white' : 'text-slate-500'}`}
                            onClick={() => setConfigMode(true)}
                        >
                            {t.configMode}
                        </span>
                    </div>

                    <button
                    onClick={manualParseClick}
                    disabled={!inputText}
                    className="flex-1 sm:flex-none flex items-center space-x-2 rtl:space-x-reverse px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20 justify-center min-w-[120px]"
                    >
                    <ArrowPathIcon className="w-5 h-5" />
                    <span>{t.convert}</span>
                    </button>
                </div>
              </div>
            </div>

            {/* Advanced Settings Panel - Only in Config Mode */}
            {configMode && (
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-slate-400 border-b border-slate-700/50 pb-2">
                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">{t.advSettings}</h3>
                </div>

                {/* DNS */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.dnsLabel}</label>
                    <input 
                        type="text" 
                        value={dnsInput} 
                        onChange={(e) => setDnsInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                        dir="ltr"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fragment */}
                    <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-700/30">
                         <div className="flex items-center justify-between mb-3">
                             <span className="text-sm font-medium text-slate-300">{t.fragment}</span>
                             <label className="inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={fragEnabled} onChange={(e) => setFragEnabled(e.target.checked)} className="sr-only peer" />
                                <div className="relative w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                         </div>
                         <div className={`space-y-3 transition-opacity duration-200 ${fragEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <div>
                                <label className="block text-[10px] uppercase text-slate-500 mb-1">{t.packets}</label>
                                <input type="text" value={fragPackets} onChange={(e) => setFragPackets(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300" dir="ltr" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] uppercase text-slate-500 mb-1">{t.length}</label>
                                    <input type="text" value={fragLength} onChange={(e) => setFragLength(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300" dir="ltr" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase text-slate-500 mb-1">{t.interval}</label>
                                    <input type="text" value={fragInterval} onChange={(e) => setFragInterval(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300" dir="ltr" />
                                </div>
                            </div>
                         </div>
                    </div>

                    {/* Mux */}
                    <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-700/30">
                         <div className="flex items-center justify-between mb-3">
                             <span className="text-sm font-medium text-slate-300">{t.mux}</span>
                             <label className="inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={muxEnabled} onChange={(e) => setMuxEnabled(e.target.checked)} className="sr-only peer" />
                                <div className="relative w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                         </div>
                         <div className={`space-y-3 transition-opacity duration-200 ${muxEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] uppercase text-slate-500 mb-1">{t.concurrency}</label>
                                    <input type="number" value={muxConcurrency} onChange={(e) => setMuxConcurrency(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300" dir="ltr" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase text-slate-500 mb-1">{t.xudp}</label>
                                    <input type="number" value={muxXudp} onChange={(e) => setMuxXudp(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300" dir="ltr" />
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
              </div>
            )}

            {/* Parsing Stats / Info Card */}
            {parsedObj && (
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{t.configDetails}</h3>
                <div className="grid grid-cols-2 gap-4" dir="ltr"> {/* Keep values LTR mostly */}
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <div className={`text-xs text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t.protocol}</div>
                    <div className={`text-lg font-mono text-emerald-400 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>{parsedObj.protocol}</div>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <div className={`text-xs text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t.tag}</div>
                    <div className={`text-sm font-medium text-white truncate ${isRTL ? 'text-right' : 'text-left'}`} title={parsedObj.tag}>{parsedObj.tag || "N/A"}</div>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <div className={`text-xs text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t.network}</div>
                    <div className={`text-sm font-medium text-cyan-400 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>{parsedObj.streamSettings?.network || "TCP"}</div>
                  </div>
                   <div className="p-3 bg-slate-900/50 rounded-lg">
                    <div className={`text-xs text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t.security}</div>
                    <div className={`text-sm font-medium text-amber-400 uppercase ${isRTL ? 'text-right' : 'text-left'}`}>{parsedObj.streamSettings?.security || "None"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="flex flex-col h-full min-h-[500px]">
            <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden shadow-2xl flex flex-col">
              
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800" dir="ltr">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                </div>
                {parsedObj && (
                  <div className="flex items-center space-x-2">
                      <button
                        onClick={handleDownload}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        title={t.download}
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        title={t.copy}
                      >
                        <ClipboardDocumentIcon className="w-5 h-5" />
                      </button>
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-auto p-4 relative" dir="ltr">
                {error && (
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20">
                     <div className="text-rose-400 bg-rose-950/30 px-6 py-4 rounded-xl border border-rose-900/50" dir={isRTL ? 'rtl' : 'ltr'}>
                       {error}
                     </div>
                   </div>
                )}

                <pre className={`font-mono text-sm leading-relaxed ${jsonOutput ? 'text-emerald-300' : 'text-slate-600'}`}>
                  {jsonOutput || t.jsonPlaceholder}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
