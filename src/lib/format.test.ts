import { describe, expect, it } from 'vitest';
import { displayValue, formatDateTime, formatNaira, formatNumber, toDateInputValue } from './format';
import { isValidEmail, validateLogin } from './validation';

describe('formatters', () => {
  it('formats dates like the design', () => {
    expect(formatDateTime('2020-05-15T10:00:00')).toBe('May 15, 2020 10:00 AM');
  });

  it('shows a dash for invalid dates', () => {
    expect(formatDateTime('nope')).toBe('—');
    expect(toDateInputValue('nope')).toBe('');
  });

  it('formats numbers and Naira amounts', () => {
    expect(formatNumber(102453)).toBe('102,453');
    expect(formatNaira(200000)).toBe('₦200,000.00');
    expect(formatNaira(Number.NaN)).toBe('—');
  });

  it('converts timestamps to date-input values', () => {
    expect(toDateInputValue('2020-04-30T10:00:00')).toBe('2020-04-30');
  });

  it('replaces empty values with a dash', () => {
    expect(displayValue('')).toBe('—');
    expect(displayValue(undefined)).toBe('—');
    expect(displayValue('Single')).toBe('Single');
  });
});

describe('login validation', () => {
  it('passes valid credentials', () => {
    expect(validateLogin({ email: 'adedeji@lendsqr.com', password: 'password1' })).toEqual({});
  });

  it('requires both fields', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Enter your email address',
      password: 'Enter your password',
    });
  });

  it('rejects malformed emails and short passwords', () => {
    const errors = validateLogin({ email: 'adedeji@lendsqr', password: 'short' });
    expect(errors.email).toMatch(/valid email/);
    expect(errors.password).toMatch(/at least 8/);
  });

  it.each(['plain', 'a@b', 'a b@c.com', '@lendsqr.com'])('rejects %s', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});
