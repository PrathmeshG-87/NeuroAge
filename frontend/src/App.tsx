import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { LandingPage } from '@/pages/LandingPage'
import { ModelInfoPage } from '@/pages/ModelInfoPage'
import {
  AssessmentDetailPage,
  AssessmentPage,
  MethodologyPage,
  NotFoundPage,
  ProgressPage,
  ReportsPage,
  SettingsPage,
} from '@/pages/RoutePlaceholders'
import { UploadPage } from '@/pages/UploadPage'
import { ViewerPage } from '@/pages/ViewerPage'

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/assessments/:id" element={<AssessmentDetailPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/viewer" element={<ViewerPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/model" element={<ModelInfoPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
