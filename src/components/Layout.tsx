import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  Clock,
  Database,
  Flame,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Moon,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { AnimatedProgressBar, PageTransition } from './ui/MotionPrimitives';

const NAV_GROUPS = [
  {
    heading: 'Practice & Learn',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/practice', label: 'Practice Center', icon: Layers },
      { to: '/simulation', label: 'Full Test Simulation', icon: ClipboardCheck },
      { to: '/section-practice', label: 'Section Practice', icon: GraduationCap },
      { to: '/question-bank', label: 'Question Bank & Packs', icon: Database },
      { to: '/vocabulary', label: 'Vocabulary Builder', icon: BookOpen },
      { to: '/study-guide', label: 'Study Guide', icon: Lightbulb },
    ],
  },
  {
    heading: 'Track Progress',
    items: [
      { to: '/analytics', label: 'Analytics & Mistakes', icon: BarChart3 },
      { to: '/study-plan', label: 'Study Plan', icon: CalendarClock },
      { to: '/history', label: 'Score History', icon: Clock },
      { to: '/achievements', label: 'Achievements', icon: Award },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const MOBILE_BOTTOM_TABS = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/practice', label: 'Practice', icon: Layers },
  { to: '/simulation', label: 'Mock Test', icon: ClipboardCheck },
  { to: '/vocabulary', label: 'Vocab', icon: BookOpen },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, levelInfo, toggleTheme, achievementToast, dismissToast } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentNav =
    ALL_NAV_ITEMS.find((item) =>
      item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
    ) || ALL_NAV_ITEMS[0];

  const isExamRoute =
    location.pathname.startsWith('/simulation') ||
    location.pathname.startsWith('/section-practice');

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#060D1F] text-slate-900 dark:text-slate-100">
      {/* Desktop Persistent Institutional Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[264px] lg:fixed lg:inset-y-0 bg-[#0B1733] text-slate-200 border-r border-slate-800/80 z-30">
        <div className="px-5 py-5 border-b border-white/[0.08]">
          <Link
            to="/"
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
          >
            <BrandLogo darkSurface />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Main navigation">
          {NAV_GROUPS.map((group) => (
            <div key={group.heading} className="space-y-1">
              <div className="px-3.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400/90">
                {group.heading}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-[#1D4ED8] text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-[17px] h-[17px] shrink-0 transition-colors ${
                            isActive ? 'text-cyan-200' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                          strokeWidth={1.9}
                        />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Candidate Summary Footer in Sidebar */}
        <div className="p-4 border-t border-white/[0.08] bg-[#081126]">
          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-lg p-1 -m-1 hover:bg-white/[0.04] transition-colors"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ring-1 ring-white/15"
              style={{ backgroundColor: state.profile.avatarColor }}
            >
              {state.profile.avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">
                {state.profile.displayName}
              </div>
              <div className="text-[11.5px] text-slate-400 tabular-nums truncate">
                Level {levelInfo.level} · {state.xp.toLocaleString()} XP
              </div>
            </div>
          </Link>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
            <span className="inline-flex items-center gap-1 text-cyan-300 font-medium">
              <Flame className="w-3.5 h-3.5" />
              {state.streakDays}-day streak
            </span>
            <span>Target {state.profile.targetBand.toFixed(1)}</span>
          </div>
          <div className="mt-1.5">
            <AnimatedProgressBar
              percent={levelInfo.pct}
              heightClass="h-1.5"
              trackClass="bg-white/10"
              fillClass="bg-cyan-400"
            />
          </div>
        </div>
      </aside>

      {/* Mobile Full Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 w-[284px] max-w-[85vw] bg-[#0B1733] text-slate-200 z-50 flex flex-col lg:hidden shadow-2xl"
              aria-label="Mobile navigation drawer"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <BrandLogo darkSurface />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {NAV_GROUPS.map((group) => (
                  <div key={group.heading} className="space-y-1">
                    <div className="px-3.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                      {group.heading}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === '/'}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-[#1D4ED8] text-white'
                                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                            }`
                          }
                        >
                          <Icon className="w-[18px] h-[18px] shrink-0" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="p-4 border-t border-white/10 bg-[#081126] pb-safe">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: state.profile.avatarColor }}
                  >
                    {state.profile.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate">
                      {state.profile.displayName}
                    </div>
                    <div className="text-xs text-slate-400 tabular-nums">
                      Lvl {levelInfo.level} · {state.streakDays}d streak · Target{' '}
                      {state.profile.targetBand.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[264px] min-w-0">
        {/* Compact Sticky Workspace Top Bar (keeps mobile sticky height lean) */}
        <header className="sticky top-0 z-20 h-14 lg:h-16 bg-white/95 dark:bg-[#0B1733]/95 backdrop-blur-sm border-b border-slate-200/90 dark:border-slate-800/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden min-h-[40px] min-w-[40px] -ml-1.5 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden shrink-0">
              <Link to="/" aria-label="AIPP TOEFL TEAM Home">
                <BrandLogo compact />
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden lg:inline text-slate-400 dark:text-slate-500 whitespace-nowrap font-medium">
                AIPP TOEFL TEAM
              </span>
              <span className="hidden lg:inline text-slate-300 dark:text-slate-600">/</span>
              <span className="font-display font-semibold text-slate-900 dark:text-white truncate text-[15px] lg:text-sm">
                {currentNav.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleTheme}
              aria-label={
                state.profile.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700/90 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {state.profile.theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => navigate('/simulation')}
              className="hidden sm:inline-flex items-center justify-center min-h-[40px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Start Full Test
            </button>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-[1280px] w-full mx-auto">
          <PageTransition routeKey={location.pathname} disabled={isExamRoute}>
            {children}
          </PageTransition>
        </main>

        {/* Quiet Institutional Disclaimer Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-5 border-t border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 max-w-[1280px] w-full mx-auto">
          <span>
            AIPP TOEFL TEAM · TOEFL iBT Simulation &amp; Learning Platform · “Practice Smarter. Perform Better. Reach Your Target.”
          </span>
          <span>
            Independent educational simulator (2026 format) — Not affiliated with or endorsed by ETS.
          </span>
        </footer>
      </div>

      {/* Ergonomic Thumb-Zone Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile quick navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/96 dark:bg-[#0B1733]/96 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe"
      >
        <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
          {MOBILE_BOTTOM_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                    isActive
                      ? 'text-[#1D4ED8] dark:text-cyan-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className="w-[19px] h-[19px]"
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    <span className="leading-none">{tab.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="More pages"
            className="flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Menu className="w-[19px] h-[19px]" strokeWidth={1.8} />
            <span className="leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* Refined Achievement Unlock Notification */}
      <AnimatePresence>
        {achievementToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 sm:max-w-sm bg-[#0B1733] text-white border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-3.5 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-400/25 text-cyan-300 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                  Achievement Unlocked
                </div>
                <div className="text-sm font-semibold truncate">{achievementToast.title}</div>
                <div className="text-xs text-slate-300 tabular-nums">
                  +{achievementToast.xp} XP earned
                </div>
              </div>
              <button
                onClick={dismissToast}
                aria-label="Dismiss notification"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <motion.div
              className="h-0.5 bg-cyan-400 origin-left"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 4.5, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
