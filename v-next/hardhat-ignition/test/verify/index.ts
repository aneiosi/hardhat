import { assert } from "chai";

import { useEphemeralIgnitionProject } from "../test-helpers/use-ignition-project.js";

// TODO: HH3 Bring back with Hardhat Verify
describe.skip("verify", function () {
  describe("when there is no etherscan API key configured", function () {
    useEphemeralIgnitionProject("verify-no-api-key");

    it("should throw in the verify task", async function () {
      await assert.isRejected(
        this.hre.tasks.getTask(["ignition", "verify"]).run({
          deploymentId: "test",
        }),
        /No etherscan API key configured/,
      );
    });

    it("should throw in the deploy task", async function () {
      await assert.isRejected(
        this.hre.tasks.getTask(["ignition", "deploy"]).run({
          modulePath: "any",
          verify: true,
        }),
        /No etherscan API key configured/,
      );
    });
  });
});
