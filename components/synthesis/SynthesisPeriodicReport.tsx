'use client';

/**
 * components/synthesis/SynthesisPeriodicReport.tsx
 * Daily / Weekly / Monthly AI synthesis report tab.
 * Fetches from /api/synthesis/periodic-report?period=... and renders markdown.
 */

import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

type Period = 'daily' | 'weekly' | 'monthly';

interface ReportData {
  text: string;
  generatedAt: string;
  cached: boolean;
  period: Period;
}

const PERIOD_CONFIG: Record<Period, { label: string; icon: string; description: string }> = {
  daily:   { label: 'Today',   icon: '☀',  description: "Today's synthesis energy" },
  weekly:  { label: 'Week',    icon: '◈',  description: 'This week\'s arc' },
  monthly: { label: 'Month',   icon: '◉',  description: 'This month\'s themes' },
};

function MarkdownReport({ text }: { text: string }) {
  return (
    <div className="prose-synthesis">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-serif text-gold mb-4 mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-serif text-gold/90 mb-3 mt-8 pb-2 border-b border-amber/10">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-star mb-2 mt-5">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-star/80 text-sm leading-relaxed mb-4">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 mb-4 pl-4">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="text-star/70 text-sm leading-relaxed list-none before:content-['◆'] before:text-gold/40 before:mr-2">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="text-cream font-medium">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-amber/80 not-italic font-medium">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-gold/30 pl-4 my-4 text-star/60 italic text-sm">{children}</blockquote>
          ),
          hr: () => <hr className="border-amber/10 my-6" />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-amber/10 rounded w-2/5" />
      <div className="space-y-2">
        <div className="h-4 bg-amber/8 rounded w-full" />
        <div className="h-4 bg-amber/8 rounded w-5/6" />
        <div className="h-4 bg-amber/8 rounded w-4/5" />
      </div>
      <div className="h-5 bg-amber/10 rounded w-1/3 mt-6" />
      <div className="space-y-2">
        <div className="h-4 bg-amber/8 rounded w-full" />
        <div className="h-4 bg-amber/8 rounded w-3/4" />
      </div>
      <div className="h-5 bg-amber/10 rounded w-2/5 mt-6" />
      <div className="space-y-2">
        <div className="h-4 bg-amber/8 rounded w-full" />
        <div className="h-4 bg-amber/8 rounded w-5/6" />
        <div className="h-4 bg-amber/8 rounded w-full" />
        <div className="h-4 bg-amber/8 rounded w-4/6" />
      </div>
    </div>
  );
}

export function SynthesisPeriodicReport() {
  const [activePeriod, setActivePeriod] = useState<Period>('daily');
  const [reports, setReports] = useState<Partial<Record<Period, ReportData>>>({});
  const [loading, setLoading] = useState<Period | null>('daily');
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (period: Period, force = false) => {
    // Already loaded and not forcing refresh
    if (reports[period] && !force) return;

    setLoading(period);
    setError(null);

    try {
      const res = await fetch(`/api/synthesis/periodic-report?period=${period}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as ReportData;
      setReports(prev => ({ ...prev, [period]: data }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate report');
    } finally {
      setLoading(null);
    }
  }, [reports]);

  // Load daily on mount
  useEffect(() => {
    fetchReport('daily');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePeriodChange = (period: Period) => {
    setActivePeriod(period);
    fetchReport(period);
  };

  const currentReport = reports[activePeriod];
  const isLoading = loading === activePeriod;

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-1 p-1 bg-cosmos/60 border border-amber/10 rounded-lg w-fit">
        {(Object.entries(PERIOD_CONFIG) as [Period, typeof PERIOD_CONFIG.daily][]).map(([period, config]) => (
          <button
            key={period}
            onClick={() => handlePeriodChange(period)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activePeriod === period
                ? 'bg-gold/15 text-gold border border-gold/20'
                : 'text-star/60 hover:text-star hover:bg-amber/5'
            }`}
          >
            <span className="text-base">{config.icon}</span>
            {config.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="flex items-center justify-between">
        <p className="text-star/50 text-sm">{PERIOD_CONFIG[activePeriod].description}</p>
        {currentReport && (
          <div className="flex items-center gap-3">
            {currentReport.cached && (
              <span className="text-star/30 text-xs">Cached</span>
            )}
            <span className="text-star/30 text-xs">
              {new Date(currentReport.generatedAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <button
              onClick={() => fetchReport(activePeriod, true)}
              disabled={isLoading}
              className="text-amber/40 hover:text-amber text-xs transition-colors disabled:opacity-30"
            >
              ↺ Refresh
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-cosmos/40 border border-amber/10 rounded-xl p-6 min-h-64">
        {isLoading && <ReportSkeleton />}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <p className="text-red-400/80 text-sm text-center">{error}</p>
            <button
              onClick={() => fetchReport(activePeriod, true)}
              className="text-amber text-sm hover:text-gold transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && currentReport && (
          <MarkdownReport text={currentReport.text} />
        )}

        {!isLoading && !error && !currentReport && (
          <div className="flex items-center justify-center h-40">
            <p className="text-star/40 text-sm">No report available</p>
          </div>
        )}
      </div>
    </div>
  );
}
