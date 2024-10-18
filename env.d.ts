/**
 * Environment variable accessed from `process.env`
 * throws an error if variable is not set, reduces the effort of writing catch for these vars
 */
type EnvVariables = {
  /** Google Oauth */
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;

  EMAIL_SERVER: string;
  EMAIL_FROM: string;

  // untyped var, use with caution
  [key: string]: unknown;
};

/**
 * Cloudflare Pages environment bindings
 */
interface CloudflareEnv {
  DB: D1Database;
}
