export const logger = {
  info: (...messages: unknown[]): void => console.info(...messages),
  warn: (...messages: unknown[]): void => console.warn(...messages),
};
