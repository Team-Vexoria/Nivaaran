import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { AlertCircle, ArrowLeft, Info, ShieldCheck, Key } from 'lucide-react';

interface RoleEmailConfig {
  placeholder: string;
  hint: string;
}

const ROLE_CONFIGS: Record<UserRole, RoleEmailConfig> = {
  'Citizen': {
    placeholder: 'ramesh.kumar@gmail.com',
    hint: 'Citizens, Community Orgs & NGOs can use any personal email address.',
  },
  'Government Department': {
    placeholder: 'nivaaran@gov.in',
    hint: 'Official Gov Account: nivaaran@gov.in (Pass: nivaaran@123)',
  },
  'University Admin': {
    placeholder: 'admin@bitmesra.in',
    hint: 'Official Academic Account: admin@bitmesra.in (Pass: admin@123)',
  },
  'Faculty / Mentor': {
    placeholder: 'admin@bitmesra.in',
    hint: 'Faculty / Mentor Account: admin@bitmesra.in (Pass: admin@123)',
  },
  'Student': {
    placeholder: 'student.nivaaran@gmail.com or admin@bitmesra.in',
    hint: 'Students can register with personal email or institutional account.',
  },
  'Industry / MSME': {
    placeholder: 'partner@tatasteel.com',
    hint: 'Industry partners can register with company or personal email.',
  },
  'CSR Organization': {
    placeholder: 'foundation@csr.org',
    hint: 'CSR foundations can register with organisation email.',
  },
  'Platform Super Admin': {
    placeholder: 'admin@nivaaran.in',
    hint: 'Official Super Admin Account: admin@nivaaran.in (Pass: admin@123)',
  },
};

export const AuthPage: React.FC<{ onBackToHome?: () => void }> = ({ onBackToHome }) => {
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('Citizen');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentRoleConfig = ROLE_CONFIGS[role] || ROLE_CONFIGS['Citizen'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      if (isSignUp) {
        await signupWithEmail(email, password, displayName, role);
      } else {
        await loginWithEmail(email, password, role);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    try {
      await loginWithGoogle(role);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google Authentication failed.');
    }
  };

  const fillOfficialCredentials = (officialEmail: string, officialPass: string, officialRole: UserRole) => {
    setEmail(officialEmail);
    setPassword(officialPass);
    setRole(officialRole);
    setIsSignUp(false);
  };

  return (
    <div className="min-h-screen bg-nivaaran-bg flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white border border-nivaaran-border rounded-xl shadow-xl p-8 space-y-6 relative">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="absolute top-6 left-6 text-xs text-nivaaran-text-secondary hover:text-nivaaran-primary flex items-center space-x-1 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 bg-nivaaran-primary text-white font-bold text-2xl rounded-xl flex items-center justify-center mx-auto shadow-md">
            N
          </div>
          <h2 className="text-2xl font-bold text-nivaaran-primary">
            {isSignUp ? 'Create NIVAARAN Account' : 'Sign In to NIVAARAN'}
          </h2>
          <p className="text-xs text-nivaaran-text-secondary">
            Jharkhand Societal Challenge & Innovation Network
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-nivaaran-danger/10 border border-nivaaran-danger/30 rounded-lg text-nivaaran-danger text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-nivaaran-primary mb-1">Select Portal Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm border border-nivaaran-border rounded-lg bg-nivaaran-surface focus:outline-none focus:ring-2 focus:ring-nivaaran-primary font-medium"
            >
              <option value="Citizen">1. Citizen & Community Org (NGO/PRI/ULB)</option>
              <option value="Government Department">2. Government Department Officer</option>
              <option value="University Admin">3. University Admin</option>
              <option value="Faculty / Mentor">4. Faculty / Mentor</option>
              <option value="Student">5. Student</option>
              <option value="Industry / MSME">6. Industry / MSME / Startup</option>
              <option value="CSR Organization">7. CSR Organization</option>
              <option value="Platform Super Admin">8. Platform Super Admin</option>
            </select>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-nivaaran-primary mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Ramesh Kumar"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-nivaaran-border rounded-lg focus:outline-none focus:ring-2 focus:ring-nivaaran-primary"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-nivaaran-primary mb-1">Email Address</label>
            <input
              type="email"
              placeholder={currentRoleConfig.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-nivaaran-border rounded-lg focus:outline-none focus:ring-2 focus:ring-nivaaran-primary"
              required
            />
            <div className="flex items-start space-x-1 mt-1 text-[11px] text-nivaaran-text-secondary">
              <Info className="w-3.5 h-3.5 text-nivaaran-accent flex-shrink-0 mt-0.5" />
              <span>{currentRoleConfig.hint}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-nivaaran-primary mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-nivaaran-border rounded-lg focus:outline-none focus:ring-2 focus:ring-nivaaran-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-nivaaran-primary hover:bg-nivaaran-primary-hover text-white text-sm font-semibold rounded-lg shadow transition-colors"
          >
            {isSignUp ? 'Sign Up & Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-nivaaran-border"></div>
          <span className="flex-shrink mx-3 text-xs text-nivaaran-text-secondary uppercase font-semibold">Or</span>
          <div className="flex-grow border-t border-nivaaran-border"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 bg-white border border-nivaaran-border text-nivaaran-text-primary hover:bg-nivaaran-surface text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>Sign In with Google</span>
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
            }}
            className="text-xs text-nivaaran-secondary hover:underline font-semibold"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>

        {/* Pre-configured Official Accounts Quick Fill */}
        <div className="border-t border-nivaaran-border pt-4 space-y-2">
          <div className="flex items-center space-x-1 text-[11px] font-semibold text-nivaaran-primary uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-nivaaran-secondary" />
            <span>Official Firebase Accounts Quick-Fill:</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <button
              onClick={() => fillOfficialCredentials('nivaaran@gov.in', 'nivaaran@123', 'Government Department')}
              className="w-full px-3 py-1.5 bg-nivaaran-surface hover:bg-nivaaran-muted text-nivaaran-primary rounded-md border border-nivaaran-border font-medium text-left flex items-center justify-between transition-colors"
            >
              <span>Gov Dept Officer (<code className="text-nivaaran-accent font-mono text-[11px]">nivaaran@gov.in</code>)</span>
              <Key className="w-3 h-3 text-nivaaran-text-secondary" />
            </button>

            <button
              onClick={() => fillOfficialCredentials('admin@bitmesra.in', 'admin@123', 'University Admin')}
              className="w-full px-3 py-1.5 bg-nivaaran-surface hover:bg-nivaaran-muted text-nivaaran-primary rounded-md border border-nivaaran-border font-medium text-left flex items-center justify-between transition-colors"
            >
              <span>University Admin (<code className="text-nivaaran-secondary font-mono text-[11px]">admin@bitmesra.in</code>)</span>
              <Key className="w-3 h-3 text-nivaaran-text-secondary" />
            </button>

            <button
              onClick={() => fillOfficialCredentials('admin@nivaaran.in', 'admin@123', 'Platform Super Admin')}
              className="w-full px-3 py-1.5 bg-nivaaran-surface hover:bg-nivaaran-muted text-nivaaran-primary rounded-md border border-nivaaran-border font-medium text-left flex items-center justify-between transition-colors"
            >
              <span>Super Admin (<code className="text-nivaaran-danger font-mono text-[11px]">admin@nivaaran.in</code>)</span>
              <Key className="w-3 h-3 text-nivaaran-text-secondary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
