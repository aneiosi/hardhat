import type { IgnitionModule, IgnitionModuleResult } from "./types/module.js";

import { Batcher } from "./internal/batcher.js";
import { deploymentStateReducer } from "./internal/execution/reducers/deployment-state-reducer.js";

/**
 * Provides a array of batches, where each batch is an array of futureIds,
 * based on Ignition's batching algorithm, assuming a the module is being
 * run from as a fresh deployment.
 *
 * @param ignitionModule - the Ignition module to be get batch information for
 * @returns the batches Ignition will use for the module
 *
 * @beta
 */
export function batches(
  ignitionModule: IgnitionModule<string, string, IgnitionModuleResult<string>>,
): string[][] {
  const deploymentState = deploymentStateReducer(undefined);

  return Batcher.batch(ignitionModule, deploymentState);
}
