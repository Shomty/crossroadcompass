"use client";

export type SynthesisTabId =
  | "dashboard"
  | "natal-analysis"
  | "reports"
  | "western"
  | "vedic"
  | "convergence"
  | "scorecard";

interface TabItem {
  id: SynthesisTabId;
  /** Shown inside button; include glyph + space + label */
  label: string;
}

interface SynthesisTabBarProps {
  tabs: TabItem[];
  activeTab: SynthesisTabId;
  onChange: (id: SynthesisTabId) => void;
}

export function SynthesisTabBar({ tabs, activeTab, onChange }: SynthesisTabBarProps) {
  return (
    <div className="synthesis-tab-rail">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          data-active={tab.id === activeTab}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
