
import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Download, Copy, Check, Loader2, FileCode, GitCommit, BrainCircuit } from 'lucide-react';
import { Button } from './Button';
import { AIAnalysisResult } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  isGenerating: boolean;
  onAnalysisComplete: (result: AIAnalysisResult) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, markdown, isGenerating, onAnalysisComplete }) => {
  const [copied, setCopied] = useState(false);
  const [cleanMarkdown, setCleanMarkdown] = useState('');
  const [progressStep, setProgressStep] = useState(0);
  const [localResult, setLocalResult] = useState<AIAnalysisResult | null>(null);

  const progressMessages = [
    { text: "Reading source code files...", icon: FileCode },
    { text: "Checking Google Search for dependencies...", icon: BrainCircuit },
    { text: "Analyzing architectural patterns...", icon: BrainCircuit },
    { text: "Reviewing commit history...", icon: GitCommit },
    { text: "Generating insights & scores...", icon: Loader2 },
    { text: "Finalizing report...", icon: Check },
  ];

  useEffect(() => {
    // Regex to find JSON block: ```json { ... } ```
    const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```/g;
    let match;
    let strippedMarkdown = markdown;

    while ((match = jsonRegex.exec(markdown)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        
        // We only care about the main analysis result here which contains scores
        if (parsed.scores && parsed.commitSummaries) {
           if (!localResult) {
             setLocalResult(parsed);
             onAnalysisComplete(parsed);
           }
        }
        
        // Remove this block from display
        strippedMarkdown = strippedMarkdown.replace(match[0], '');
      } catch (e) {
        // incomplete JSON
      }
    }
    
    setCleanMarkdown(strippedMarkdown.trim());

  }, [markdown, localResult, onAnalysisComplete]);

  // Handle Progress Animation
  useEffect(() => {
    if (isGenerating) {
      setLocalResult(null); // Reset on new run
      setProgressStep(0);
      const interval = setInterval(() => {
        setProgressStep(prev => (prev < progressMessages.length - 1 ? prev + 1 : prev));
      }, 1500); 
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([cleanMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-[800px] bg-[hsl(var(--surface-3))] shadow-[-10px_0_30px_rgba(0,0,0,var(--shadow-strength))] transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-[hsl(var(--surface-2))] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[hsl(var(--surface-2))] bg-[hsl(var(--surface-3))] sticky top-0 z-10 shrink-0">
        <h2 className="font-semibold text-lg text-[hsl(var(--text-main))] flex items-center gap-2">
          <BrainCircuit size={20} className="text-[hsl(var(--primary))]" />
          AI Review Assessment
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="p-2 text-[hsl(var(--text-dim))] hover:text-[hsl(var(--text-main))] transition-colors rounded-md hover:bg-[hsl(var(--surface-2))]"
            title="Copy to clipboard"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <Button onClick={handleExport} variant="secondary" className="px-3 py-1.5 text-sm h-8">
            <Download size={14} className="mr-2" />
            Export
          </Button>
          <button 
            onClick={onClose}
            className="p-2 text-[hsl(var(--text-dim))] hover:text-[hsl(var(--text-main))] transition-colors rounded-md hover:bg-[hsl(var(--surface-2))]"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 scroll-smooth relative bg-[hsl(var(--bg))]">
        
        {/* State: Generating / Progress */}
        {isGenerating && !localResult && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--surface-3))] z-20 space-y-8 p-8 backdrop-blur-sm bg-opacity-90">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-[hsl(var(--surface-1))] rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[hsl(var(--primary))] rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <BrainCircuit className="w-8 h-8 text-[hsl(var(--primary))]" />
              </div>
            </div>
            
            <div className="w-full max-w-sm space-y-4">
              {progressMessages.map((msg, idx) => {
                const Icon = msg.icon;
                const isActive = idx === progressStep;
                const isDone = idx < progressStep;
                
                return (
                  <div key={idx} className={`flex items-center gap-4 transition-all duration-300 ${isActive || isDone ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                      isDone ? 'bg-green-500/20 border-green-500 text-green-500' : 
                      isActive ? 'bg-[hsl(var(--primary))]/20 border-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 
                      'border-[hsl(var(--surface-2))] text-[hsl(var(--text-dim))]'
                    }`}>
                      {isDone ? <Check size={14} /> : <Icon size={14} className={isActive ? 'animate-pulse' : ''} />}
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-[hsl(var(--text-main))]' : 'text-[hsl(var(--text-dim))]'}`}>
                      {msg.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* State: Markdown Report */}
        {cleanMarkdown ? (
          <div className="prose prose-sm max-w-none animate-in fade-in duration-500">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  return !inline ? (
                    <div className="relative rounded-md overflow-hidden my-6 border border-[hsl(var(--surface-2))] shadow-lg bg-[hsl(var(--surface-1))]">
                      <div className="px-4 py-2 bg-[hsl(var(--surface-2))] text-xs text-[hsl(var(--text-dim))] font-mono flex items-center gap-2">
                        <FileCode size={12} /> Snippet
                      </div>
                      <code className="block p-4 overflow-x-auto text-sm font-mono text-[hsl(var(--primary))]" {...props}>
                        {children}
                      </code>
                    </div>
                  ) : (
                    <code className="bg-[hsl(var(--surface-2))] px-1.5 py-0.5 rounded text-[hsl(var(--primary))] font-mono text-sm border border-[hsl(var(--surface-3))]" {...props}>
                      {children}
                    </code>
                  );
                },
                h1: ({children}) => (
                  <div className="mb-8 pb-4 border-b-2 border-[hsl(var(--surface-2))] mt-8">
                     <h1 className="text-3xl font-bold text-[hsl(var(--text-main))] tracking-tight">{children}</h1>
                  </div>
                ),
                h2: ({children}) => (
                  <div className="mt-12 mb-6 flex items-center gap-3 p-3 bg-[hsl(var(--surface-1))] rounded-lg border-l-4 border-[hsl(var(--primary))] shadow-sm">
                    <BrainCircuit size={20} className="text-[hsl(var(--primary))]" />
                    <h2 className="text-xl font-bold text-[hsl(var(--text-main))] m-0">{children}</h2>
                  </div>
                ),
                h3: ({children}) => <h3 className="text-lg font-semibold text-[hsl(var(--primary))] mt-8 mb-3">{children}</h3>,
                ul: ({children}) => <ul className="space-y-3 text-[hsl(var(--text-main))] list-none pl-0 mb-6">{children}</ul>,
                li: ({children}) => (
                  <li className="pl-6 relative before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-2 before:h-2 before:bg-[hsl(var(--primary))] before:rounded-full bg-[hsl(var(--surface-1))]/20 p-3 rounded hover:bg-[hsl(var(--surface-1))] transition-colors">
                    {children}
                  </li>
                ),
                p: ({children}) => <p className="mb-4 text-[hsl(var(--text-main))] leading-relaxed text-base opacity-90">{children}</p>,
                strong: ({children}) => <strong className="text-[hsl(var(--primary))] font-bold">{children}</strong>,
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-[hsl(var(--surface-3))] pl-4 italic text-[hsl(var(--text-dim))] my-6 py-2 bg-[hsl(var(--surface-1))]/50 rounded-r-lg">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="border-[hsl(var(--surface-2))] my-10" />
              }}
            >
              {cleanMarkdown}
            </ReactMarkdown>
          </div>
        ) : !isGenerating && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-[hsl(var(--text-dim))] opacity-30">
            <BrainCircuit size={64} strokeWidth={1} />
            <p className="mt-4 font-light text-lg">AI Ready to Analyze</p>
          </div>
        )}
      </div>
    </div>
  );
};
