import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Settings, 
  Compass, 
  Sparkles, 
  Calendar, 
  ArrowRight,
  RefreshCw,
  Star,
  Info,
  Menu,
  X,
  Moon,
  Sun as SunIcon,
  Sunrise,
  Sunset
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 md:py-3 rounded-xl transition-all duration-300 active:scale-[0.98] ${
      active 
        ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30' 
        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
    }`}
  >
    <Icon size={20} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`glass glass-hover p-4 sm:p-5 md:p-6 ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-4 md:mb-6">
    <h2 className="text-xl md:text-2xl font-serif font-medium tracking-tight text-white/90">{title}</h2>
    {subtitle && <p className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest mt-1 font-mono">{subtitle}</p>}
  </div>
);

const PlanetaryPosition = ({ planet, sign, house, degree, nakshatra }: any) => (
  <div className="flex flex-col sm:grid sm:grid-cols-5 py-4 sm:py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 rounded-lg group">
    <div className="flex items-center justify-between sm:justify-start gap-2 mb-2 sm:mb-0">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent-gold/40 group-hover:bg-accent-gold transition-colors shrink-0" />
        <span className="text-sm font-medium text-white/80">{planet}</span>
      </div>
      <span className="sm:hidden text-[10px] font-mono text-white/30">{degree}</span>
    </div>
    <div className="grid grid-cols-2 sm:contents gap-4">
      <div className="flex flex-col sm:block">
        <span className="sm:hidden text-[10px] uppercase tracking-wider text-white/20 mb-1">Sign</span>
        <span className="text-sm text-white/60">{sign}</span>
      </div>
      <div className="flex flex-col sm:block">
        <span className="sm:hidden text-[10px] uppercase tracking-wider text-white/20 mb-1">House</span>
        <span className="text-sm text-white/60">{house}</span>
      </div>
      <div className="hidden sm:block">
        <span className="text-sm font-mono text-white/40">{degree}</span>
      </div>
      <div className="flex flex-col sm:block col-span-2 sm:col-span-1">
        <span className="sm:hidden text-[10px] uppercase tracking-wider text-white/20 mb-1">Nakshatra</span>
        <span className="text-sm text-white/60 italic font-serif truncate">{nakshatra}</span>
      </div>
    </div>
  </div>
);

const SidebarContent = ({ activeTab, setActiveTab, onClose }: { activeTab: string, setActiveTab: (tab: string) => void, onClose?: () => void }) => (
  <>
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-indigo to-accent-gold flex items-center justify-center shadow-lg shadow-accent-indigo/20 shrink-0">
          <Compass className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-serif font-bold tracking-tighter">CROSSROADS</h1>
      </div>
      {onClose && (
        <button onClick={onClose} className="lg:hidden p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5">
          <X size={20} />
        </button>
      )}
    </div>

    <nav className="flex flex-col gap-2 flex-1 mt-8 md:mt-0">
      <SidebarItem 
        icon={LayoutDashboard} 
        label="Dashboard" 
        active={activeTab === 'dashboard'} 
        onClick={() => { setActiveTab('dashboard'); onClose?.(); }}
      />
      <SidebarItem 
        icon={FileText} 
        label="Reports" 
        active={activeTab === 'reports'} 
        onClick={() => { setActiveTab('reports'); onClose?.(); }}
      />
      <SidebarItem 
        icon={User} 
        label="Profile" 
        active={activeTab === 'profile'} 
        onClick={() => { setActiveTab('profile'); onClose?.(); }}
      />
      <SidebarItem 
        icon={Settings} 
        label="Settings" 
        active={activeTab === 'settings'} 
        onClick={() => { setActiveTab('settings'); onClose?.(); }}
      />
    </nav>

    <div className="glass p-4 rounded-xl flex items-center gap-3 mt-auto">
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">S</div>
      <div className="flex flex-col overflow-hidden">
        <span className="text-xs font-medium truncate">shomty</span>
        <span className="text-[10px] text-white/40 uppercase tracking-wider">Free Plan</span>
      </div>
    </div>
  </>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [timeContext, setTimeContext] = useState({
    greeting: 'Good evening',
    icon: Sunset,
    phase: 'night'
  });

  useEffect(() => {
    const updateBackground = () => {
      const hour = new Date().getHours();
      let phase = 'night';
      let greeting = 'Good evening';
      let Icon = Moon;
      
      const root = document.documentElement;

      if (hour >= 5 && hour < 12) {
        phase = 'morning';
        greeting = 'Good morning';
        Icon = Sunrise;
        root.style.setProperty('--bg-color', '#0F172A');
        root.style.setProperty('--grad-1-color', 'rgba(129, 140, 248, 0.25)');
        root.style.setProperty('--grad-2-color', 'rgba(251, 191, 36, 0.15)');
        root.style.setProperty('--accent-indigo', '#818CF8');
        root.style.setProperty('--accent-gold', '#FBBF24');
      } else if (hour >= 12 && hour < 17) {
        phase = 'afternoon';
        greeting = 'Good afternoon';
        Icon = SunIcon;
        root.style.setProperty('--bg-color', '#0D0D12');
        root.style.setProperty('--grad-1-color', 'rgba(59, 130, 246, 0.2)');
        root.style.setProperty('--grad-2-color', 'rgba(245, 158, 11, 0.15)');
        root.style.setProperty('--accent-indigo', '#60A5FA');
        root.style.setProperty('--accent-gold', '#F59E0B');
      } else if (hour >= 17 && hour < 21) {
        phase = 'evening';
        greeting = 'Good evening';
        Icon = Sunset;
        root.style.setProperty('--bg-color', '#110C1D');
        root.style.setProperty('--grad-1-color', 'rgba(139, 92, 246, 0.25)');
        root.style.setProperty('--grad-2-color', 'rgba(236, 72, 153, 0.15)');
        root.style.setProperty('--accent-indigo', '#A78BFA');
        root.style.setProperty('--accent-gold', '#F472B6');
      } else {
        phase = 'night';
        greeting = 'Good night';
        Icon = Moon;
        root.style.setProperty('--bg-color', '#08080C');
        root.style.setProperty('--grad-1-color', 'rgba(99, 102, 241, 0.15)');
        root.style.setProperty('--grad-2-color', 'rgba(139, 92, 246, 0.1)');
        root.style.setProperty('--accent-indigo', '#818CF8');
        root.style.setProperty('--accent-gold', '#D4AF37');
      }

      setTimeContext({ greeting, icon: Icon, phase });
    };

    updateBackground();
    const interval = setInterval(updateBackground, 60000); // Update every minute

    // Subtle astrological shifts
    const shiftInterval = setInterval(() => {
      const root = document.documentElement;
      const x1 = Math.random() * 20 - 10; // -10% to 10%
      const y1 = Math.random() * 20 - 10;
      const x2 = 100 + (Math.random() * 20 - 10);
      const y2 = Math.random() * 20 - 10;

      root.style.setProperty('--grad-1-x', `${x1}%`);
      root.style.setProperty('--grad-1-y', `${y1}%`);
      root.style.setProperty('--grad-2-x', `${x2}%`);
      root.style.setProperty('--grad-2-y', `${y2}%`);
    }, 10000); // Shift every 10 seconds

    return () => {
      clearInterval(interval);
      clearInterval(shiftInterval);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-mystic-bg relative">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-mystic-bg/95 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-indigo to-accent-gold flex items-center justify-center shrink-0">
            <Compass className="text-white" size={18} />
          </div>
          <h1 className="text-lg font-serif font-bold tracking-tighter">CROSSROADS</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-white/70 hover:text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-[100dvh] w-72 bg-mystic-bg border-r border-white/5 p-6 flex flex-col gap-8 z-50 lg:hidden overflow-y-auto"
            >
              <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} onClose={() => setIsMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-white/5 p-6 flex-col gap-8 sticky top-0 h-screen overflow-y-auto shrink-0">
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-12 pt-24 lg:pt-8 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 lg:mb-12">
          <div className="w-full sm:w-auto">
            <p className="text-[10px] md:text-xs text-white/40 uppercase tracking-[0.2em] font-mono mb-2">Personal Navigation</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-tight leading-tight flex items-center gap-3">
              {timeContext.greeting}, <span className="italic text-accent-gold">shomty</span>
              <timeContext.icon className="text-accent-gold/40" size={32} />
            </h1>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none justify-center glass px-4 py-3.5 sm:py-2 text-xs font-medium flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95">
              <Settings size={14} />
              <span>Config</span>
            </button>
            <button className="flex-1 sm:flex-none justify-center bg-white text-black px-6 py-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/90 transition-all shadow-xl shadow-white/5 active:scale-95">
              <FileText size={14} />
              <span>FULL CHART</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Today's Guidance - Hero Section */}
          <Card className="md:col-span-12 lg:col-span-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <Sparkles size={120} className="text-accent-gold" />
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
              <SectionHeader title="Cosmic Guidance" subtitle="Tuesday, March 10" />
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-accent-indigo/10 text-accent-indigo text-[10px] font-bold uppercase tracking-wider border border-accent-indigo/20">Responsive Wisdom</span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-[10px] font-bold uppercase tracking-wider border border-white/10">Measured Expression</span>
              </div>
            </div>
            <blockquote className="text-xl md:text-2xl font-serif leading-relaxed text-white/80 mb-8 italic relative z-10">
              "As a Sacral Generator, your power lies in responding to what life brings you, so listen closely to your gut feelings today. Embrace your 6/2 profile by taking a step back to objectively observe situations, allowing your natural wisdom to surface without feeling the need to initiate."
            </blockquote>
            <div className="flex items-start sm:items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 relative z-10">
              <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold shrink-0">
                <Star size={20} />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1">Today's Focus</p>
                <p className="text-sm font-medium text-white/80 leading-snug">Pause and check for a clear 'yes' or 'no' from your sacral before committing.</p>
              </div>
            </div>
          </Card>

          {/* Current Period - Dasha */}
          <Card className="md:col-span-6 lg:col-span-4 flex flex-col">
            <SectionHeader title="Current Period" subtitle="Vimshottari Dasha" />
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <div className="relative w-28 h-28 md:w-32 md:h-32 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="46%"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="46%"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="289%"
                    strokeDashoffset="72%"
                    className="text-accent-gold"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl md:text-3xl font-serif font-bold">Saturn</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-tighter">Mahadasha</span>
                </div>
              </div>
              <div className="text-center mb-6 w-full">
                <p className="text-xs text-white/60 italic font-serif px-2">Karma · Discipline · Endurance</p>
                <div className="flex justify-between gap-4 mt-4 px-4">
                  <div className="text-center">
                    <p className="text-[10px] text-white/40 uppercase font-mono">Started</p>
                    <p className="text-sm font-medium">Jun 2021</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-white/40 uppercase font-mono">Ends</p>
                    <p className="text-sm font-medium">Jun 2040</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full py-3 rounded-xl bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/5 mt-auto">
              Tap for Insight
            </button>
          </Card>

          {/* Human Design Overview */}
          <Card className="md:col-span-6 lg:col-span-4">
            <SectionHeader title="Human Design" subtitle="Type & Profile" />
            <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-accent-indigo/30 flex items-center justify-center relative shrink-0">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-accent-indigo/20 flex items-center justify-center">
                  <User className="text-accent-indigo" size={20} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-mystic-bg border border-white/10 flex items-center justify-center text-[10px] font-bold">
                  6/2
                </div>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-serif font-medium">Generator</h3>
                <p className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest">Open & Enveloping</p>
              </div>
            </div>
            <div className="space-y-3 md:space-y-4">
              <div className="p-3 md:p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1">Strategy</p>
                <p className="text-sm font-medium">Wait to respond</p>
              </div>
              <div className="p-3 md:p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1">Signature</p>
                <p className="text-sm font-medium italic font-serif text-accent-gold">Satisfaction</p>
              </div>
            </div>
          </Card>

          {/* Transits & Planetary Positions */}
          <Card className="md:col-span-12 lg:col-span-8">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <SectionHeader title="Planetary Transits" subtitle="Current Sky" />
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40">
                <RefreshCw size={16} />
              </button>
            </div>
            
            <div className="mb-6 md:mb-8 overflow-hidden">
              <div className="space-y-1">
                <div className="hidden sm:grid grid-cols-5 px-2 mb-2">
                  <span className="mono-data">Planet</span>
                  <span className="mono-data">Sign</span>
                  <span className="mono-data">House</span>
                  <span className="mono-data">Degree</span>
                  <span className="mono-data">Nakshatra</span>
                </div>
                <PlanetaryPosition planet="Sun" sign="Aquarius" house="6" degree="25:55:44" nakshatra="Purva Bhadrapada" />
                <PlanetaryPosition planet="Moon" sign="Scorpio" house="3" degree="18:40:30" nakshatra="Jyeshtha" />
                <PlanetaryPosition planet="Mercury" sign="Aquarius" house="6" degree="19:23:24" nakshatra="Shatabhisha" />
                <PlanetaryPosition planet="Venus" sign="Pisces" house="7" degree="11:06:20" nakshatra="Uttara Bhadrapada" />
                <PlanetaryPosition planet="Mars" sign="Aquarius" house="6" degree="12:11:20" nakshatra="Shatabhisha" />
              </div>
            </div>

            <div className="p-4 bg-accent-indigo/5 rounded-xl border border-accent-indigo/10 flex items-start gap-4">
              <Info size={18} className="text-accent-indigo mt-1 shrink-0" />
              <p className="text-sm text-white/70 leading-relaxed">
                <span className="font-bold text-white">Transits Insight:</span> With your Natal Moon in Aquarius, today's heavy planetary concentration in your first house creates a surge of personal intensity and drive.
              </p>
            </div>
          </Card>

          {/* Forecast Section */}
          <Card className="md:col-span-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <SectionHeader title="Life Forecast" subtitle="Weekly Integration" />
              <div className="flex glass p-1 rounded-xl w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 rounded-lg text-xs font-bold bg-white text-black transition-all">WEEKLY</button>
                <button className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 rounded-lg text-xs font-bold text-white/40 hover:text-white/70 transition-all">MONTHLY</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-lg font-serif italic text-accent-gold">Energy & Body</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Your robust Generator energy is ready for action this week, Milos. Paying attention to your Sacral sounds is particularly helpful for directing it.
                </p>
              </div>
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-lg font-serif italic text-accent-gold">Relationships</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Your 6/2 profile suggests a week where you might find yourself observing dynamics from a slightly detached perspective, while still drawing others in.
                </p>
              </div>
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-lg font-serif italic text-accent-gold">Work & Purpose</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  In your work, remember that your Sacral authority is your most reliable guide; waiting for a clear 'yes' or 'no' response tends to lead to more satisfying outcomes.
                </p>
              </div>
            </div>

            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-white/40 shrink-0" />
                <span className="text-[10px] md:text-xs text-white/40 font-mono uppercase tracking-widest">Next Major Transition: April 14, 2026</span>
              </div>
              <button className="flex items-center gap-2 text-xs font-bold text-accent-indigo hover:gap-3 transition-all w-full sm:w-auto justify-between sm:justify-start">
                <span>VIEW DETAILED REPORT</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
