import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import {
  ArrowLeft, Sparkles, Moon, Sun, Rocket, Mail,
  ArrowRight, Eye, EyeOff, Lock, User, Phone, AtSign, CheckCircle2, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/use-theme';
import { getPostAuthRoute } from '../lib/auth';
import { signupUser } from '../utils/authApi';

type SignupStep = 'options' | 'email-form';

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const passwordRules: PasswordRule[] = [
  { label: 'Minimum 8 characters',       test: (pw) => pw.length >= 8 },
  { label: 'Must contain uppercase',      test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Must contain lowercase',      test: (pw) => /[a-z]/.test(pw) },
  { label: 'Must contain a digit',        test: (pw) => /\d/.test(pw) },
  { label: 'Must contain special character', test: (pw) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw) },
];

export default function Signup() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<SignupStep>('options');

  // Email form fields
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [phone, setPhone]               = useState('');
  const [username, setUsername]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const navigate = useNavigate();
  const { signInWithGoogleToken } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // ── Password rule checks ──────────────────────────────────────────────────
  const allRulesPassed = passwordRules.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleSignIn = async (googleToken: string) => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const user = await signInWithGoogleToken(googleToken);
      toast.success(`Welcome, ${user.firstName || user.displayName || 'there'}! 🎉`);
      navigate(getPostAuthRoute(user.role), { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to sign up with Google. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = (message: string) => {
    setError(message);
    toast.error(message);
  };

  // ── Email form submit ─────────────────────────────────────────────────────
  const handleEmailSignup = async () => {
    if (!firstName.trim())         { setError('Please enter your first name.');        return; }
    if (!lastName.trim())          { setError('Please enter your last name.');         return; }
    if (!username.trim())          { setError('Please enter a username.');             return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                                   { setError('Please enter a valid email address.');  return; }
    if (!allRulesPassed)           { setError('Password does not meet all requirements.'); return; }
    if (!passwordsMatch)           { setError('Passwords do not match.');              return; }

    setError('');
    setIsEmailLoading(true);
    try {
      const result = await signupUser({
        firstName,
        lastName,
        phone,
        username,
        email,
        password,
      });

      const response = (result ?? {}) as { message?: string; email?: string };
      const nextEmail = response.email || email.trim().toLowerCase();

      toast.success(response.message || 'Account created. Check your email for the OTP.');
      navigate(`/verify-otp?email=${encodeURIComponent(nextEmail)}`, {
        state: {
          email: nextEmail,
          firstName: firstName.trim(),
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsEmailLoading(false);
    }
  };

  // ── Features list ─────────────────────────────────────────────────────────
  const features = [
    '🎓 Access 100+ curated courses',
    '📊 Track your learning progress',
    '🏆 Earn certificates & badges',
    '👥 Join a community of learners',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 font-poppins transition-colors duration-300">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Theme Toggle */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl bg-card border border-border hover:bg-accent/50 transition-all shadow-md z-10"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-card/80 backdrop-blur-xl border border-border rounded-3xl shadow-card w-full max-w-md p-8 md:p-10"
      >
        {/* Back button */}
        {step === 'options' ? (
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        ) : (
          <button
            onClick={() => { setStep('options'); setError(''); }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-glow"
          >
            {step === 'email-form'
              ? <Mail className="w-8 h-8 text-white" />
              : <Rocket className="w-8 h-8 text-white" />
            }
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {step === 'options' && (
                <>
                  <h1 className="text-3xl font-bold mb-3 text-foreground">Join the Future! 🚀</h1>
                  <p className="text-muted-foreground text-lg">Start your learning journey today</p>
                </>
              )}
              {step === 'email-form' && (
                <>
                  <h1 className="text-3xl font-bold mb-3 text-foreground">Create your account 📧</h1>
                  <p className="text-muted-foreground">Fill in your details to get started</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl mb-6 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ── STEP: options ── */}
          {step === 'options' && (
            <motion.div
              key="options"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {/* Google */}
              <GoogleLoginButton
                mode="signup"
                themeMode={theme}
                isLoading={isGoogleLoading}
                onToken={handleGoogleSignIn}
                onFailure={handleGoogleError}
              />

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-card text-muted-foreground">or</span>
                </div>
              </div>

              {/* Email */}
              <button
                onClick={() => { setError(''); setStep('email-form'); }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent/40 transition-all font-medium text-sm"
              >
                <Mail className="w-5 h-5 text-primary" />
                Sign up with Email
              </button>
            </motion.div>
          )}

          {/* ── STEP: email-form ── */}
          {step === 'email-form' && (
            <motion.div
              key="email-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {/* First name + Last name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Phone (optional) */}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={15}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Username */}
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password requirements — animated, shows when password field has content or is focused */}
              <AnimatePresence>
                {(passwordFocused || password.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 bg-accent/20 rounded-xl border border-border space-y-1.5">
                      {passwordRules.map((rule) => {
                        const passed = rule.test(password);
                        return (
                          <motion.div
                            key={rule.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                          >
                            <motion.div
                              animate={{ scale: passed ? [1, 1.3, 1] : 1 }}
                              transition={{ duration: 0.25 }}
                            >
                              {passed
                                ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                : <XCircle className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                              }
                            </motion.div>
                            <motion.span
                              animate={{ color: passed ? '#22c55e' : undefined }}
                              className={`text-xs transition-colors ${passed ? 'text-green-500' : 'text-muted-foreground'}`}
                            >
                              {rule.label}
                            </motion.span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSignup()}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-green-500 focus:ring-green-500/30'
                        : 'border-destructive focus:ring-destructive/30'
                      : 'border-border focus:ring-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm password match hint */}
              <AnimatePresence>
                {confirmPassword.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-xs flex items-center gap-1.5 -mt-1 ${passwordsMatch ? 'text-green-500' : 'text-destructive'}`}
                  >
                    {passwordsMatch
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</>
                      : <><XCircle className="w-3.5 h-3.5" /> Passwords do not match</>
                    }
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                onClick={handleEmailSignup}
                disabled={isEmailLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-glow mt-2"
              >
                {isEmailLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Features List — only on options step */}
        <AnimatePresence>
          {step === 'options' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 p-4 bg-accent/30 rounded-2xl border border-border"
            >
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                What you'll get:
              </h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-sm text-muted-foreground"
                  >
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {step === 'options' && (
          <div className="text-center space-y-4 mt-8">
            <p className="text-sm text-muted-foreground">
              By signing up, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-semibold transition-colors focus:outline-none focus:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}