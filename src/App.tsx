/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { PracticeCenterPage } from './pages/PracticeCenterPage';
import { ExamSimulationPage } from './pages/ExamSimulationPage';
import { StudyGuidePage } from './pages/StudyGuidePage';
import { VocabularyPage } from './pages/VocabularyPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { StudyPlanPage } from './pages/StudyPlanPage';
import { HistoryPage } from './pages/HistoryPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { SettingsPage } from './pages/SettingsPage';
import { QuestionBankPage } from './pages/QuestionBankPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/practice" element={<PracticeCenterPage />} />
            <Route path="/simulation" element={<ExamSimulationPage defaultScope="full" />} />
            <Route
              path="/section-practice"
              element={<ExamSimulationPage defaultScope="section" />}
            />
            <Route path="/question-bank" element={<QuestionBankPage />} />
            <Route path="/study-guide" element={<StudyGuidePage />} />
            <Route path="/ai-tutor" element={<Navigate to="/study-guide" replace />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/study-plan" element={<StudyPlanPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
