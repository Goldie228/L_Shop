/**
 * User Types - L_Shop Frontend
 * TypeScript interfaces for user-related data
 */

/**
 * User role enumeration
 */
export type UserRole = 'user' | 'admin';

/**
 * User object returned from API
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's display name */
  name: string;
  /** User's login username */
  login: string;
  /** User's email address */
  email: string;
  /** User's phone number in format +1234567890 */
  phone: string;
  /** User's role */
  role: UserRole;
  /** Account creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * User data for registration
 */
export interface RegisterUserData {
  /** User's display name */
  name: string;
  /** User's login username */
  login: string;
  /** User's email address */
  email: string;
  /** User's phone number in format +1234567890 */
  phone: string;
  /** User's password (min 6 characters) */
  password: string;
  /** Password confirmation (must match password) */
  confirmPassword: string;
}

/**
 * User data for login
 */
export interface LoginUserData {
  /** Login or email */
  loginOrEmail: string;
  /** User's password */
  password: string;
}

/**
 * User state for frontend store
 */
export interface UserState {
  /** Current user (null if not authenticated) */
  user: User | null;
  /** Authentication status */
  isAuthenticated: boolean;
  /** Loading state for auth operations */
  isLoading: boolean;
  /** Error message from last auth operation */
  error: string | null;
}

/**
 * User display info for header
 */
export interface UserDisplayInfo {
  /** User's initials for avatar */
  initials: string;
  /** User's display name (truncated if needed) */
  displayName: string;
}

/**
 * Get user display info from user object
 * @param user - User object
 * @returns Display info for UI
 */
export function getUserDisplayInfo(user: User): UserDisplayInfo {
  const nameParts = user.name.trim().split(/\s+/);
  const initials = nameParts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
  
  const displayName = user.name.length > 20 
    ? `${user.name.substring(0, 17)}...` 
    : user.name;
  
  return {
    initials: initials || user.login.charAt(0).toUpperCase(),
    displayName
  };
}

/**
 * Validation result for user input
 */
export interface ValidationResult {
  /** Whether the input is valid */
  isValid: boolean;
  /** Error message if invalid */
  error: string | null;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Validation result
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate login format
 * @param login - Login to validate
 * @returns Validation result
 */
export function validateLogin(login: string): ValidationResult {
  if (!login.trim()) {
    return { isValid: false, error: 'Login is required' };
  }
  
  if (login.length < 3) {
    return { isValid: false, error: 'Login must be at least 3 characters' };
  }
  
  if (login.length > 30) {
    return { isValid: false, error: 'Login must be less than 30 characters' };
  }
  
  const loginRegex = /^[a-zA-Z0-9_]+$/;
  if (!loginRegex.test(login)) {
    return { isValid: false, error: 'Login can only contain letters, numbers, and underscores' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  
  if (password.length > 100) {
    return { isValid: false, error: 'Password is too long' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate phone number format
 * @param phone - Phone to validate
 * @returns Validation result
 */
export function validatePhone(phone: string): ValidationResult {
  const phoneRegex = /^\+\d{10,15}$/;
  
  if (!phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Phone must be in format +1234567890' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate name
 * @param name - Name to validate
 * @returns Validation result
 */
export function validateName(name: string): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate password confirmation
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Validation result
 */
export function validatePasswordConfirmation(
  password: string, 
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Password confirmation is required' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true, error: null };
}