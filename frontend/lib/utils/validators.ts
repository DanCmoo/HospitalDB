export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{7,20}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateDocumentNumber = (doc: string): boolean => {
  const docRegex = /^[0-9]{5,20}$/;
  return docRegex.test(doc);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};
