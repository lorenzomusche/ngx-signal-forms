import { ValidatorFn } from './types';

/**
 * Built-in pure validator functions.
 * All validators are pure functions — they receive a value and return
 * an array of error strings (empty = valid).
 *
 * Compose multiple validators with `compose()`.
 */

/** Fail if value is null, undefined, empty string, or empty array */
export const required = <T>(message = 'This field is required'): ValidatorFn<T> =>
  (value: T): readonly string[] => {
    if (value === null || value === undefined) return [message];
    if (typeof value === 'string' && value.trim() === '') return [message];
    if (Array.isArray(value) && value.length === 0) return [message];
    return [];
  };

/** Minimum string/array length */
export const minLength = (min: number, message?: string): ValidatorFn<string | readonly unknown[]> =>
  (value) => {
    const len = value?.length ?? 0;
    return len < min
      ? [message ?? `Minimum length is ${min}`]
      : [];
  };

/** Maximum string/array length */
export const maxLength = (max: number, message?: string): ValidatorFn<string | readonly unknown[]> =>
  (value) => {
    const len = value?.length ?? 0;
    return len > max
      ? [message ?? `Maximum length is ${max}`]
      : [];
  };

/** Email format validator */
export const email = (message = 'Invalid email address'): ValidatorFn<string | null> =>
  (value) => {
    if (!value) return [];
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? [] : [message];
  };

/** RegExp pattern validator */
export const pattern = (regex: RegExp, message = 'Invalid format'): ValidatorFn<string | null> =>
  (value) => {
    if (!value) return [];
    return regex.test(value) ? [] : [message];
  };

/** Numeric minimum */
export const min = (minimum: number, message?: string): ValidatorFn<number | null> =>
  (value) => {
    if (value === null || value === undefined) return [];
    return value < minimum
      ? [message ?? `Minimum value is ${minimum}`]
      : [];
  };

/** Numeric maximum */
export const max = (maximum: number, message?: string): ValidatorFn<number | null> =>
  (value) => {
    if (value === null || value === undefined) return [];
    return value > maximum
      ? [message ?? `Maximum value is ${maximum}`]
      : [];
  };

/**
 * Compose multiple validators into one.
 * Runs all validators and merges errors (stops on first error if `bail` = true).
 */
export const compose = <T>(
  ...validators: readonly ValidatorFn<T>[]
): ValidatorFn<T> =>
  (value: T): readonly string[] =>
    validators.flatMap(v => v(value));

/** Same as compose but stops at first failing validator */
export const composeFirst = <T>(
  ...validators: readonly ValidatorFn<T>[]
): ValidatorFn<T> =>
  (value: T): readonly string[] => {
    for (const v of validators) {
      const errors = v(value);
      if (errors.length > 0) return errors;
    }
    return [];
  };
