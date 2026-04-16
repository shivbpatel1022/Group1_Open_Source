import assert from "node:assert/strict";

type AsyncFn<TArgs extends unknown[], TResult> = (...args: TArgs) => TResult;

export const createMockResponse = () => {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

export const withPatchedMethod = async <
  TObject extends Record<string, unknown>,
  TKey extends keyof TObject & string,
  TArgs extends unknown[],
  TResult
>(
  target: TObject,
  methodName: TKey,
  replacement: AsyncFn<TArgs, TResult>,
  run: () => Promise<void> | void
) => {
  const original = target[methodName];
  assert.equal(typeof original, "function", `${methodName} must be a function to patch`);

  (target as Record<string, unknown>)[methodName] = replacement;

  try {
    await run();
  } finally {
    (target as Record<string, unknown>)[methodName] = original;
  }
};
