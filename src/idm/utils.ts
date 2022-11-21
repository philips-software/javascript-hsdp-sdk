// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const omitKeys = <T extends Record<string, any>>(object: T, keys: (keyof T)[]) =>
  Object.keys(object)
    .filter((k) => !keys.includes(k))
    .reduce((result, key) => ({ ...result, [key]: object[key] }), {});
