import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import MainLayout from './components/layout/MainLayout'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// App pages
import DashboardHome from './pages/dashboard/DashboardHome'
import MyProfilePage from './pages/profile/MyProfilePage'
import AskQuestionPage from './pages/questions/AskQuestionPage'
import MyQuestionsPage from './pages/questions/MyQuestionsPage'
import AnswerQuestionsPage from './pages/questions/AnswerQuestionsPage'
import AnswerEditorPage from './pages/questions/AnswerEditorPage'
import ConnectionsPage from './pages/connections/ConnectionsPage'
import GroupsPage from './pages/groups/GroupsPage'
import GroupDetailPage from './pages/groups/GroupDetailPage'
import LeaderboardPage from './pages/leaderboard/LeaderboardPage'
import ProgressTrackerPage from './pages/progress/ProgressTrackerPage'
import SettingsPage from './pages/settings/SettingsPage'
import SearchResultsPage from './pages/search/SearchResultsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/register"       element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Private – wrapped in MainLayout */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/"              element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"     element={<DashboardHome />} />
              <Route path="/profile"       element={<MyProfilePage />} />
              <Route path="/ask"           element={<AskQuestionPage />} />
              <Route path="/my-questions"  element={<MyQuestionsPage />} />
              <Route path="/answer"        element={<AnswerQuestionsPage />} />
              <Route path="/answer/:id"    element={<AnswerEditorPage />} />
              <Route path="/connections"   element={<ConnectionsPage />} />
              <Route path="/groups"        element={<GroupsPage />} />
              <Route path="/groups/:id"    element={<GroupDetailPage />} />
              <Route path="/leaderboard"   element={<LeaderboardPage />} />
              <Route path="/progress"      element={<ProgressTrackerPage />} />
              <Route path="/settings"      element={<SettingsPage />} />
              <Route path="/search"        element={<SearchResultsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
