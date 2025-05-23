import type { HardhatPlugin } from "../../../types/plugins.js";

import { task } from "../../core/config.js";

const hardhatPlugin: HardhatPlugin = {
  id: "builtin:clean",
  tasks: [
    task("clean", "Clears the cache and deletes all artifacts")
      .addFlag({
        name: "global",
        description: "Clear the global cache",
      })
      .setAction(import.meta.resolve("./task-action.js"))
      .build(),
  ],
  npmPackage: "hardhat",
};

export default hardhatPlugin;
