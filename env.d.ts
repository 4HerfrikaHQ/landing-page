/**
 * Environment variable accessed from `process.env`
 * throws an error if variable is not set, reduces the effort of writing catch for these vars
 */
type EnvVariables = {
  /** config */
  DATABASE_URL: string;
  AUTH_TOKEN: string;

  /** Google Oauth */
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;

  EMAIL_SERVER: string;

  /** NextAuth */
  AUTH_SECRET: string;
  SERVER_URL: string;

  // untyped var, use with caution
  [key: string]: unknown;
};
