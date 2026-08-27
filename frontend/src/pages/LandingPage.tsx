import React, { useState } from 'react';
import { Shield, Sparkles, MapPin, Building2, BookOpen, ArrowRight, User, X } from 'lucide-react';
import { UserSession } from '../App';

interface LandingPageProps {
  onLogin: (user: UserSession) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('citizen@nivaaran.gov.in');
  const [selectedRole, setSelectedRole] = useState<string>('Citizen');

  const handleDemoLogin = (roleName: string, userId: string, userName: string) => {
    onLogin({
      id: userId,
      name: userName,
      role: roleName,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = email.split('@')[0] || 'user_' + Date.now();
    onLogin({
      id: userId,
      name: email.split('@')[0].toUpperCase(),
      role: selectedRole,
    });
  };

  return (
    <div className="min-h-screen bg-nivaaran-bg flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-nivaaran-bg/90 backdrop-blur-md border-b border-nivaaran-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nivaaran-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
              N
            </div>
            <div>
              <span className="text-xl font-bold text-nivaaran-primary tracking-tight">NIVAARAN</span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-nivaaran-muted text-nivaaran-text-secondary px-2 py-0.5 rounded font-mono">
                SIH 26043
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-nivaaran-text-secondary">
            <a href="#about" className="hover:text-nivaaran-primary transition-colors">Overview</a>
            <a href="#lifecycle" className="hover:text-nivaaran-primary transition-colors">Lifecycle</a>
            <a href="#roles" className="hover:text-nivaaran-primary transition-colors">Roles</a>
            <a href="#gis" className="hover:text-nivaaran-primary transition-colors">Disaster GIS</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-nivaaran-primary hover:bg-nivaaran-primary-hover rounded-lg transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-6 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-nivaaran-surface border border-nivaaran-border text-nivaaran-accent text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Government of Jharkhand · Dept. of Higher & Technical Education</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-nivaaran-primary leading-tight">
              From Community Problems <br className="hidden sm:block" />
              to <span className="text-nivaaran-secondary underline decoration-nivaaran-accent/40">Scalable Solutions</span>
            </h1>

            <p className="text-lg md:text-xl text-nivaaran-text-secondary max-w-3xl mx-auto leading-relaxed">
              NIVAARAN bridges citizen-reported societal & disaster challenges directly with university research capabilities, industry support, and government verification.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={() => handleDemoLogin('Citizen', 'citizen_01', 'Ramesh Kumar')}
                className="w-full sm:w-auto px-8 py-3.5 bg-nivaaran-primary hover:bg-nivaaran-primary-hover text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>Login as Citizen & Try Demo</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-nivaaran-surface hover:bg-nivaaran-muted text-nivaaran-primary border border-nivaaran-border font-semibold rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>Sign In with Role</span>
                <MapPin className="w-5 h-5 text-nivaaran-accent" />
              </button>
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section id="about" className="py-16 px-6 bg-nivaaran-surface border-y border-nivaaran-border">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-nivaaran-bg p-8 rounded-xl border border-nivaaran-border shadow-sm space-y-3">
              <div className="w-12 h-12 bg-nivaaran-primary/10 text-nivaaran-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-nivaaran-primary">AI Problem Intelligence</h3>
              <p className="text-nivaaran-text-secondary text-sm leading-relaxed">
                Automated triage, entity extraction, priority scoring, and semantic deduplication—always explainable and overridable by human decision-makers.
              </p>
            </div>

            <div className="bg-nivaaran-bg p-8 rounded-xl border border-nivaaran-border shadow-sm space-y-3">
              <div className="w-12 h-12 bg-nivaaran-secondary/10 text-nivaaran-secondary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-nivaaran-primary">University Matching</h3>
              <p className="text-nivaaran-text-secondary text-sm leading-relaxed">
                Matches validated challenges directly with academic departments, specialized labs, faculty mentors, and multidisciplinary student teams.
              </p>
            </div>

            <div className="bg-nivaaran-bg p-8 rounded-xl border border-nivaaran-border shadow-sm space-y-3">
              <div className="w-12 h-12 bg-nivaaran-accent/10 text-nivaaran-accent rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-nivaaran-primary">Industry & CSR Collaboration</h3>
              <p className="text-nivaaran-text-secondary text-sm leading-relaxed">
                Marketplace for industry partners, MSMEs, and CSR funds to contribute mentorship, testing facilities, prototype grants, and deployment support.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-nivaaran-bg border border-nivaaran-border rounded-xl shadow-2xl w-full max-w-md p-6 relative space-y-4">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-nivaaran-text-secondary hover:text-nivaaran-primary p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-nivaaran-primary">Sign In to NIVAARAN</h3>
              <p className="text-xs text-nivaaran-text-secondary">Logging in triggers the 6-second intro video once per user.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-nivaaran-primary mb-1">Email / Username</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-nivaaran-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-nivaaran-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-nivaaran-primary mb-1">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-nivaaran-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-nivaaran-primary"
                >
                  <option value="Citizen">Citizen</option>
                  <option value="Government Department">Government Department</option>
                  <option value="University Admin">University Admin</option>
                  <option value="Faculty / Mentor">Faculty / Mentor</option>
                  <option value="Student">Student</option>
                  <option value="Industry / MSME">Industry / MSME</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-nivaaran-primary hover:bg-nivaaran-primary-hover text-white text-sm font-semibold rounded-md transition-colors"
              >
                Continue & Login
              </button>
            </form>

            <div className="border-t border-nivaaran-border pt-4">
              <span className="text-xs text-nivaaran-text-secondary block mb-2 font-medium">Quick Demo Accounts:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Citizen', 'citizen_01', 'Ramesh Kumar')}
                  className="px-2.5 py-1.5 text-xs bg-nivaaran-surface hover:bg-nivaaran-muted text-nivaaran-primary rounded border border-nivaaran-border font-medium text-left"
                >
                  Citizen Ramesh
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('University Admin', 'univ_01', 'Dr. S. K. Mahato')}
                  className="px-2.5 py-1.5 text-xs bg-nivaaran-surface hover:bg-nivaaran-muted text-nivaaran-primary rounded border border-nivaaran-border font-medium text-left"
                >
                  Univ Admin Mahato
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-nivaaran-primary text-nivaaran-bg py-8 px-6 border-t border-nivaaran-primary-hover">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-nivaaran-muted">
          <div>
            <span className="font-bold text-white">NIVAARAN</span> — Smart Societal Innovation Platform (SIH Problem Statement 26043)
          </div>
          <div>
            Department of Higher & Technical Education, Government of Jharkhand
          </div>
        </div>
      </footer>
    </div>
  );
};
