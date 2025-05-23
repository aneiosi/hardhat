import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { sleep } from "../src/lang.js";
import { MultiProcessMutex } from "../src/synchronization.js";

describe("multi-process-mutex", () => {
  const mutexName = "test-mutex";

  it("should execute all the function in a sequential order, not in parallel", async () => {
    // Since all the functions cannot be executed in parallel because of the mutex,
    // the total execution time should be bigger than the sum of the execution times of each function.
    const mutex = new MultiProcessMutex(mutexName); // Use default max mutex lifespan
    const start = performance.now();

    const ms = [500, 700, 1000];
    await Promise.all([
      mutex.use(async () => {
        await sleep(ms[0] / 1000);
      }),
      mutex.use(async () => {
        await sleep(ms[1] / 1000);
      }),

      mutex.use(async () => {
        await sleep(ms[2] / 1000);
      }),
    ]);

    const end = performance.now();
    const duration = end - start;

    assert.ok(
      duration > ms[0] + ms[1] + ms[2],
      "Duration should be greater than the sum of the execution times of each function",
    );
  });

  it("should overwrite the current mutex locked by another function because the function took to long to finish", async () => {
    const mutexLifeSpanMs = 500;
    const mutex = new MultiProcessMutex(mutexName, mutexLifeSpanMs);

    const res: number[] = [];

    await Promise.all([
      mutex.use(async () => {
        await sleep(2);
        res.push(1);
      }),
      new Promise((resolve) =>
        setTimeout(async () => {
          await mutex.use(async () => {
            await sleep(0.2);
            res.push(2);
          });
          resolve(true);
        }, 200),
      ),
    ]);

    assert.deepEqual(res, [2, 1]);
  });

  it("should get the mutex lock because the first function to own it failed", async () => {
    const mutexLifeSpanMs = 20000; // The mutex should be released and not hit timeout because the first function failed
    const mutex = new MultiProcessMutex(mutexName, mutexLifeSpanMs);

    const start = performance.now();

    const res: number[] = [];
    let errThrown = false;

    await Promise.all([
      mutex
        .use(async () => {
          throw new Error("Expected error");
        })
        .catch(() => {
          errThrown = true;
        }),
      new Promise((resolve) =>
        setTimeout(async () => {
          await mutex.use(async () => {
            res.push(2);
          });
          resolve(true);
        }, 200),
      ),
    ]);

    const end = performance.now();
    const duration = end - start;

    assert.ok(errThrown, "Expected error to be thrown");
    assert.deepEqual(res, [2]);
    // Since the first function that obtained the mutex failed, the function waiting for it will acquire it instantly.
    // Therefore, the mutex timeout will not be reached, and the test should complete in less time than the mutex timeout.
    assert.ok(
      duration < 1000,
      "Duration should be less than the mutex timeout",
    );
  });
});
