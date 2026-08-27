import React, { useState } from 'react';
import { IntroVideoSplash } from './components/IntroVideoSplash';
import { LandingPage } from './pages/LandingPage';
import { LogOut, UserCheck } from 'lucide-react';

export interface UserSession {
  id: string;
  name: string;
  role: string;
}

export const App: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [showVideoForUser, setShowVideoForUser] = useState<string | null>(null);
  const [videoFinished, setVideoFinished] = useState<boolean>(false);

  const handleLogin = (newUser: UserSession) => {
    setUser(newUser);
    setShowVideoForUser(newUser.id);
    setVideoFinished(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowVideoForUser(null);
    setVideoFinished(false);
  };

  const handleIntroComplete = () => {
    setVideoFinished(true);
  };

  return (
    <>
      {/* Play intro video post-login if user hasn't seen it */}
      {showVideoForUser && !videoFinished && (
        <IntroVideoSplash
          userId={showVideoForUser}
          onComplete={handleIntroComplete}
        />
      )}

      {/* Render app based on auth state */}
      {!user ? (
        <LandingPage onLogin={handleLogin} />
      ) : (
        videoFinished && (
          <div className="min-h-screen bg-nivaaran-bg flex flex-col">
            {/* Authenticated Header */}
            <header className="sticky top-0 z-40 bg-nivaaran-primary text-white px-6 py-4 shadow-md">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-nivaaran-secondary rounded-lg flex items-center justify-center font-bold text-xl text-white">
                    N
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight">NIVAARAN Dashboard</h1>
                    <p className="text-xs text-nivaaran-muted font-mono">Jharkhand Societal Challenge & Innovation Network</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-xs bg-white/10 px-3 py-1.5 rounded-full">
                    <UserCheck className="w-4 h-4 text-nivaaran-secondary" />
                    <span>{user.name} ({user.role})</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs font-medium bg-nivaaran-danger hover:bg-red-700 text-white rounded-md transition-colors flex items-center space-x-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Main User Dashboard View */}
            <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
              <div className="bg-nivaaran-surface border border-nivaaran-border p-6 rounded-xl space-y-3">
                <h2 className="text-2xl font-bold text-nivaaran-primary">Welcome, {user.name}!</h2>
                <p className="text-nivaaran-text-secondary text-sm leading-relaxed">
                  You are logged in as <strong className="text-nivaaran-primary">{user.role}</strong>. The 6-second intro video was triggered for your first login and will not play again on future logins.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-2">
                  <h3 className="font-semibold text-nivaaran-primary">Submit Challenge</h3>
                  <p className="text-xs text-nivaaran-text-secondary">Report local issues or disaster risks in Jharkhand villages & districts.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-2">
                  <h3 className="font-semibold text-nivaaran-primary">My Active Projects</h3>
                  <p className="text-xs text-nivaaran-text-secondary">Track matched challenges, university collaboration, and milestones.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-nivaaran-border shadow-sm space-y-2">
                  <h3 className="font-semibold text-nivaaran-primary">GIS Hotspot Map</h3>
                  <p className="text-xs text-nivaaran-text-secondary">Explore real-time spatial disaster intelligence across Jharkhand.</p>
                </div>
              </div>
            </main>
          </div>
        )
      )}
    </>
  );
};

export default App;
