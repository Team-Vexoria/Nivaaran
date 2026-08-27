import React from 'react';
import { Shield, Sparkles, MapPin, Building2, BookOpen, ArrowRight, RotateCcw } from 'lucide-react';

interface LandingPageProps {
  onReplayIntro: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onReplayIntro }) => {
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
              onClick={onReplayIntro}
              className="px-3.5 py-1.5 text-xs font-medium text-nivaaran-text-secondary hover:text-nivaaran-primary bg-nivaaran-surface hover:bg-nivaaran-muted border border-nivaaran-border rounded-lg transition-colors flex items-center space-x-1.5"
              title="Test playing the intro video again"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Intro</span>
            </button>

            <button className="px-4 py-2 text-sm font-medium text-white bg-nivaaran-primary hover:bg-nivaaran-primary-hover rounded-lg transition-colors shadow-sm">
              Sign In
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
              <button className="w-full sm:w-auto px-8 py-3.5 bg-nivaaran-primary hover:bg-nivaaran-primary-hover text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center space-x-2">
                <span>Explore Challenges</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button className="w-full sm:w-auto px-8 py-3.5 bg-nivaaran-surface hover:bg-nivaaran-muted text-nivaaran-primary border border-nivaaran-border font-semibold rounded-lg transition-all flex items-center justify-center space-x-2">
                <span>Submit Local Issue</span>
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
