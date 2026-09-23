import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import NoteEditor from './components/NoteEditor';
import CreateSkillModal from './components/CreateSkillModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { INITIAL_SKILLS } from './data/initialData';
import { calculateSkillProgress } from './utils/helpers';

const STORAGE_KEY = 'nurodesk_skills_v1';

// ─── Protected Route wrapper ────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ─── Public-only Route (redirect logged-in users to /) ──────────────────────
function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
}

// ─── Main app content (authenticated) ───────────────────────────────────────
function AppContent() {
  const navigate = useNavigate();

  const [skills, setSkills] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored skills:', e);
    }
    return INITIAL_SKILLS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
    } catch (e) {
      console.error('Failed to persist skills:', e);
    }
  }, [skills]);

  const averageProgress = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + calculateSkillProgress(s), 0) / skills.length)
    : 0;

  const handleCreateSkill = (newSkill) => {
    const updated = [newSkill, ...skills];
    setSkills(updated);
    navigate(`/workspace/${newSkill.id}`);
  };

  const handleUpdateSkill = (skillId, updatedSkill) => {
    setSkills((prev) => prev.map((s) => (s.id === skillId ? { ...updatedSkill } : s)));
  };

  const handleDeleteSkill = (skillId) => {
    if (window.confirm('Are you sure you want to delete this skill workspace?')) {
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all workspaces to default demo data?')) {
      setSkills(INITIAL_SKILLS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SKILLS));
    }
  };

  return (
    <div className="h-screen text-[#f4f4f5] flex flex-col font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <Routes>
        {/* ── Home Route ─────────────────────────────────────────────────── */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="h-screen flex flex-col overflow-hidden relative">
                {/* Ambient gradient background */}
                <div className="absolute inset-0 bg-[#0e0e11] pointer-events-none">
                  <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[180px]" />
                  <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[150px]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-900/5 rounded-full blur-[120px]" />
                </div>

                {/* Content layer */}
                <div className="relative z-10 flex flex-col h-full">
                  <Navbar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onOpenCreateModal={() => setIsCreateModalOpen(true)}
                    skillsCount={skills.length}
                    averageProgress={averageProgress}
                  />
                  <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full overflow-hidden">
                    <Dashboard
                      skills={skills}
                      onDeleteSkill={handleDeleteSkill}
                      onUpdateSkill={handleUpdateSkill}
                      onOpenCreateModal={() => setIsCreateModalOpen(true)}
                      onResetDemoData={handleResetDemoData}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                    />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* ── Workspace (Note Editor) Route ──────────────────────────────── */}
        <Route
          path="/workspace/:skillId"
          element={
            <ProtectedRoute>
              <NoteEditor
                skills={skills}
                onUpdateSkill={handleUpdateSkill}
              />
            </ProtectedRoute>
          }
        />

        {/* ── Profile Route ──────────────────────────────────────────────── */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* ── Auth Routes (public only) ──────────────────────────────────── */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* ── Catch-all ─────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Create Skill Workspace Modal (only relevant on home) */}
      <CreateSkillModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSkill={handleCreateSkill}
      />
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
