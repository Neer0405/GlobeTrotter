/**
 * Validate email address format using RFC compliant regex
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password requirements (min 6 characters)
 */
export function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

/**
 * Validate registration request body
 */
export function validateRegistrationInput({ name, email, password, confirmPassword }) {
  const errors = {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!password || !isValidPassword(password)) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate login request body
 */
export function validateLoginInput({ email, password }) {
  const errors = {};

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate reset password input
 */
export function validateResetPasswordInput({ token, newPassword, confirmPassword }) {
  const errors = {};

  if (!token || typeof token !== 'string') {
    errors.token = 'Reset token is required';
  }

  if (!newPassword || !isValidPassword(newPassword)) {
    errors.newPassword = 'New password must be at least 6 characters long';
  }

  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
