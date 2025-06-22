// @refresh reset
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider, ThemeProvider } from "./context/AppContext";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Analytics from "./pages/Analytics";
import MeetingDetail from "./pages/MeetingDetail";
import Meetings from "./pages/Meetings";
import ActionItems from "./pages/ActionItems";
import Team from "./pages/Team";
import Settings from "./pages/Settings";

const AppLayout: React.FC<{ children: React.ReactNode }> = React.memo(
  ({ children }) => {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    );
  }
);

const AppRoutes: React.FC = () => {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          state.isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginForm />
          )
        }
      />
      <Route
        path="/signup"
        element={
          state.isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignupForm />
          )
        }
      />

      {/* Private routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <PrivateRoute>
            <AppLayout>
              <Upload />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <AppLayout>
              <Analytics />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/meeting/:id"
        element={
          <PrivateRoute>
            <AppLayout>
              <MeetingDetail />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/meetings"
        element={
          <PrivateRoute>
            <AppLayout>
              <Meetings />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/action-items"
        element={
          <PrivateRoute>
            <AppLayout>
              <ActionItems />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Catch-all routes */}
      <Route
        path="/team"
        element={
          <PrivateRoute>
            <AppLayout>
              <Team />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={
          <Navigate
            to={state.isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
