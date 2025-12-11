/**
 * Valida que un string no contenga patrones comunes de SQL injection
 */
export const validateNoSqlInjection = (input: string): boolean => {
  const sqlInjectionPatterns = [
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
    /(--)/,
    /(;)/,
    /(\bDROP\b)/i,
    /(\bDELETE\b)/i,
    /(\bINSERT\b)/i,
    /(\bUPDATE\b)/i,
    /(\bEXEC\b)/i,
    /(\bUNION\b)/i,
    /('.*--)/,
    /('.*OR.*'.*=.*')/i,
  ];

  return !sqlInjectionPatterns.some((pattern) => pattern.test(input));
};

/**
 * Sanitiza input para prevenir SQL injection
 * Nota: TypeORM ya previene SQL injection, pero esto es una capa extra
 */
export const sanitizeSqlInput = (input: string): string => {
  // Remover caracteres potencialmente peligrosos
  return input.replace(/[';\\]/g, '');
};
