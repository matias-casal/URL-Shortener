/**
 * Validates if a string is a valid URL
 */
export const isURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};
