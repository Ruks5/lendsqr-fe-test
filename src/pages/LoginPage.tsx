import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, TextField } from '@/components/ui';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/features/auth/useAuth';
import { validateLogin, type LoginErrors, type LoginValues } from '@/lib/validation';
import illustration from '@/assets/images/login-illustration.webp';
import styles from './LoginPage.module.scss';

export default function LoginPage() {
  const { session, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResetHint, setShowResetHint] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  if (session) return <Navigate to={from} replace />;

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((v) => ({ ...v, [name]: value }));
    // Clear a field's error as soon as the user starts fixing it.
    if (errors[name as keyof LoginValues]) setErrors((e) => ({ ...e, [name]: undefined }));
    setFormError('');
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (nextErrors.email) return emailRef.current?.focus();
    if (nextErrors.password) return passwordRef.current?.focus();

    setSubmitting(true);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.visual} aria-hidden="true">
        <Logo className={styles.logo} height={36} />
        <img src={illustration} alt="" className={styles.illustration} width={600} height={338} />
      </section>

      <main className={styles.formPanel}>
        <Logo className={styles.mobileLogo} height={28} />
        <div className={styles.formWrap}>
          <h1 className={styles.title}>Welcome!</h1>
          <p className={styles.subtitle}>Enter details to login.</p>

          <form
            className={styles.form}
            onSubmit={onSubmit}
            noValidate
            aria-describedby={formError ? 'login-error' : undefined}
          >
            {formError && (
              <p id="login-error" className={styles.formError} role="alert">
                {formError}
              </p>
            )}

            <TextField
              ref={emailRef}
              label="Email"
              hideLabel
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              inputSize="lg"
              value={values.email}
              onChange={onChange}
              error={errors.email}
              disabled={submitting}
              required
            />

            <TextField
              ref={passwordRef}
              label="Password"
              hideLabel
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              autoComplete="current-password"
              inputSize="lg"
              value={values.password}
              onChange={onChange}
              error={errors.password}
              disabled={submitting}
              required
              trailing={
                <button
                  type="button"
                  className={styles.toggle}
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              }
            />

            <button
              type="button"
              className={styles.forgot}
              onClick={() => setShowResetHint((s) => !s)}
              aria-expanded={showResetHint}
              aria-controls="reset-hint"
            >
              Forgot password?
            </button>
            {showResetHint && (
              <p id="reset-hint" className={styles.resetHint}>
                Password resets are handled by your organisation’s administrator. Contact them to get a reset link.
              </p>
            )}

            <Button type="submit" size="lg" fullWidth loading={submitting} className={styles.submit}>
              Log in
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
