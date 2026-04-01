"use client";

/**
 * components/synthesis/SynthesisPeriodicReport.tsx
 * Daily / Weekly / Monthly AI synthesis report tab.
 * Fetches from /api/synthesis/periodic-report?period=... and renders markdown.
 */

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import {
  synthesisBodyMuted,
  synthesisInnerPanel,
  synthesisPrimaryCta,
  synthesisTitleCinzel,
} from "@/components/synthesis/synthesisPanelClasses";

type Period = 'daily' | 'weekly' | 'monthly';

interface ReportData {
  text: string;
  generatedAt: string;
  cached: boolean;
  period: Period;
  nextGenerationDate?: string;
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
            <h1 className="mb-4 mt-0 text-2xl font-normal" style={synthesisTitleCinzel}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className="mb-3 mt-8 border-b border-white/10 pb-2 text-lg font-normal"
              style={synthesisTitleCinzel}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className="mb-2 mt-5 text-base font-medium"
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                color: "var(--cream, rgba(255,255,255,0.88))",
              }}
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-sm leading-relaxed" style={synthesisBodyMuted}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 mb-4 pl-4">{children}</ul>
          ),
          li: ({ children }) => (
            <li
              className="list-none text-sm leading-relaxed before:mr-2 before:text-[color:var(--gold-solar,#D4AF37)] before:opacity-50 before:content-['◆']"
              style={synthesisBodyMuted}
            >
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong style={{ color: "var(--cream, rgba(255,255,255,0.92))", fontWeight: 600 }}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="not-italic font-medium" style={{ color: "var(--amber, #c8873a)" }}>
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className="my-4 border-l-2 pl-4 text-sm italic"
              style={{
                ...synthesisBodyMuted,
                borderColor: "rgba(212, 175, 95, 0.35)",
              }}
            >
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-white/10" />,
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
      const forceParam = force && period === 'daily' ? '&force=1' : '';
      const res = await fetch(`/api/synthesis/periodic-report?period=${period}${forceParam}`);
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
    <div className="flex flex-col gap-6">
      <div
        className="flex w-fit flex-wrap items-center gap-1 rounded-[14px] border border-white/10 p-1"
        style={{ background: "rgba(13,18,32,0.45)" }}
      >
        {(Object.entries(PERIOD_CONFIG) as [Period, typeof PERIOD_CONFIG.daily][]).map(([period, config]) => (
          <button
            key={period}
            type="button"
            onClick={() => handlePeriodChange(period)}
            className={`flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-medium transition-colors ${
              activePeriod === period
                ? "border border-[rgba(200,135,58,0.35)] bg-[rgba(200,135,58,0.1)] text-[color:var(--cream,rgba(255,255,255,0.92))]"
                : "border border-transparent text-[color:var(--mist,rgba(255,255,255,0.5))] hover:bg-white/5 hover:text-[color:var(--cream,rgba(255,255,255,0.85))]"
            }`}
            style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
          >
            <span className="text-base">{config.icon}</span>
            {config.label}
          </button>
        ))}
      </div>

      {/* Description + schedule meta */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm" style={synthesisBodyMuted}>
            {PERIOD_CONFIG[activePeriod].description}
          </p>
          {currentReport?.nextGenerationDate && activePeriod !== 'daily' && (
            <p className="mt-1 text-xs" style={{ color: 'var(--faint, rgba(232,224,208,0.28))' }}>
              Next report ◈{' '}
              {new Date(`${currentReport.nextGenerationDate}T12:00:00Z`).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              })}
            </p>
          )}
        </div>
        {currentReport && (
          <div className="flex flex-wrap items-center gap-3">
            {currentReport.cached && (
              <span className="text-xs" style={{ color: 'var(--faint, rgba(232,224,208,0.22))' }}>Cached</span>
            )}
            <span className="text-xs" style={{ color: 'var(--faint, rgba(232,224,208,0.22))' }}>
              {activePeriod === 'daily'
                ? new Date(currentReport.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : new Date(currentReport.generatedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
              }
            </span>
            {activePeriod === 'daily' ? (
              <button
                type="button"
                onClick={() => fetchReport(activePeriod, true)}
                disabled={isLoading}
                className="text-xs text-[color:var(--amber,#c8873a)] transition-opacity hover:opacity-90 disabled:opacity-30"
                style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
              >
                ↺ Refresh
              </button>
            ) : (
              <span
                className="text-xs"
                style={{ color: 'var(--faint, rgba(232,224,208,0.22))' }}
                title={`${activePeriod === 'weekly' ? 'Weekly reports generate every Sunday' : 'Monthly reports generate on the last Friday of each month'}`}
              >
                {activePeriod === 'weekly' ? 'Refreshes Sundays' : 'Refreshes last Friday'}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={`${synthesisInnerPanel} min-h-64 p-6`}>
        {isLoading && <ReportSkeleton />}

        {!isLoading && error && (
          <div className="flex h-40 flex-col items-center justify-center gap-3">
            <p className="text-center text-sm text-red-300/90">{error}</p>
            <button type="button" style={synthesisPrimaryCta} onClick={() => fetchReport(activePeriod, true)}>
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && currentReport && (
          <MarkdownReport text={currentReport.text} />
        )}

        {!isLoading && !error && !currentReport && (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm" style={synthesisBodyMuted}>
              No report available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
