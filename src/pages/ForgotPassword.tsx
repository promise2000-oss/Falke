import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Mail, Moon, ShieldCheck, Sparkles, Sun, TimerReset } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '../components/ui/input';
import { useTheme } from '../hooks/use-theme';
import { requestPasswordReset } from '../utils/authApi';

const SECURITY_HIGHLIGHTS = [
  'If an account exists for this email, a 6-digit reset OTP PIN will arrive shortly.',
  'The reset OTP PIN expires after 10 minutes and becomes invalid after one use.',
  'Backend rate limiting helps prevent spam and credential-stuffing attempts.',
];

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const initialEmail = (searchParams.get('email') || '').trim().toLowerCase();
  const [email, setEmail] = useState(initialEmail);
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const emailIsValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCooldown((currentValue) => (currentValue <= 1 ? 0 : currentValue - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!emailIsValid || isSubmitting || cooldown > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setHasSubmitted(true);
      setCooldown(30);
      toast.success('If an account exists for this email, a reset OTP PIN has been sent.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send a reset OTP PIN right now.';
      toast.error(
        message.toLowerCase().includes('too many')
          ? 'Too many attempts detected. Please wait a few seconds and try again.'
          : 'We could not process your request right now. Please try again shortly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 font-poppins transition-colors duration-300">
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{ x: [0, -80, 0], y: [0, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl bg-card border border-border hover:bg-accent/50 transition-all shadow-md z-10"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative bg-card/80 backdrop-blur-xl border border-border rounded-3xl shadow-card w-full max-w-lg p-8 md:p-10"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Login</span>
        </Link>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 220 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-glow"
          >
            <Mail className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-3 text-foreground">Forgot your password?</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Enter your email and we&apos;ll send a 6-digit reset OTP PIN if an account is registered.
          </p>
        </div>

        <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2">
            <label htmlFor="reset-email" className="text-sm font-medium text-foreground">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="pl-10 h-12 rounded-xl"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The button becomes active once the email format looks valid.
            </p>
          </div>

          <button
            type="submit"
            disabled={!emailIsValid || isSubmitting || cooldown > 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-glow"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : cooldown > 0 ? (
              <>
                <TimerReset className="w-4 h-4" />
                Try again in {cooldown}s
              </>
            ) : (
              <>
                Send OTP PIN
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {hasSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Check your inbox</p>
                <p className="text-sm text-muted-foreground mt-1">
                  If an account exists for <span className="font-medium text-foreground">{email.trim()}</span>, a 6-digit reset OTP PIN has been sent. Enter it on the next screen to choose a new password.
                </p>
                <Link
                  to={`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                  className="mt-3 inline-flex items-center rounded-xl bg-gradient-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition-all"
                >
                  Continue to reset password
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Security built in</p>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {SECURITY_HIGHLIGHTS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-sm font-semibold text-foreground mb-2">Email preview</p>
            <div className="rounded-xl border border-border bg-card p-3 text-left space-y-2">
              <p className="text-xs font-semibold text-foreground"></p>
              <p className="text-xs text-muted-foreground">
                Use the 6-digit OTP PIN below to verify your password reset request.
              </p>
              <div className="flex items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-sm font-bold tracking-[0.35em] text-primary">
                483 921
              </div>
              <p className="text-[11px] text-muted-foreground">
                Expires in 10 minutes • one-time use only
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
