// STATUS: done | Synthesis Engine Phase 4.6
/**
 * app/(app)/synthesis/page.tsx
 * Full-page synthesis dashboard with tabbed interface.
 * Tabs: Dashboard | Western Transits | Vedic Dasha | Convergence | Opportunities
 */

'use client';

import { useState, useEffect } from 'react';
import type { SynthesisResult, OpportunityScores, TransitTimeline, VedicDashaTimeline } from '@/types';
import { SynthesisDashboard } from '@/components/synthesis/SynthesisDashboard';
import { WesternTransitView } from '@/components/synthesis/WesternTransitView';
import { VedicDashaView } from '@/components/synthesis/VedicDashaView';
import { ConvergenceTimeline } from '@/components/synthesis/ConvergenceTimeline';
import { OpportunityScorecardView } from '@/components/synthesis/OpportunityScorecardView';
import { SynthesisPeriodicReport } from '@/components/synthesis/SynthesisPeriodicReport';
import { calculateOpportunityScores } from '@/lib/astro/opportunityScoreService';

type TabType = 'dashboard' | 'western' | 'vedic' | 'convergence' | 'scorecard' | 'reports';

export default function SynthesisPage() {
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [transitTimeline, setTransitTimeline] = useState<TransitTimeline | null>(null);
  const [dashaTimeline, setDashaTimeline] = useState<VedicDashaTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch synthesis data
        const synthRes = await fetch('/api/chart/synthesis');
        if (!synthRes.ok) throw new Error('Failed to load synthesis');
        const synthData = (await synthRes.json()) as SynthesisResult;
        setSynthesis(synthData);

        // Fetch western transits
        const today = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const transitRes = await fetch(`/api/chart/western-transits?start=${today}&end=${endDate}`);
        if (transitRes.ok) {
          const transitData = (await transitRes.json()) as TransitTimeline;
          setTransitTimeline(transitData);
        }

        // Fetch dasha timeline
        const dashaRes = await fetch('/api/chart/dasha-timeline');
        if (dashaRes.ok) {
          const dashaData = (await dashaRes.json()) as VedicDashaTimeline;
          setDashaTimeline(dashaData);
        }
      } catch (err) {
        console.error('[SynthesisPage] Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border border-gold border-t-transparent mx-auto mb-4" />
          <p className="text-star/60">Loading Synthesis Engine...</p>
        </div>
      </div>
    );
  }

  if (error || !synthesis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">{error || 'Failed to load synthesis'}</p>
          <button
            onClick={() => setRefresh((r) => r + 1)}
            className="text-amber hover:text-gold transition-colors text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const opportunityScores = calculateOpportunityScores(synthesis);

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: '◆' },
    { id: 'reports',   label: 'Reports',   icon: '✦' },
    { id: 'western', label: 'Western Transits', icon: '◇' },
    { id: 'vedic', label: 'Vedic Dasha', icon: '◈' },
    { id: 'convergence', label: 'Convergence', icon: '◇' },
    { id: 'scorecard', label: 'Opportunities', icon: '◆' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cosmos via-cosmos/95 to-cosmos">
      {/* Header */}
      <div className="border-b border-amber/10 sticky top-0 z-10 bg-cosmos/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-serif text-gold mb-2">Synthesis Engine</h1>
          <p className="text-star/60 text-sm">
            Unified view of Western and Vedic astrology convergence
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-amber/10 overflow-x-auto">
          <div className="max-w-6xl mx-auto px-6 flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-gold border-gold'
                    : 'text-star/60 border-transparent hover:text-star hover:border-amber/20'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="animate-fadeIn">
            <SynthesisDashboard
              synthesis={synthesis}
              opportunityScores={opportunityScores}
              onRecalcComplete={() => setRefresh((r) => r + 1)}
            />
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-xl font-serif text-gold mb-1">Synthesis Reports</h2>
              <p className="text-star/50 text-sm">
                AI-generated insights bridging your Western and Vedic charts across different time horizons.
              </p>
            </div>
            <SynthesisPeriodicReport />
          </div>
        )}

        {/* Western Transits Tab */}
        {activeTab === 'western' && transitTimeline && (
          <div className="animate-fadeIn">
            <WesternTransitView transitTimeline={transitTimeline} />
          </div>
        )}

        {/* Vedic Dasha Tab */}
        {activeTab === 'vedic' && dashaTimeline && (
          <div className="animate-fadeIn">
            <VedicDashaView
              dashaTimeline={dashaTimeline}
              currentMahaDasha={synthesis.currentMahaDasha}
              currentAntarDasha={synthesis.currentAntarDasha}
            />
          </div>
        )}

        {/* Convergence Timeline Tab */}
        {activeTab === 'convergence' && (
          <div className="animate-fadeIn">
            <ConvergenceTimeline events={synthesis.convergenceWindow} />
          </div>
        )}

        {/* Opportunity Scorecard Tab */}
        {activeTab === 'scorecard' && (
          <div className="animate-fadeIn">
            <OpportunityScorecardView scores={opportunityScores} />
          </div>
        )}
      </div>

      {/* Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 300ms ease-out;
        }
      `}</style>
    </div>
  );
}
