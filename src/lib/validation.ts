export interface LoginValues {
  email: string;
  password: string;
}

export type LoginErrors = Partial<Record<keyof LoginValues, string>>;

// Pragmatic check: something@something.tld, no spaces. Full RFC 5322
// validation belongs on the server.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function validateLogin({ email, password }: LoginValues): LoginErrors {
  const errors: LoginErrors = {};

  if (!email.trim()) errors.email = 'Enter your email address';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address, like name@company.com';

  if (!password) errors.password = 'Enter your password';
  else if (password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;

  return errors;
}
