import React, { useState } from 'react';
import { Check, Download, Moon, Sun, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AVATAR_COLORS = ['#0B1733', '#1D4ED8', '#0284C7', '#0F766E', '#4338CA', '#334155'];

export const SettingsPage: React.FC = () => {
  const { state, updateProfile, resetAllProgress } = useApp();
  const p = state.profile;

  const [displayName, setDisplayName] = useState(p.displayName);
  const [targetBand, setTargetBand] = useState(p.targetBand);
  const [targetTestDate, setTargetTestDate] = useState(p.targetTestDate);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(p.dailyGoalMinutes);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName: displayName.trim() || 'TOEFL Candidate',
      targetBand,
      targetTestDate,
      dailyGoalMinutes,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIPP_TOEFL_TEAM_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="text-xs font-medium text-blue-700 dark:text-cyan-400">
          Candidate Profile, Preferences &amp; Data Governance
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
          Settings
        </h1>
      </div>

      {/* Candidate Profile & Certificate Identity */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5"
      >
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-display font-bold text-white shrink-0"
            style={{ backgroundColor: p.avatarColor }}
          >
            {p.avatarInitials}
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Candidate Profile
            </h2>
            <p className="text-xs text-slate-500">
              Your display name appears directly on Simulation Certificates and downloadable PDF Score Reports.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Avatar Accent Color
            </label>
            <div className="flex items-center gap-2 pt-1">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateProfile({ avatarColor: c })}
                  aria-label={`Select color ${c}`}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    p.avatarColor === c ? 'ring-2 ring-offset-2 ring-[#1D4ED8] scale-105' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target TOEFL Band (1.0–6.0)
            </label>
            <select
              value={targetBand}
              onChange={(e) => setTargetBand(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono"
            >
              {[3.5, 4.0, 4.5, 5.0, 5.5, 6.0].map((b) => (
                <option key={b} value={b}>
                  Band {b.toFixed(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Exam Date
            </label>
            <input
              type="date"
              value={targetTestDate}
              onChange={(e) => setTargetTestDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Daily Study Goal (minutes)
            </label>
            <input
              type="number"
              min={15}
              max={180}
              step={5}
              value={dailyGoalMinutes}
              onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Interface Language
            </label>
            <select
              value={p.interfaceLanguage}
              onChange={(e) => updateProfile({ interfaceLanguage: e.target.value })}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            >
              <option value="English (Academic Default)">English (Academic Default)</option>
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold transition-colors"
          >
            {saved ? <Check className="w-4 h-4" /> : null}
            {saved ? 'Profile Saved' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Appearance, Sound & Accessibility */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
          Appearance, Audio &amp; Accessibility
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Color Theme</div>
              <div className="text-xs text-slate-500">
                Switch between high-legibility academic Light mode and Deep Navy Dark mode.
              </div>
            </div>
            <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => updateProfile({ theme: 'light' })}
                className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-md text-xs font-semibold ${
                  p.theme === 'light'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 dark:text-slate-300'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                type="button"
                onClick={() => updateProfile({ theme: 'dark' })}
                className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-md text-xs font-semibold ${
                  p.theme === 'dark'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-300'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
            </div>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Reduced Motion</div>
              <div className="text-xs text-slate-500">
                Minimize page and progress bar animations for visual comfort.
              </div>
            </div>
            <input
              type="checkbox"
              checked={p.reducedMotion}
              onChange={(e) => updateProfile({ reducedMotion: e.target.checked })}
              aria-label="Toggle reduced motion"
              className="w-5 h-5 accent-[#1D4ED8] shrink-0"
            />
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Completion Sound Cues</div>
              <div className="text-xs text-slate-500">
                Play subtle audio tones during speaker tests and exam completion.
              </div>
            </div>
            <input
              type="checkbox"
              checked={p.soundEnabled}
              onChange={(e) => updateProfile({ soundEnabled: e.target.checked })}
              aria-label="Toggle sound effects"
              className="w-5 h-5 accent-[#1D4ED8] shrink-0"
            />
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Default to Strict Exam Mode</div>
              <div className="text-xs text-slate-500">
                Launch Full Test Simulations in strict timed mode by default.
              </div>
            </div>
            <input
              type="checkbox"
              checked={p.strictModeDefault}
              onChange={(e) => updateProfile({ strictModeDefault: e.target.checked })}
              aria-label="Toggle strict mode default"
              className="w-5 h-5 accent-[#1D4ED8] shrink-0"
            />
          </div>

          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Practice Listening Speech Rate
              </div>
              <div className="text-xs text-slate-500">
                Default playback speed in Guided Practice Mode (Strict Mode always uses 1.0x).
              </div>
            </div>
            <select
              value={p.preferredSpeechRate}
              onChange={(e) => updateProfile({ preferredSpeechRate: Number(e.target.value) })}
              className="min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-mono self-start sm:self-auto"
            >
              <option value={0.85}>0.85x (Slower)</option>
              <option value={1.0}>1.0x (Standard)</option>
              <option value={1.15}>1.15x (Faster)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
          Data Persistence &amp; Backup
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your profile, test attempts, SM-2 vocabulary deck, and study plan are stored locally in
          your browser — 100% built-in with no subscriptions or external accounts required.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Download className="w-3.5 h-3.5" />
            Export Study Data (JSON)
          </button>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset All Progress
            </button>
          ) : (
            <div className="inline-flex items-center gap-2">
              <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold">
                Confirm permanent reset?
              </span>
              <button
                type="button"
                onClick={() => {
                  resetAllProgress();
                  setConfirmReset(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold"
              >
                Yes, Reset Everything
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
