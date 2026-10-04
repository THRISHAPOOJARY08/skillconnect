import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import MainLayout from './components/layout/MainLayout'

// Auth pages — loaded eagerly (small, needed immediately)
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// App pages — lazy loaded (only downloaded when navigated to)
const DashboardHome       = lazy(() => import('./pages/dashboard/DashboardHome'))
const MyProfilePage       = lazy(() => import('./pages/profile/MyProfilePage'))
const AskQuestionPage     = lazy(() => import('./pages/questions/AskQuestionPage'))
const MyQuestionsPage     = lazy(() => import('./pages/questions/MyQuestionsPage'))
const AnswerQuestionsPage = lazy(() => import('./pages/questions/AnswerQuestionsPage'))
const AnswerEditorPage    = lazy(() => import('./pages/questions/AnswerEditorPage'))
const ConnectionsPage     = lazy(() => import('./pages/connections/ConnectionsPage'))
const GroupsPage          = lazy(() => import('./pages/groups/GroupsPage'))
const GroupDetailPage     = lazy(() => import('./pages/groups/GroupDetailPage'))
const LeaderboardPage     = lazy(() => import('./pages/leaderboard/LeaderboardPage'))
const ProgressTrackerPage = lazy(() => import('./pages/progress/ProgressTrackerPage'))
const SettingsPage        = lazy(() => import('./pages/settings/SettingsPage'))
const SearchResultsPage   = lazy(() => import('./pages/search/SearchResultsPage'))
const ForgotPasswordPage  = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage   = lazy(() => import('./pages/auth/ResetPasswordPage'))

// Tiny spinner shown while a lazy page loads
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner-border text-primary" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />

            {/* Private – wrapped in MainLayout */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/"             element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"    element={<DashboardHome />} />
                <Route path="/profile"      element={<MyProfilePage />} />
                <Route path="/ask"          element={<AskQuestionPage />} />
                <Route path="/my-questions" element={<MyQuestionsPage />} />
                <Route path="/answer"       element={<AnswerQuestionsPage />} />
                <Route path="/answer/:id"   element={<AnswerEditorPage />} />
                <Route path="/connections"  element={<ConnectionsPage />} />
                <Route path="/groups"       element={<GroupsPage />} />
                <Route path="/groups/:id"   element={<GroupDetailPage />} />
                <Route path="/leaderboard"  element={<LeaderboardPage />} />
                <Route path="/progress"     element={<ProgressTrackerPage />} />
                <Route path="/settings"     element={<SettingsPage />} />
                <Route path="/search"       element={<SearchResultsPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
