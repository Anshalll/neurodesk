import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import NoteEditor from './components/NoteEditor';
import CreateSkillModal from './components/CreateSkillModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UserProfilePage from './pages/UserProfilePage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { calculateSkillProgress } from './utils/helpers';

// ─── Protected Route wrapper ────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, initialChecking } = useAuth();
  if (initialChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0e0e11]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ─── Public-only Route (redirect logged-in users to /) ──────────────────────
function PublicRoute({ children }) {
  const { user, initialChecking } = useAuth();
  if (initialChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0e0e11]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return children;
}

// ─── Main app content (authenticated) ───────────────────────────────────────
function AppContent() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [skills, setSkills] = useState([]);
  const [skillsLoaded, setSkillsLoaded] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const debounceTimers = useRef({});

  // Sync skills and notes from MySQL on authentication
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    async function fetchSkillsFromBackend() {
      try {
        const res = await fetch('/api/skills', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.skills)) {
            setSkills(data.skills);
          }
        } else {
          console.warn(`Could not fetch skills (status ${res.status}).`);
        }
      } catch (err) {
        console.error('Could not fetch skills from MySQL backend:', err);
      } finally {
        if (isMounted) setSkillsLoaded(true);
      }
    }

    fetchSkillsFromBackend();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const averageProgress = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + calculateSkillProgress(s), 0) / skills.length)
    : 0;

  const handleCreateSkill = async (newSkill) => {
    // 1. Optimistic update
    const updated = [newSkill, ...skills];
    setSkills(updated);
    navigate(`/workspace/${newSkill.id}`);

    // 2. Persist to MySQL
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newSkill),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.skill) {
          setSkills((prev) => prev.map((s) => (s.id === newSkill.id ? data.skill : s)));
        }
      }
    } catch (err) {
      console.error('Failed to save skill to MySQL:', err);
    }
  };

  const handleUpdateSkill = (skillId, updatedSkill) => {
    // 1. Optimistic update immediately for fluid, responsive typing in NoteEditor
    setSkills((prev) => prev.map((s) => (s.id === skillId ? { ...updatedSkill } : s)));

    // 2. Debounced save to MySQL
    if (debounceTimers.current[skillId]) {
      clearTimeout(debounceTimers.current[skillId]);
    }

    debounceTimers.current[skillId] = setTimeout(async () => {
      try {
        await fetch(`/api/skills/${encodeURIComponent(skillId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updatedSkill),
        });
      } catch (err) {
        console.error('Failed to sync note/skill update to MySQL:', err);
      }
    }, 400);
  };

  const handleDeleteSkill = async (skillId) => {
    if (window.confirm('Are you sure you want to delete this skill workspace?')) {
      setSkills((prev) => prev.filter((s) => s.id !== skillId));

      try {
        await fetch(`/api/skills/${encodeURIComponent(skillId)}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch (err) {
        console.error('Failed to delete skill in MySQL:', err);
      }
    }
  };

  const handleResetDemoData = async () => {
    if (window.confirm('Reset all workspaces to default demo data?')) {
      try {
        const res = await fetch('/api/skills/reset', {
          method: 'POST',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.skills)) {
            setSkills(data.skills);
            return;
          }
          console.error('Failed to reset demo data: the server returned an invalid response.');
        } else {
          console.error(`Failed to reset demo data (status ${res.status}).`);
        }
      } catch (err) {
        console.error('Failed to reset demo data in MySQL:', err);
      }
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
                skillsLoading={!skillsLoaded}
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
              <UserProfilePage skills={skills} />
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
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
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
