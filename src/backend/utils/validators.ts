// Validation email
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validation phone
export const isValidPhone = (phone: string): boolean => {
  return /^\+?\d{10,15}$/.test(phone);
};