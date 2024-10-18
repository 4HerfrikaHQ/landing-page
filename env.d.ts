interface CloudflareEnv {
  ENV: string;
  DB: D1Database;
}

/**
 * Environment variable accessed from `process.env`
 * throws an error if required variable is not set, reduces the effort of writing catch for these vars
 */
type EnvVariables = {
  // untyped var, use with caution
  [key: string]: unknown;

  /** Google Oauth */
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;

  EMAIL_SERVER: string;
  EMAIL_FROM: string;
};
