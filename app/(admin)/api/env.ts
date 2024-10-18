/**
 * Environment variables
 */
export const env = new Proxy<EnvVariables>(
  (process.env as unknown) as EnvVariables,
  {
    get(target, prop: string) {
      if (!(prop in target)) {
        throw new Error(`Please configure Environment var: ${prop} before use`);
      }
      return target[prop];
    },
  }
);
