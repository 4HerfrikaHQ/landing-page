/**
 * Environment variables
 */
export const env = new Proxy<EnvVariables>(
  (process.env as unknown) as EnvVariables,
  {
    get(target, prop: string) {
      if (!(prop in target)) {
        // throw new Error(
        //   `ERROR: Missing env var: \`${prop}\`. Please check .env`
        // );
      }
      try {
        return JSON.parse(target[prop] as string);
      } catch {
        return target[prop];
      }
    },
  }
);
