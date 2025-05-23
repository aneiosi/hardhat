import { buildModule } from "@nomicfoundation/ignition-core";
import { assert } from "chai";

import { useEphemeralIgnitionProject } from "../test-helpers/use-ignition-project.js";

describe("gas estimation", function () {
  useEphemeralIgnitionProject("minimal");

  it("should throw with simulation error if sender account has less ETH than gas estimate", async function () {
    const moduleDefinition = buildModule("FooModule", (m) => {
      const foo = m.contract("Fails");

      return { foo };
    });

    await this.connection.provider.request({
      method: "hardhat_setBalance",
      params: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x1"],
    });

    await assert.isRejected(
      this.ignition.deploy(moduleDefinition),
      /Simulating the transaction failed with error: Reverted with reason "Constructor failed"/,
    );
  });
});
