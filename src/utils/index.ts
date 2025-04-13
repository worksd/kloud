export const extractNumber = (input: string): number => {
  const numericString = input.replace(/\D/g, "");
  return parseInt(numericString, 10);
};