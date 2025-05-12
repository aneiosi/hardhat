import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { beforeEach, describe, it } from "node:test";

import { useTmpDir } from "@nomicfoundation/hardhat-test-utils";
import {
  getAccessTime,
  getAllFilesMatching,
  getFileSize,
} from "@nomicfoundation/hardhat-utils/fs";

import { ObjectCache } from "../../../../../src/internal/builtin-plugins/solidity/build-system/cache.js";

describe("ObjectCache", () => {
  let cache: ObjectCache<string>;
  let cachePath: string;
  let testKey: string;
  let testValue: string;

  useTmpDir("object-cache");

  beforeEach(async () => {
    cachePath = path.join(process.cwd(), "cache");
    cache = new ObjectCache<string>(cachePath, "test", "v1");
    testKey = randomUUID();
    testValue = "testValue";
    await cache.set(testKey, testValue);
  });

  describe("get", () => {
    it("should return undefined if the key is not present", async () => {
      assert.equal(await cache.get(randomUUID()), undefined);
    });
    it("should return the value if the key is present", async () => {
      assert.equal(await cache.get(testKey), testValue);
    });
    it("should return undefined if the key is present under a different namespace", async () => {
      const newCache = new ObjectCache<string>(cachePath, "newTest", "v1");
      assert.equal(await newCache.get(testKey), undefined);
    });
    it("should return undefined if the key is present under a different version", async () => {
      const newCache = new ObjectCache<string>(cachePath, "test", "v2");
      assert.equal(await newCache.get(testKey), undefined);
    });
  });

  describe("set", () => {
    it("should set the value if the key is not present", async () => {
      const randomKey = randomUUID();
      assert.equal(await cache.get(randomKey), undefined);
      await cache.set(randomKey, "randomValue");
      assert.equal(await cache.get(randomKey), "randomValue");
    });
    it("should overwrite the value if the key is present", async () => {
      const randomKey = randomUUID();
      await cache.set(randomKey, "randomValue");
      assert.equal(await cache.get(randomKey), "randomValue");
      await cache.set(randomKey, "newRandomValue");
      assert.equal(await cache.get(randomKey), "newRandomValue");
    });
  });

  describe("clean", () => {
    it("should remove nothing with the default settings", async () => {
      const filesBefore = await getAllFilesMatching(cachePath);
      assert.notDeepEqual(filesBefore, []);
      await cache.clean();
      const filesAfter = await getAllFilesMatching(cachePath);
      assert.deepEqual(filesAfter, filesBefore);
    });

    it("should remove everything with the max age set to -1", async () => {
      const filesBefore = await getAllFilesMatching(cachePath);
      assert.notDeepEqual(filesBefore, []);
      // NOTE: -1 is not enough on Windows for some reason. Maybe there is some
      // delay in how the access time is set on files on creation?
      await cache.clean(-100);
      const filesAfter = await getAllFilesMatching(cachePath);
      assert.deepEqual(filesAfter, []);
    });

    it("should remove everything with the max size set to -1", async () => {
      const filesBefore = await getAllFilesMatching(cachePath);
      assert.notDeepEqual(filesBefore, []);
      await cache.clean(undefined, -1);
      const filesAfter = await getAllFilesMatching(cachePath);
      assert.deepEqual(filesAfter, []);
    });

    it("should remove something with the max age set to some value", async () => {
      await cache.set(randomUUID(), testValue);
      const filesBefore = await getAllFilesMatching(cachePath);
      assert.notDeepEqual(filesBefore, []);
      await cache.clean(
        new Date().getTime() -
          (await getAccessTime(filesBefore[0])).getTime() -
          1,
      );
      const filesAfter = await getAllFilesMatching(cachePath);
      // NOTE: It would be nice to check whether we removed some but not all files,
      // but that check has proven to be flaky, especially on Intel macOS, due to
      // its heavy reliance on timing of the operations.
      assert.notDeepEqual(filesAfter, filesBefore);
    });

    it("should remove something with the max size set to some value", async () => {
      await cache.set(randomUUID(), testValue);
      const filesBefore = await getAllFilesMatching(cachePath);
      assert.notDeepEqual(filesBefore, []);
      await cache.clean(undefined, (await getFileSize(filesBefore[0])) * 1.5);
      const filesAfter = await getAllFilesMatching(cachePath);
      assert.notDeepEqual(filesAfter, []);
      assert.notDeepEqual(filesAfter, filesBefore);
    });
  });
});
