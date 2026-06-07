declare module "node:test" {
  type TestFn = (name: string, fn: () => void | Promise<void>) => void;
  const test: TestFn;
  export default test;
}

declare module "node:assert/strict" {
  const assert: {
    equal: (actual: unknown, expected: unknown) => void;
    throws: (fn: () => unknown, pattern?: RegExp) => void;
    rejects: (fn: () => Promise<unknown>, pattern?: RegExp) => Promise<void>;
  };
  export default assert;
}

declare module "node:crypto" {
  export const createHash: (algo: string) => { update: (v: string) => { digest: (enc: string) => string } };
}

declare module "node:fs/promises" {
  export const readFile: (path: string, enc: string) => Promise<string>;
  export const readdir: (path: string, opts: { withFileTypes: true }) => Promise<Array<{ name: string }>>;
  export const stat: (path: string) => Promise<{ isFile: () => boolean; size: number; mtimeMs: number }>;
  export const lstat: (path: string) => Promise<{ isSymbolicLink: () => boolean }>;
  export const mkdtemp: (prefix: string) => Promise<string>;
  export const writeFile: (path: string, data: string) => Promise<void>;
  export const mkdir: (path: string) => Promise<void>;
  export const symlink: (target: string, path: string) => Promise<void>;
}

declare module "node:path" {
  export const extname: (path: string) => string;
  export const join: (...parts: string[]) => string;
  export const relative: (from: string, to: string) => string;
}

declare module "node:os" {
  export const tmpdir: () => string;
}
