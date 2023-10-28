import { logHandler } from "./utils/logHandler";

/**
 * The linter will expect JSDoc declarations for all exported functions.
 *
 * @param {string} name Variables should be typed, and full sentences are expected.
 * @returns {string} The return type should be specified.
 */
const main = (name: string): string => {
  const string = `Hello ${name}!`;
  logHandler.log("info", string);
  return string;
};

main("Naomi");

export default main;
