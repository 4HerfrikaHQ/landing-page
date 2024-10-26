/**
 * To ease out local development, we can use a default value for environment variables.
 *
 * If a default is specified, it will be used when the environment variable is not set and
 * we can set the type of the variable to optional in the `EnvVariables` type.
 * e.g:
 * ```
 * DATABASE_URL?: string;
 * ```
 */
const ENVIRONMENT_DEFAULTS: Partial<EnvVariables> = {
  // remove these if not using Google Oauth
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",

  ADMIN_EMAIL: "admin@4herfrika.org",
  RESEND_API_KEY: "",
  AUTH_SECRET: "",

  // remove these if not using Next
  NEXTAUTH_URL: "http://localhost:3000",
};

/**
 * Environment variables
 */
export const env = new Proxy<EnvVariables>(
  (process.env as unknown) as EnvVariables,
  {
    get(target, prop: string) {
      if (
        !(prop in target) &&
        !(process.env.NODE_ENV !== "production" && prop in ENVIRONMENT_DEFAULTS)
      ) {
        throw new Error(
          `ERROR: Missing env var: \`${prop}\`. Please check .env`
        );
      }
      const value = target[prop] ?? ENVIRONMENT_DEFAULTS[prop];
      try {
        return JSON.parse(value as string);
      } catch {
        return value;
      }
    },
  }
);
