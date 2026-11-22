declare module "bun:test" {
  interface Matchers<T = unknown> {
    toBe(expected: T): void;
    toEqual(expected: T): void;
    toBeLessThanOrEqual(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeGreaterThan(expected: number): void;
    toContain(expected: unknown): void;
    toMatch(expected: RegExp | string): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toHaveLength(expected: number): void;
    not: Matchers<T>;
  }

  type TestFn = () => void | Promise<void>;

  interface TestRunner {
    (name: string, fn: TestFn): void;
    failing: (name: string, fn: TestFn) => void;
    skip: (name: string, fn: TestFn) => void;
    todo: (name: string, fn?: TestFn) => void;
  }

  export const describe: (name: string, fn: () => void) => void;
  export const test: TestRunner;
  export const it: TestRunner;
  export const beforeEach: (fn: TestFn) => void;
  export const afterEach: (fn: TestFn) => void;
  export function expect<T>(actual: T): Matchers<T>;
}
